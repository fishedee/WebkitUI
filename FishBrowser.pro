#-------------------------------------------------
#
# Project created by QtCreator 2014-07-02T18:39:24
#
#-------------------------------------------------

QT       += webkitwidgets network widgets core

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TARGET = FishBrowser
TEMPLATE = app


SOURCES += main.cpp \
    cookiejar.cpp \
    networkaccessmanager.cpp \
    application.cpp \
    window.cpp \
    webpage.cpp \
    config.cpp

HEADERS  += \
    cookiejar.h \
    window.h \
    networkaccessmanager.h \
    application.h \
    webpage.h \
    config.h

FORMS    +=