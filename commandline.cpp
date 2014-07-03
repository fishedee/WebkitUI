#include "commandline.h"

CommandLine::CommandLine(QObject *parent) :
    QObject(parent){
}
CommandLine *CommandLine::instance(){
    static CommandLine* only = NULL;
	if( only == NULL ){
		only = new CommandLine();
	}
	return only;
}
void CommandLine::init( int argc , char** argv ){
	m_argc = argc;
	m_argv = argv;
}
int CommandLine::argc(){
	return m_argc - 2;
}
QString CommandLine::argv( int i ){
	if( i >= 0 && i < m_argc - 2 )
		return m_argv[i-2];
	return "";
}

