#include "window.h"

#include <QWebView>
#include <QGridLayout>
#include <iostream>
#include <QWebFrame>
#include <QApplication>
CustomWindow::CustomWindow(QWebView* view , QWidget*parent):
    QMainWindow(parent){
    //设置样式
    //

    //设置布局
    QWidget* widget = new QWidget(this);
    QGridLayout *gridLayout = new QGridLayout(widget);
    gridLayout->addWidget(view);
    widget->setLayout(gridLayout);
    setCentralWidget(widget);
    setAttribute(Qt::WA_TranslucentBackground, true);
    setWindowFlags(Qt::FramelessWindowHint);
}
void CustomWindow::setSize( int width , int height ){
    QRect rect = geometry();
    setGeometry( rect.left() , rect.top() , width ,height );
}
void CustomWindow::setPosition(int left , int top){
    QRect rect = geometry();
    setGeometry( left , top , rect.width() ,rect.height() );
}

Window::Window(int argc ,char**argv , QWidget *parent) :
    QObject(parent)
{
    m_app = new QApplication(argc,argv);
   // m_view = new QWebView(this);
   // m_window = new CustomWindow(m_view);
    m_page = new WebPage("123");
    connect((QObject*)m_page->mainFrame(), SIGNAL(javaScriptWindowObjectCleared ()),
            this, SLOT(addJavaScriptObject()));
    m_page->mainFrame()->load(QUrl("http://203.195.194.141:8181/static/index.html"));
}
void Window::addJavaScriptObject(){
    std::cout<<"123"<<std::endl;
}

void Window::show(){

   // m_window->show();
    m_app->exec();
}
