#ifndef URL_H
#define URL_H

#include <QObject>

class Url : public QObject
{
    Q_OBJECT
public:
    explicit Url(QObject *parent = 0);

public:
    static bool dirname( const QString& str , QString& data );

public:
    static QString m_libraryPath;
};

#endif // URL_H
