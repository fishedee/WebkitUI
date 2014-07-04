#ifndef COMMANDLINE_H
#define COMMANDLINE_H

#include <QObject>

class CommandLine : public QObject
{
    Q_OBJECT
public:
	static CommandLine *instance();
	void init( int argc , char** argv );
	
public slots:
	int argc();
	QString argv( int i );

private:
    explicit CommandLine(QObject *parent = 0);

public:
	int m_argc;
	char** m_argv;
};

#endif // COMMANDLINE_H
