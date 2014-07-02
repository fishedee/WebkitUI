#ifndef WEBPAGE_H
#define WEBPAGE_H

#include <QWebPage>

class WebPage : public QWebPage
{
    Q_OBJECT
public:
    explicit WebPage(QWidget *parent = 0);

signals:

public slots:

};

#endif // WEBPAGE_H
