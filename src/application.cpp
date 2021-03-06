﻿#include "application.h"
#include "util.h"
#include "url.h"
#include <iostream>
#include <QWebFrame>
#include "consts.h"
#include "system.h"
using namespace std;
Application* Application::m_instance;
Application::Application(int argc, char *argv[],QObject *parent) :
    QObject(parent),m_application(argc,argv){
    bool isOk;
	//init var
	m_instance = this;
	m_isRun = true;
	m_retCode = 0;
    m_cookiejar = NULL;
    //init config
    m_globalConfig = new Config(this);
	//init CommandLine
	CommandLine::instance()->init(argc,argv);
	//init script file
    if( argc < 2 ){
        Terminal::instance()->cerr("Please Input Script File");
        _exit(1);
        return;
	}
    isOk = Util::readFile(argv[1],m_scriptSourceCode);
    if( isOk != true ){
        Terminal::instance()->cerr("Open Script Error,Please Check Script File");
        _exit(1);
        return;
	}
    //init libraryPath
	QString baseUrl;
    isOk = Url::dirname( argv[1] ,baseUrl );
    if( isOk != true ){
        Terminal::instance()->cerr("Get Script Dirname Error,Please Check Script File");
        _exit(1);
        return;
	}
    isOk = System::instance()->setCurrentPath(baseUrl);
    if( isOk != true ){
        Terminal::instance()->cerr("System setCurrentPath Error");
        _exit(1);
        return;
    }
	//init WebPage
    m_page = new WebPage( );
    connect(m_page, SIGNAL(javaScriptWindowObjectCleared()),this,SLOT(onInitialized()));
    //init blank page
    //!important please first set callback then set page
    m_page->setBlankContent();
}
Application::~Application(){
    delete m_page;
    qDeleteAll(m_windowList);
}

Application* Application::instance(){
    return m_instance;
}
QObject* Application::_getTerminal(){
    return Terminal::instance();
}
QObject* Application::_getCommandLine(){
    return CommandLine::instance();
}
QObject* Application::_getSystem( ){
    return System::instance();
}

QObject* Application::_createWindow( ){
    Window* single = new Window(NULL);
    m_windowList.append(single);
    return single;
}
void Application::onInitialized(){
    qDebug() << "Application - onInitialized";
    //init appliaction object in js environment
    m_page->addToJavaScriptWindowObject("application", this);
    //init  js environment
    m_page->evaluateJavaScript(Util::readResourceFileUtf8(":/bootstrap.js"));
    //init  js environment
    m_page->evaluateJavaScript(m_scriptSourceCode);
}
void Application::_exit( int retCode ){
	m_isRun = false;
	m_retCode = retCode;
    m_application.exit(retCode);
}
int Application::exec(){
	if( m_isRun == false )
		return m_retCode;
    qDebug() << "Application - EventLoop Begin";
    m_application.exec();
    qDebug() << "Application - EventLoop End";
	return m_retCode;
}
QString Application::cookiesFile() const{
    return m_globalConfig->cookiesFile();
}
void Application::setCookiesFile(const QString &cookiesFile){
    if( cookiesFile.size() != 0 )
        m_cookiejar = new CookieJar(cookiesFile,this);
    else
        m_cookiejar = NULL;
    return m_globalConfig->setCookiesFile(cookiesFile);
}

QString Application::offlineStoragePath() const{
    return m_globalConfig->offlineStoragePath();
}
void Application::setOfflineStoragePath(const QString &value){
    return m_globalConfig->setOfflineStoragePath(value);
}

int Application::offlineStorageDefaultQuota() const{
    return m_globalConfig->offlineStorageDefaultQuota();
}
void Application::setOfflineStorageDefaultQuota(int offlineStorageDefaultQuota){
    return m_globalConfig->setOfflineStorageDefaultQuota(offlineStorageDefaultQuota);
}

QString Application::diskCacheFile() const{
    return m_globalConfig->diskCacheFile();
}
void Application::setDiskCacheFile(QString value){
    return m_globalConfig->setDiskCacheFile(value);
}

int Application::maxDiskCacheSize() const{
    return m_globalConfig->maxDiskCacheSize();
}
void Application::setMaxDiskCacheSize(int maxDiskCacheSize){
    return m_globalConfig->setMaxDiskCacheSize(maxDiskCacheSize);
}
CookieJar* Application::cookiejar(){
    return m_cookiejar;
}

Config* Application::config(){
    return m_globalConfig;
}
