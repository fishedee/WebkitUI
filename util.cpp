#include "util.h"
#include <QFile>
#include <QtCore/QFile>
#include <QtCore/QTextStream>
#include <iostream>
using namespace std;
Util::Util(QObject *parent) :
    QObject(parent)
{
}
QString Util::readResourceFileUtf8(const QString &resourceFilePath){
     QFile f(resourceFilePath);
     f.open(QFile::ReadOnly);
     return QString::fromUtf8(f.readAll());
}
bool Util::readFile(const QString &filePath,QString&data){
    QFile f(filePath);
    f.open(QFile::ReadOnly);
    if( f.isOpen() == false)
        return false;
    data = QString::fromUtf8(f.readAll());
    return true;
}
