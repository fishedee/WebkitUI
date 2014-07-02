#ifndef WINDOW_H
#define WINDOW_H

#include <QObject>
#include <QWidget>
#include <QWebView>
#include <QMainWindow>
class CustomWindow:public QMainWindow{
public:
    CustomWindow(QWebView* view , QWidget*parent=NULL);
    void setSize( int width , int height );
    void setPosition(int left , int top);
};
class Window : private QWidget
{
    Q_OBJECT
public:
    explicit Window(QWidget *parent = 0);

signals:

public slots:
    void show();
public:
    CustomWindow* m_window;
    QWebView* m_view;
};

#endif // WINDOW_H
