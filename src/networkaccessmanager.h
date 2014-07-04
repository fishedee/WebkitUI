#ifndef NETWORKACCESSMANAGER_H
#define NETWORKACCESSMANAGER_H

#include <QAuthenticator>
#include <QHash>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QSet>
#include <QSslConfiguration>
#include <QTimer>

class Config;
class QNetworkDiskCache;
class QSslConfiguration;

class TimeoutTimer : public QTimer
{
    Q_OBJECT

public:
    TimeoutTimer(QObject *parent = 0);
    QNetworkReply *reply;
    QVariantMap data;
};

class JsNetworkRequest : public QObject
{
    Q_OBJECT

public:
    JsNetworkRequest(QNetworkRequest* request, QObject* parent = 0);
    Q_INVOKABLE void abort();
    Q_INVOKABLE void changeUrl(const QString& url);
    Q_INVOKABLE bool setHeader(const QString& name, const QVariant& value);

private:
    QNetworkRequest* m_networkRequest;
};

class NetworkAccessManager : public QNetworkAccessManager
{
    Q_OBJECT
public:
    NetworkAccessManager(const Config *config,QObject *parent );
    void setUserName(const QString &userName);
    void setPassword(const QString &password);
    void setMaxAuthAttempts(int maxAttempts);
    void setResourceTimeout(int resourceTimeout);
    void setCustomHeaders(const QVariantMap &headers);
    QVariantMap customHeaders() const;

    void setCookieJar(QNetworkCookieJar *cookieJar);

protected:
    bool m_ignoreSslErrors;
    int m_authAttempts;
    int m_maxAuthAttempts;
    int m_resourceTimeout;
    QString m_userName;
    QString m_password;
    QNetworkReply *createRequest(Operation op, const QNetworkRequest & req, QIODevice * outgoingData = 0);
    void handleFinished(QNetworkReply *reply, const QVariant &status, const QVariant &statusText);

signals:
    void resourceRequested(const QVariant& data, QObject *);
    void resourceReceived(const QVariant& data);
    void resourceError(const QVariant& data);
    void resourceTimeout(const QVariant& data);

private slots:
    void handleStarted();
    void handleFinished(QNetworkReply *reply);
    void provideAuthentication(QNetworkReply *reply, QAuthenticator *authenticator);
    void handleSslErrors(const QList<QSslError> &errors);
    void handleNetworkError();
    void handleTimeout();

private:
    QHash<QNetworkReply*, int> m_ids;
    QSet<QNetworkReply*> m_started;
    int m_idCounter;
    QNetworkDiskCache* m_networkDiskCache;
    QVariantMap m_customHeaders;
    QSslConfiguration m_sslConfiguration;
};

#endif // NETWORKACCESSMANAGER_H
