#include "webpage.h"
#include "consts.h"
#include "terminal.h"
#include <QWebFrame>
#include <QDesktopServices>
#include "system.h"
#include "application.h"
#include "networkaccessmanager.h"
WebPage::WebPage(QWidget *parent ):
    QWebPage(parent){
    //init var
    Config* config = Application::instance()->config();
    CookieJar* cookiejar = Application::instance()->cookiejar();

	//init network
    NetworkAccessManager* networkaccessmanager = new NetworkAccessManager(config,this);
    if( cookiejar != NULL )
        networkaccessmanager->setCookieJar(cookiejar);
    setNetworkAccessManager(networkaccessmanager);

    //init attribute
    setForwardUnsupportedContent(true);
    settings()->setAttribute(QWebSettings::AutoLoadImages, true);
    settings()->setAttribute(QWebSettings::JavascriptCanOpenWindows, false);
    settings()->setAttribute(QWebSettings::JavascriptCanCloseWindows,true);
    settings()->setAttribute(QWebSettings::JavascriptEnabled,true);
    settings()->setAttribute(QWebSettings::PluginsEnabled,true);
    settings()->setAttribute(QWebSettings::OfflineStorageDatabaseEnabled, true);
    if (config->offlineStoragePath().isEmpty() == false ) {
        settings()->setOfflineStoragePath(config->offlineStoragePath());
    }
    if (config->offlineStorageDefaultQuota() > 0) {
        settings()->setOfflineStorageDefaultQuota(config->offlineStorageDefaultQuota());
    }
    //settings()->setAttribute(QWebSettings::OfflineWebApplicationCacheEnabled, true);
    //settings()->setOfflineWebApplicationCachePath(QDesktopServices::storageLocation(QDesktopServices::DataLocation));
    settings()->setAttribute(QWebSettings::FrameFlatteningEnabled, true);
    settings()->setAttribute(QWebSettings::LocalStorageEnabled, true);
    //settings()->setLocalStoragePath(QDesktopServices::storageLocation(QDesktopServices::DataLocation));

    //init show attribute
    QPalette palette = this->palette();
    palette.setBrush(QPalette::Base, Qt::transparent);
    setPalette(palette);
    //mainFrame()->setScrollBarPolicy(Qt::Horizontal, Qt::ScrollBarAlwaysOff);
    //mainFrame()->setScrollBarPolicy(Qt::Vertical, Qt::ScrollBarAlwaysOff);

    //init callback
    connect(mainFrame(), SIGNAL(javaScriptWindowObjectCleared()),SIGNAL(javaScriptWindowObjectCleared()));
}
void WebPage::setBlankContent(){
    mainFrame()->setHtml(BLANK_HTML);
}

void WebPage::setNetworkAccessManager( QNetworkAccessManager* networkaccessmanager ){
	QWebPage::setNetworkAccessManager(networkaccessmanager);
}
QNetworkAccessManager* WebPage::networkAccessManager(){
	return QWebPage::networkAccessManager();
}
QVariant WebPage::evaluateJavaScript( const QString& code ){
	return mainFrame()->evaluateJavaScript( code );
}
void WebPage::addToJavaScriptWindowObject( const QString & name, QObject * object ){
	mainFrame()->addToJavaScriptWindowObject( name , object );
}
void WebPage::setContent( const QString& htmlContent ){
    mainFrame()->setHtml(htmlContent, "file:///"+System::instance()->currentPath()+"/");
}
void WebPage::javaScriptConsoleMessage(const QString &message, int lineNumber, const QString &sourceID){
    Terminal::instance()->cout(message);
}
void WebPage::javaScriptAlert(QWebFrame *originatingFrame, const QString &msg){
    Terminal::instance()->cout(msg);
}
bool WebPage::javaScriptConfirm(QWebFrame *originatingFrame, const QString &msg){
    return true;
}
bool WebPage::javaScriptPrompt(QWebFrame *originatingFrame, const QString &msg, const QString &defaultValue, QString *result){
    return true;
}
