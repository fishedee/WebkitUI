#ifndef WEBPAGE_H
#define WEBPAGE_H

#include <QWebPage>
#include <QNetworkAccessManager>
#include <QNetworkCookieJar>
#include "config.h"
class WebPage : public QWebPage
{
    Q_OBJECT
public:
    explicit WebPage(const QString& baseUrl ,QWidget *parent = 0 );
    void setNetworkAccessManager( QNetworkAccessManager* networkaccessmanager );
    QNetworkAccessManager* networkAccessManager();
	QVariant evaluateJavaScript( const QString& code );
	void addToJavaScriptWindowObject( const QString & name, QObject * object );
	void setContent( const QString& htmlContent ,const QString& baseUrl );
public:
    void setBlankContent();
signals:
    void javaScriptWindowObjectCleared();
public slots:
    void javaScriptAlert(QWebFrame *originatingFrame, const QString &msg);
    bool javaScriptConfirm(QWebFrame *originatingFrame, const QString &msg);
    bool javaScriptPrompt(QWebFrame *originatingFrame, const QString &msg, const QString &defaultValue, QString *result);
    void javaScriptConsoleMessage(const QString &message, int lineNumber, const QString &sourceID);
};

#endif // WEBPAGE_H
