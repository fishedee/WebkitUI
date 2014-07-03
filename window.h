#ifndef WINDOW_H
#define WINDOW_H

#include <QObject>
#include <QWidget>
#include <QWebView>
#include <QMainWindow>
#include "webpage.h"
class CustomWindow:public QMainWindow{
public:
    CustomWindow(QWebView* view , QWidget*parent=NULL);
    void setSize( int width , int height );
    void setPosition(int left , int top);
};
class Window : private QObject
{
    Q_OBJECT
public:
    explicit Window(int argc ,char**argv ,QWidget *parent = 0);

signals:

public slots:
    void show();
    void addJavaScriptObject();
public:
    CustomWindow* m_window;
    QWebView* m_view;
    WebPage* m_page;
    QApplication* m_app;
};

#endif // WINDOW_H
