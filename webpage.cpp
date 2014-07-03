#include "webpage.h"
#include "consts.h"
#include "terminal.h"
#include <QWebFrame>
WebPage::WebPage(const QString& baseUrl ,QWidget *parent ) :
    QWebPage(parent){

    setForwardUnsupportedContent(true);
    settings()->setAttribute(QWebSettings::JavascriptEnabled,true);
    settings()->setAttribute(QWebSettings::PluginsEnabled,true);
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
void WebPage::setContent( const QString& htmlContent ,const QString& baseUrl ){
	mainFrame()->setHtml(htmlContent, baseUrl);
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
