#include <QAuthenticator>
#include <QDateTime>
#include <QDesktopServices>
#include <QNetworkDiskCache>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QSslSocket>
#include <QSslCertificate>
#include <QRegExp>

#include "config.h"
#include "cookiejar.h"
#include "networkaccessmanager.h"
#include "application.h"
#include <iostream>
#include <QFile>
#include "system.h"

// 10 MB
const qint64 MAX_REQUEST_POST_BODY_SIZE = 10 * 1000 * 1000;

static const char *toString(QNetworkAccessManager::Operation op)
{
    const char *str = 0;
    switch (op) {
    case QNetworkAccessManager::HeadOperation:
        str = "HEAD";
        break;
    case QNetworkAccessManager::GetOperation:
        str = "GET";
        break;
    case QNetworkAccessManager::PutOperation:
        str = "PUT";
        break;
    case QNetworkAccessManager::PostOperation:
        str = "POST";
        break;
    case QNetworkAccessManager::DeleteOperation:
        str = "DELETE";
        break;
    default:
        str = "?";
        break;
    }
    return str;
}

TimeoutTimer::TimeoutTimer(QObject* parent)
    : QTimer(parent)
{
}


JsNetworkRequest::JsNetworkRequest(QNetworkRequest* request, QObject* parent)
    : QObject(parent)
{
    m_networkRequest = request;
}

void JsNetworkRequest::abort()
{
    if (m_networkRequest) {
        m_networkRequest->setUrl(QUrl());
    }
}

bool JsNetworkRequest::setHeader(const QString& name, const QVariant& value)
{
    if (!m_networkRequest)
        return false;

    // Pass `null` as the second argument to remove a HTTP header
    m_networkRequest->setRawHeader(name.toLatin1(), value.toByteArray());
    return true;
}

void JsNetworkRequest::changeUrl(const QString& address)
{
    if (m_networkRequest) {
        QUrl url = QUrl::fromEncoded(QByteArray(address.toLatin1()));
        m_networkRequest->setUrl(url);
    }
}

// public:
NetworkAccessManager::NetworkAccessManager(const Config *config,QObject *parent )
    : QNetworkAccessManager(parent)
    , m_ignoreSslErrors(config->ignoreSslErrors())
    , m_authAttempts(0)
    , m_maxAuthAttempts(3)
    , m_resourceTimeout(0)
    , m_idCounter(0)
    , m_networkDiskCache(0)
    , m_sslConfiguration(QSslConfiguration::defaultConfiguration())
{
    if (config->diskCacheFile().isEmpty() == false ) {
        m_networkDiskCache = new QNetworkDiskCache(this);
        m_networkDiskCache->setCacheDirectory(config->diskCacheFile());
        if (config->maxDiskCacheSize() >= 0)
            m_networkDiskCache->setMaximumCacheSize(config->maxDiskCacheSize() * 1024);
        setCache(m_networkDiskCache);
    }
    m_sslConfiguration = QSslConfiguration::defaultConfiguration();
    m_sslConfiguration.setPeerVerifyMode(QSslSocket::VerifyNone);
    m_sslConfiguration.setProtocol(QSsl::SslV3);
    m_sslConfiguration.setProtocol(QSsl::SslV3);

    connect(this, SIGNAL(authenticationRequired(QNetworkReply*,QAuthenticator*)), SLOT(provideAuthentication(QNetworkReply*,QAuthenticator*)));
    connect(this, SIGNAL(finished(QNetworkReply*)), SLOT(handleFinished(QNetworkReply*)));
}

void NetworkAccessManager::setUserName(const QString &userName)
{
    m_userName = userName;
}

void NetworkAccessManager::setPassword(const QString &password)
{
    m_password = password;
}

void NetworkAccessManager::setResourceTimeout(int resourceTimeout)
{
    m_resourceTimeout = resourceTimeout;
}

void NetworkAccessManager::setMaxAuthAttempts(int maxAttempts)
{
    m_maxAuthAttempts = maxAttempts;
}

void NetworkAccessManager::setCustomHeaders(const QVariantMap &headers)
{
    m_customHeaders = headers;
}

QVariantMap NetworkAccessManager::customHeaders() const
{
    return m_customHeaders;
}

void NetworkAccessManager::setCookieJar(QNetworkCookieJar *cookieJar)
{
    QNetworkAccessManager::setCookieJar(cookieJar);
    // Remove NetworkAccessManager's ownership of this CookieJar and
    // pass it to the PhantomJS Singleton object.
    // CookieJar is shared between multiple instances of NetworkAccessManager.
    // It shouldn't be deleted when the NetworkAccessManager is deleted, but
    // only when close is called on the cookie jar.
    cookieJar->setParent(Application::instance());
}

// protected:
QNetworkReply *NetworkAccessManager::createRequest(Operation op, const QNetworkRequest & request, QIODevice * outgoingData)
{
    QNetworkRequest req(request);

    if( request.url().isLocalFile() ){
        QFile file;
        file.setFileName(request.url().toLocalFile());
        if( file.exists() == false ){
            req.setUrl(QUrl("file:///"+System::instance()->currentPath()+"/"+request.url().toLocalFile()));
        }
    }

    if (!QSslSocket::supportsSsl()) {
        if (req.url().scheme().toLower() == QLatin1String("https"))
            qWarning() << "Request using https scheme without SSL support";
    } else {
        req.setSslConfiguration(m_sslConfiguration);
    }

    // Get the URL string before calling the superclass. Seems to work around
    // segfaults in Qt 4.8: https://gist.github.com/1430393
    QByteArray url = req.url().toEncoded();
    QByteArray postData;

    // http://code.google.com/p/phantomjs/issues/detail?id=337
    if (op == QNetworkAccessManager::PostOperation) {
        if (outgoingData) postData = outgoingData->peek(MAX_REQUEST_POST_BODY_SIZE);
        QString contentType = req.header(QNetworkRequest::ContentTypeHeader).toString();
        if (contentType.isEmpty()) {
            req.setHeader(QNetworkRequest::ContentTypeHeader, "application/x-www-form-urlencoded");
        }
    }

    // set custom HTTP headers
    QVariantMap::const_iterator i = m_customHeaders.begin();
    while (i != m_customHeaders.end()) {
        req.setRawHeader(i.key().toLatin1(), i.value().toByteArray());
        ++i;
    }

    m_idCounter++;

    QVariantList headers;
    foreach (QByteArray headerName, req.rawHeaderList()) {
        QVariantMap header;
        header["name"] = QString::fromUtf8(headerName);
        header["value"] = QString::fromUtf8(req.rawHeader(headerName));
        headers += header;
    }

    QVariantMap data;
    data["id"] = m_idCounter;
    data["url"] = url.data();
    data["method"] = toString(op);
    data["headers"] = headers;
    if (op == QNetworkAccessManager::PostOperation) data["postData"] = postData.data();
    data["time"] = QDateTime::currentDateTime();

    JsNetworkRequest jsNetworkRequest(&req, this);
    emit resourceRequested(data, &jsNetworkRequest);

    // Pass duty to the superclass - Nothing special to do here (yet?)
    QNetworkReply *reply = QNetworkAccessManager::createRequest(op, req, outgoingData);

    // reparent jsNetworkRequest to make sure that it will be destroyed with QNetworkReply
    jsNetworkRequest.setParent(reply);

    // If there is a timeout set, create a TimeoutTimer
    if(m_resourceTimeout > 0){

        TimeoutTimer *nt = new TimeoutTimer(reply);
        nt->reply = reply; // We need the reply object in order to abort it later on.
        nt->data = data;
        nt->setInterval(m_resourceTimeout);
        nt->setSingleShot(true);
        nt->start();

        connect(nt, SIGNAL(timeout()), this, SLOT(handleTimeout()));
    }

    m_ids[reply] = m_idCounter;

    connect(reply, SIGNAL(readyRead()), this, SLOT(handleStarted()));
    connect(reply, SIGNAL(sslErrors(const QList<QSslError> &)), this, SLOT(handleSslErrors(const QList<QSslError> &)));
    connect(reply, SIGNAL(error(QNetworkReply::NetworkError)), this, SLOT(handleNetworkError()));

    return reply;
}

void NetworkAccessManager::handleTimeout()
{
    TimeoutTimer *nt = qobject_cast<TimeoutTimer*>(sender());

    if(!nt->reply)
        return;

    nt->data["errorCode"] = 408;
    nt->data["errorString"] = "Network timeout on resource.";

    emit resourceTimeout(nt->data);

    // Abort the reply that we attached to the Network Timeout
    nt->reply->abort();
}

void NetworkAccessManager::handleStarted()
{
    QNetworkReply *reply = qobject_cast<QNetworkReply*>(sender());

    if (!reply)
        return;
    if (m_started.contains(reply))
        return;

    m_started += reply;

    QVariantList headers;
    foreach (QByteArray headerName, reply->rawHeaderList()) {
        QVariantMap header;
        header["name"] = QString::fromUtf8(headerName);
        header["value"] = QString::fromUtf8(reply->rawHeader(headerName));
        headers += header;
    }
    QVariantMap data;
    QByteArray bytes;
    if( reply->size() < 1024 * 1024 * 2 ){
        //少于2M的数据
        bytes = reply->peek( reply->size() );
        data["data"] = QString::fromUtf8(bytes.data());
    }else{
        //大于2M的数据
        data["data"] = "";
    }
    data["stage"] = "start";
    data["id"] = m_ids.value(reply);
    data["url"] = reply->url().toEncoded().data();
    data["status"] = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute);
    data["statusText"] = reply->attribute(QNetworkRequest::HttpReasonPhraseAttribute);
    data["contentType"] = reply->header(QNetworkRequest::ContentTypeHeader);
    data["bodySize"] = reply->size();
    data["redirectURL"] = reply->header(QNetworkRequest::LocationHeader);
    data["headers"] = headers;
    data["time"] = QDateTime::currentDateTime();

    emit resourceReceived(data);
}

void NetworkAccessManager::handleFinished(QNetworkReply *reply)
{
    if (!m_ids.contains(reply))
        return;

    QVariant status = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute);
    QVariant statusText = reply->attribute(QNetworkRequest::HttpReasonPhraseAttribute);

    this->handleFinished(reply, status, statusText);
}

void NetworkAccessManager::provideAuthentication(QNetworkReply *reply, QAuthenticator *authenticator)
{
    if (m_authAttempts++ < m_maxAuthAttempts)
    {
        authenticator->setUser(m_userName);
        authenticator->setPassword(m_password);
    }
    else
    {
        m_authAttempts = 0;
        this->handleFinished(reply, 401, "Authorization Required");
        reply->close();
    }
}

void NetworkAccessManager::handleFinished(QNetworkReply *reply, const QVariant &status, const QVariant &statusText)
{
    QVariantList headers;
    foreach (QByteArray headerName, reply->rawHeaderList()) {
        QVariantMap header;
        header["name"] = QString::fromUtf8(headerName);
        header["value"] = QString::fromUtf8(reply->rawHeader(headerName));
        headers += header;
    }

    QVariantMap data;

    data["stage"] = "end";
    data["id"] = m_ids.value(reply);
    data["url"] = reply->url().toEncoded().data();
    data["status"] = status;
    data["statusText"] = statusText;
    data["contentType"] = reply->header(QNetworkRequest::ContentTypeHeader);
    data["redirectURL"] = reply->header(QNetworkRequest::LocationHeader);
    data["headers"] = headers;
    data["time"] = QDateTime::currentDateTime();

    m_ids.remove(reply);
    m_started.remove(reply);

    emit resourceReceived(data);
}

void NetworkAccessManager::handleSslErrors(const QList<QSslError> &errors)
{
    QNetworkReply *reply = qobject_cast<QNetworkReply*>(sender());
    foreach (QSslError e, errors) {
        qDebug() << "Network - SSL Error:" << e;
    }

    if (m_ignoreSslErrors)
        reply->ignoreSslErrors();
}

void NetworkAccessManager::handleNetworkError()
{
    QNetworkReply *reply = qobject_cast<QNetworkReply*>(sender());
    qDebug() << "Network - Resource request error:"
             << reply->error()
             << "(" << reply->errorString() << ")"
             << "URL:" << reply->url().toString();

    QVariantMap data;
    data["id"] = m_ids.value(reply);
    data["url"] = reply->url().toString();
    data["errorCode"] = reply->error();
    data["errorString"] = reply->errorString();

    emit resourceError(data);
}
