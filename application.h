#ifndef APPLICATION_H
#define APPLICATION_H

#include <QObject>
#include <QApplication>
#include <QWindow>
#include <QMainWindow>
#include <QWidget>
#include "WebPage.h"
#include "Window.h"
#include "terminal.h"
#include "commandline.h"
class Application : public QObject
{
    Q_OBJECT
public:
    Application(int argc, char *argv[],QObject *parent = 0);
public:
	static Application* instance();
    int exec();	
public slots:
	Terminal* _getTerminal();
	CommandLine* _getCommandLine();
    Window* _createWindow( );
	void exit( int returnValue );
    void onInitialized();
private:
	static Application* m_instance;
	QApplication* m_application;
	int m_retCode;
	bool m_isRun;
	WebPage* m_page;
};

#endif // APPLICATION_H
