#include <QApplication>
#include "window.h"
int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    Window window;
    window.show();
    a.setActiveWindow(window.m_window);
    return a.exec();
}
