#include "window.h"

#include <QWebView>
#include <QGridLayout>
#include <iostream>
#include <QWebFrame>
#include <QApplication>
#include <QCloseEvent>
#include "application.h"
#include "util.h"
CustomWindow::CustomWindow(QWebView* view , QWidget*parent):
    QMainWindow(parent){
    //设置布局
    QWidget* widget = new QWidget(this);
    QGridLayout *gridLayout = new QGridLayout(widget);
    gridLayout->addWidget(view);
    widget->setLayout(gridLayout);
    setCentralWidget(widget);
    setContentsMargins(0,0,0,0);
    gridLayout->setContentsMargins(QMargins(0,0,0,0));
    setAttribute(Qt::WA_TranslucentBackground, true);
    //setWindowFlags(Qt::FramelessWindowHint);
}
void CustomWindow::setSize( int width , int height ){
    QRect rect = geometry();
    setGeometry( rect.left() , rect.top() , width ,height );
}
void CustomWindow::setPosition(int left , int top){
    QRect rect = geometry();
    setGeometry( left , top , rect.width() ,rect.height() );
}
void CustomWindow::closeEvent ( QCloseEvent * event ){
    emit myCloseEvent();
    event->accept();
}

Window::Window( QWidget *parent) :
    QObject(parent)
{
    m_view = new QWebView();
    m_page = new WebPage(m_view);
    m_view->setPage(m_page);
    m_window = new CustomWindow(m_view);
    connect(m_page, SIGNAL(javaScriptWindowObjectCleared()),this,SLOT(onInitialized()));
    connect(m_window,SIGNAL(myCloseEvent()),SIGNAL(_onClose()));
}
Window::~Window(){
    delete m_view;
    delete m_window;
}

bool Window::load( const QString& file  ){
    bool isOk;
    QString fileSource;
    isOk = Util::readFile(file,fileSource);
    if( isOk == false )
        return false;
    m_page->setContent(fileSource);
    return true;
}

void Window::show(){
    m_window->show();
}
void Window::close(){
    m_window->close();
}

void Window::minimum(){
    m_window->showMinimized();
}

void Window::maximum(){
    m_window->showMaximized();
}

void Window::restore(){
    m_window->showNormal();
}

void Window::setSize( int width , int height ){
    m_window->setSize(width,height);
}

void Window::setPosition(int left , int top){
    m_window->setPosition(left,top);
}
void Window::onInitialized(){
    qDebug() << "Window - onInitialized";
    //在js环境中初始化本对象
    m_page->addToJavaScriptWindowObject("application", Application::instance());
    //在js环境中初始化js环境
    m_page->evaluateJavaScript(Util::readResourceFileUtf8(":/bootstrap.js"));
}
