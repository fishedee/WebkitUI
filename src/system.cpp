#include <QApplication>
#include <QDesktopWidget>
#include <QMetaType>
#include <QDir>
#include "system.h"
#include "application.h"
System::System(QObject *parent) :
    QObject(parent){

}
System* System::instance(){
    static System* only = NULL;
    if( only == NULL )
        only = new System(Application::instance());
    return only;
}

QVariantMap System::getDesktopSize(){
    QVariantMap map;
    map["width"] = (int)QApplication::desktop()->width();
    map["height"] = (int)QApplication::desktop()->height();
    return map;
}
QString System::currentPath(){
    return QDir::currentPath();
}

bool System::setCurrentPath( const QString& path ){
    return QDir::setCurrent(path);
}
