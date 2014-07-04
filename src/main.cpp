#include <QApplication>
#include "window.h"
#include "application.h"
int main(int argc, char *argv[])
{
    Application a(argc, argv);
    return a.exec();
}
/*
int main(int argc, char *argv[])
{
    Window wind(argc,argv);
    wind.show();
}
*/
