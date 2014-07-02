#include "config.h"

#include <QDir>
#include <QFileInfo>
#include <QWebPage>
#include <QWebFrame>
#include <QNetworkProxy>
#include <iostream>

Config::Config(QObject *parent)
    : QObject(parent)
{
    resetToDefaults();
}


bool Config::autoLoadImages() const
{
    return m_autoLoadImages;
}

void Config::setAutoLoadImages(const bool value)
{
    m_autoLoadImages = value;
}

QString Config::cookiesFile() const
{
    return m_cookiesFile;
}

void Config::setCookiesFile(const QString &value)
{
    m_cookiesFile = value;
}

QString Config::offlineStoragePath() const
{
    return m_offlineStoragePath;
}

void Config::setOfflineStoragePath(const QString &value)
{
    QDir dir(value);
    m_offlineStoragePath = dir.absolutePath();
}

int Config::offlineStorageDefaultQuota() const
{
    return m_offlineStorageDefaultQuota;
}

void Config::setOfflineStorageDefaultQuota(int offlineStorageDefaultQuota)
{
    m_offlineStorageDefaultQuota = offlineStorageDefaultQuota * 1024;
}

bool Config::diskCacheEnabled() const
{
    return m_diskCacheEnabled;
}
QString Config::diskCacheFile() const
{
    return m_diskCacheFile;
}
void Config::setDiskCacheFile(QString value)
{
    m_diskCacheFile = value;
}

void Config::setDiskCacheEnabled(const bool value)
{
    m_diskCacheEnabled = value;
}

int Config::maxDiskCacheSize() const
{
    return m_maxDiskCacheSize;
}

void Config::setMaxDiskCacheSize(int maxDiskCacheSize)
{
    m_maxDiskCacheSize = maxDiskCacheSize;
}

bool Config::ignoreSslErrors() const
{
    return m_ignoreSslErrors;
}

void Config::setIgnoreSslErrors(const bool value)
{
    m_ignoreSslErrors = value;
}

bool Config::localToRemoteUrlAccessEnabled() const
{
    return m_localToRemoteUrlAccessEnabled;
}

void Config::setLocalToRemoteUrlAccessEnabled(const bool value)
{
    m_localToRemoteUrlAccessEnabled = value;
}

QString Config::outputEncoding() const
{
    return m_outputEncoding;
}

void Config::setOutputEncoding(const QString &value)
{
    if (value.isEmpty()) {
        return;
    }

    m_outputEncoding = value;
}

QString Config::proxyType() const
{
    return m_proxyType;
}

void Config::setProxyType(const QString value)
{
    m_proxyType = value;
}

QString Config::proxy() const
{
    return m_proxyHost + ":" + QString::number(m_proxyPort);
}

void Config::setProxy(const QString &value)
{
    QUrl proxyUrl = QUrl::fromUserInput(value);

    if (proxyUrl.isValid()) {
        setProxyHost(proxyUrl.host());
        setProxyPort(proxyUrl.port(1080));
    }
}

void Config::setProxyAuth(const QString &value)
{
    QString proxyUser = value;
    QString proxyPass = "";

    if (proxyUser.lastIndexOf(':') > 0) {
        proxyPass = proxyUser.mid(proxyUser.lastIndexOf(':') + 1).trimmed();
        proxyUser = proxyUser.left(proxyUser.lastIndexOf(':')).trimmed();

        setProxyAuthUser(proxyUser);
        setProxyAuthPass(proxyPass);
    }
}

QString Config::proxyAuth() const
{
    return proxyAuthUser() + ":" + proxyAuthPass();
}

QString Config::proxyAuthUser() const
{
    return m_proxyAuthUser;
}

QString Config::proxyAuthPass() const
{
    return m_proxyAuthPass;
}

QString Config::proxyHost() const
{
    return m_proxyHost;
}

int Config::proxyPort() const
{
    return m_proxyPort;
}

QStringList Config::scriptArgs() const
{
    return m_scriptArgs;
}

void Config::setScriptArgs(const QStringList &value)
{
    m_scriptArgs.clear();

    QStringListIterator it(value);
    while (it.hasNext()) {
        m_scriptArgs.append(it.next());
    }
}

QString Config::scriptEncoding() const
{
    return m_scriptEncoding;
}

void Config::setScriptEncoding(const QString &value)
{
    if (value.isEmpty()) {
        return;
    }

    m_scriptEncoding = value;
}

QString Config::scriptLanguage() const
{
    return m_scriptLanguage;
}

void Config::setScriptLanguage(const QString &value)
{
    if (value.isEmpty()) {
        return;
    }

    m_scriptLanguage = value;
}

QString Config::scriptFile() const
{
    return m_scriptFile;
}

void Config::setScriptFile(const QString &value)
{
    m_scriptFile = value;
}

QString Config::unknownOption() const
{
    return m_unknownOption;
}

void Config::setUnknownOption(const QString &value)
{
    m_unknownOption = value;
}

bool Config::versionFlag() const
{
    return m_versionFlag;
}

void Config::setVersionFlag(const bool value)
{
    m_versionFlag = value;
}

bool Config::debug() const
{
    return m_debug;
}

void Config::setDebug(const bool value)
{
    m_debug = value;
}

int Config::remoteDebugPort() const
{
    return m_remoteDebugPort;
}

void Config::setRemoteDebugPort(const int port)
{
    m_remoteDebugPort = port;
}

bool Config::remoteDebugAutorun() const
{
    return m_remoteDebugAutorun;
}

void Config::setRemoteDebugAutorun(const bool value)
{
    m_remoteDebugAutorun = value;
}

bool Config::webSecurityEnabled() const
{
    return m_webSecurityEnabled;
}

void Config::setWebSecurityEnabled(const bool value)
{
    m_webSecurityEnabled = value;
}

void Config::setJavascriptCanOpenWindows(const bool value)
{
    m_javascriptCanOpenWindows = value;
}

bool Config::javascriptCanOpenWindows() const
{
    return m_javascriptCanOpenWindows;
}

void Config::setJavascriptCanCloseWindows(const bool value)
{
    m_javascriptCanCloseWindows = value;
}

bool Config::javascriptCanCloseWindows() const
{
    return m_javascriptCanCloseWindows;
}

void Config::setWebdriver(const QString &webdriverConfig)
{
    // Parse and validate the configuration
    bool isValidPort;
    QStringList wdCfg = webdriverConfig.split(':');
    if (wdCfg.length() == 1 && wdCfg[0].toInt(&isValidPort) && isValidPort) {
        // Only a PORT was provided
        m_webdriverPort = wdCfg[0];
    } else if(wdCfg.length() == 2 && !wdCfg[0].isEmpty() && wdCfg[1].toInt(&isValidPort) && isValidPort) {
        // Both IP and PORT provided
        m_webdriverIp = wdCfg[0];
        m_webdriverPort = wdCfg[1];
    }
}

QString Config::webdriver() const
{
    return QString("%1:%2").arg(m_webdriverIp).arg(m_webdriverPort);
}

bool Config::isWebdriverMode() const
{
    return !m_webdriverPort.isEmpty();
}

void Config::setWebdriverLogFile(const QString& webdriverLogFile)
{
    m_webdriverLogFile = webdriverLogFile;
}

QString Config::webdriverLogFile() const
{
    return m_webdriverLogFile;
}

void Config::setWebdriverLogLevel(const QString& webdriverLogLevel)
{
    m_webdriverLogLevel = webdriverLogLevel;
}

QString Config::webdriverLogLevel() const
{
    return m_webdriverLogLevel;
}

void Config::setWebdriverSeleniumGridHub(const QString &hubUrl)
{
    m_webdriverSeleniumGridHub = hubUrl;
}

QString Config::webdriverSeleniumGridHub() const
{
    return m_webdriverSeleniumGridHub;
}

// private:
void Config::resetToDefaults()
{
    m_autoLoadImages = true;
    m_cookiesFile = QString();
    m_offlineStoragePath = QString();
    m_offlineStorageDefaultQuota = -1;
    m_diskCacheEnabled = false;
    m_maxDiskCacheSize = -1;
    m_ignoreSslErrors = false;
    m_localToRemoteUrlAccessEnabled = false;
    m_outputEncoding = "UTF-8";
    m_proxyType = "http";
    m_proxyHost.clear();
    m_proxyPort = 1080;
    m_proxyAuthUser.clear();
    m_proxyAuthPass.clear();
    m_scriptArgs.clear();
    m_scriptEncoding = "UTF-8";
    m_scriptLanguage.clear();
    m_scriptFile.clear();
    m_unknownOption.clear();
    m_versionFlag = false;
    m_debug = false;
    m_remoteDebugPort = -1;
    m_remoteDebugAutorun = false;
    m_webSecurityEnabled = true;
    m_javascriptCanOpenWindows = true;
    m_javascriptCanCloseWindows = true;
    m_helpFlag = false;
    m_printDebugMessages = false;
    m_sslProtocol = "sslv3";
    m_sslCertificatesPath.clear();
    m_webdriverIp = QString();
    m_webdriverPort = QString();
    m_webdriverLogFile = QString();
    m_webdriverLogLevel = "INFO";
    m_webdriverSeleniumGridHub = QString();
}

void Config::setProxyAuthPass(const QString &value)
{
    m_proxyAuthPass = value;
}

void Config::setProxyAuthUser(const QString &value)
{
    m_proxyAuthUser = value;
}

void Config::setProxyHost(const QString &value)
{
    m_proxyHost = value;
}

void Config::setProxyPort(const int value)
{
    m_proxyPort = value;
}

bool Config::helpFlag() const
{
    return m_helpFlag;
}

void Config::setHelpFlag(const bool value)
{
    m_helpFlag = value;
}

bool Config::printDebugMessages() const
{
    return m_printDebugMessages;
}

void Config::setPrintDebugMessages(const bool value)
{
    m_printDebugMessages = value;
}

QString Config::sslProtocol() const
{
    return m_sslProtocol;
}

void Config::setSslProtocol(const QString& sslProtocolName)
{
    m_sslProtocol = sslProtocolName.toLower();
}

QString Config::sslCertificatesPath() const
{
    return m_sslCertificatesPath;
}

void Config::setSslCertificatesPath(const QString& sslCertificatesPath)
{
    QFileInfo sslPathInfo = QFileInfo(sslCertificatesPath);
    if (sslPathInfo.isDir()) {
        if (sslCertificatesPath.endsWith('/'))
            m_sslCertificatesPath = sslCertificatesPath + "*";
        else
            m_sslCertificatesPath = sslCertificatesPath + "/*";
    } else {
        m_sslCertificatesPath = sslCertificatesPath;
    }
}
