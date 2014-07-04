#ifndef SYSTEM_H
#define SYSTEM_H

#include <QObject>
#include <QMap>
#include <QVariant>
#include <QVariantMap>

class System : public QObject
{
    Q_OBJECT
private:
    explicit System(QObject *parent = 0);

public:
    static System* instance();

public slots:
    QVariantMap getDesktopSize();
    QString currentPath();
    bool setCurrentPath( const QString& path );
};

#endif // SYSTEM_H
