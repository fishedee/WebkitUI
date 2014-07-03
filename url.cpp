#include "url.h"
#include <QFile>
#include <QFileInfo>
#include <QDir>
Url::Url(QObject *parent) :
    QObject(parent){
}
bool Url::dirname( const QString& fileName , QString& data ){
    data = QFileInfo(fileName).dir().absolutePath();
    return true;
}
