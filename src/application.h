#ifndef APPLICATION_H
#define APPLICATION_H

#include <QObject>
#include <QApplication>
#include <QWindow>
#include <QMainWindow>
#include <QWidget>
#include <Qlist>
#include "WebPage.h"
#include "Window.h"
#include "terminal.h"
#include "commandline.h"
#include "config.h"
#include "cookiejar.h"
class Application : public QObject
{
    Q_OBJECT
public:
    Application(int argc, char *argv[],QObject *parent = 0);
    ~Application();
public:
	static Application* instance();
    int exec();	

public slots:
    //!important 对于js接口，非基础类型，返回值必须为QObject*
    QObject* _getTerminal();
    QObject* _getCommandLine();
    QObject* _getSystem( );
    QObject* _createWindow( );
    void _exit( int returnValue );

public slots:
    QString cookiesFile() const;
    void setCookiesFile(const QString &cookiesFile);

    QString offlineStoragePath() const;
    void setOfflineStoragePath(const QString &value);

    int offlineStorageDefaultQuota() const;
    void setOfflineStorageDefaultQuota(int offlineStorageDefaultQuota);

    QString diskCacheFile() const;
    void setDiskCacheFile(QString value);

    int maxDiskCacheSize() const;
    void setMaxDiskCacheSize(int maxDiskCacheSize);

public:
    CookieJar* cookiejar();
    Config* config();

private slots:
    void onInitialized();

private:
	static Application* m_instance;
    QApplication m_application;
	int m_retCode;
	bool m_isRun;
    Config* m_globalConfig;
    CookieJar* m_cookiejar;
	WebPage* m_page;
    QList<Window*> m_windowList;
    QString m_scriptSourceCode;
};

#endif // APPLICATION_H
