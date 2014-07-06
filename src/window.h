#ifndef WINDOW_H
#define WINDOW_H

#include <QObject>
#include <QWidget>
#include <QWebView>
#include <QMainWindow>
#include <QVariantMap>
#include "webpage.h"
class CustomWindow:public QMainWindow{
    Q_OBJECT
public:
    CustomWindow(QWebView* view , QWidget*parent=NULL);
    void setSize( int width , int height );
    void setPosition(int left , int top);
    void closeEvent ( QCloseEvent * );
    QVariantMap getPosition();
signals:
    void myCloseEvent();
};
class Window : public QObject
{
    Q_OBJECT
public:
    explicit Window(QWidget *parent = 0);
    ~Window();
signals:
    void _onClose();

public slots:
    bool load( const QString& index );
    void show();
    void setSize( int width , int height );
    void setPosition(int left , int top);
    QVariantMap getCursorPos();
    QVariantMap getPosition();
    void close();
    void minimum();
    void maximum();
    void restore();

private slots:
    void onInitialized();

public:
    CustomWindow* m_window;
    QWebView* m_view;
    WebPage* m_page;
    QApplication* m_app;
};

#endif // WINDOW_H
