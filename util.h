#ifndef UTIL_H
#define UTIL_H

#include <QObject>

class Util : public QObject
{
    Q_OBJECT
private:
    explicit Util(QObject *parent = 0);

public:
    static QString readResourceFileUtf8(const QString &resourceFilePath);
    static bool readFile(const QString &filePath,QString&data);
};

#endif // UTIL_H
