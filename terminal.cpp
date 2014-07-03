#include "terminal.h"
#include "consts.h"
#include <QTextCodec>
#include <iostream>
Terminal::Terminal(QObject *parent) :
    QObject(parent){
    m_codc = QTextCodec::codecForName(DEFAULT_CODEC_NAME);
    if( m_codc == NULL )
        m_codc = QTextCodec::codecForLocale();
}
Terminal *Terminal::instance(){
    static Terminal* only = NULL;
	if( only == NULL ){
		only = new Terminal();
	}
	return only;
}
QString Terminal::getEncoding() const{
    return m_codc->name();
}
bool Terminal::setEncoding(const QString &encoding){

	QTextCodec *codec = QTextCodec::codecForName(encoding.toLatin1());
    if ((QTextCodec *)NULL == codec) {
      return false;
    }

    // Check whether encoding actually needs to be changed
    const QString encodingBeforeUpdate(m_codc->name());
    if (0 == encodingBeforeUpdate.compare(QString(codec->name()), Qt::CaseInsensitive)) {
        return false;
    }
	
	m_codc = codec;
	return true;
}
void Terminal::cout(const QString &string, const bool newline ) const{
	output(std::cout, string, newline);
}
void Terminal::cerr(const QString &string, const bool newline ) const{
	output(std::cerr, string, newline);
}
void Terminal::output(std::ostream &out, const QString &string, const bool newline) const{
	out << m_codc->fromUnicode(string).constData();
	if (newline) {
        out << std::endl;
    }
    out << std::flush;
}
QString Terminal::cin(){
	std::string line;
	getline( std::cin , line );
	QByteArray bytes( line.c_str() );
	return m_codc->toUnicode(bytes);
}
