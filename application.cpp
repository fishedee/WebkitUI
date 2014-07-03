#include "application.h"
#include "util.h"
#include "url.h"
#include <iostream>
#include <QWebFrame>
#include "consts.h"
using namespace std;
Application* Application::m_instance;
Application::Application(int argc, char *argv[],QObject *parent) :
    QObject(parent){
    bool isOk;
	//初始化变量
	m_instance = this;
	m_isRun = true;
	m_retCode = 0;
	//初始化QApplication
	m_application = new QApplication(argc,argv);
	//初始化CommandLine
	CommandLine::instance()->init(argc,argv);
	//初始化脚本
    if( argc < 2 ){
        Terminal::instance()->cerr("Please Input Script File");
		exit(1);
        return;
	}
    QString scriptSourceCode;
    isOk = Util::readFile(argv[1],scriptSourceCode);
    if( isOk != true ){
        Terminal::instance()->cerr("Open Script Error,Please Check Script File");
		exit(1);
        return;
	}
	//初始化baseUrl
	QString baseUrl;
    isOk = Url::dirname( argv[1] ,baseUrl );
    if( isOk != true ){
        Terminal::instance()->cerr("Get Script Dirname Error,Please Check Script File");
		exit(1);
        return;
	}
    cout<< baseUrl.toStdString()<<endl;
	//初始化WebPage
    m_page = new WebPage( baseUrl );
    connect(m_page, SIGNAL(javaScriptWindowObjectCleared()),this,SLOT(onInitialized()));
    //执行空白页面
    //!important 必须先挂载所有回调，才开始载入页面
    m_page->setBlankContent();
}
Application* Application::instance(){
    return m_instance;
}
Terminal* Application::_getTerminal(){
    return Terminal::instance();
}
CommandLine* Application::_getCommandLine(){
    return CommandLine::instance();
}
void Application::onInitialized(){
    qDebug() << "Application - onInitialized";
	//在js环境中初始化本对象
    m_page->addToJavaScriptWindowObject("application", this);
    //在js环境中初始化js环境
    m_page->evaluateJavaScript(Util::readResourceFileUtf8(":/bootstrap.js"));
}
Window* Application::_createWindow( ){
    return new Window(1,NULL);
}
void Application::exit( int retCode ){
	m_isRun = false;
	m_retCode = retCode;
	m_application->exit(retCode);
}
int Application::exec(){
	if( m_isRun == false )
		return m_retCode;
    qDebug() << "Application - EventLoop Begin";
    m_application->exec();
    qDebug() << "Application - EventLoop End";
	return m_retCode;
}
