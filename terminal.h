#ifndef TERMINAL_H
#define TERMINAL_H

#include <QObject>
#include <QTextCodec>

class Terminal : public QObject
{
    Q_OBJECT
public:
	static Terminal *instance();
	QString getEncoding() const;
    bool setEncoding(const QString &encoding);
	
public slots:
	void cout(const QString &string, const bool newline = true) const;
    void cerr(const QString &string, const bool newline = true) const;
	QString cin();
	
private:
	void output(std::ostream &out, const QString &string, const bool newline) const;
    explicit Terminal(QObject *parent = 0);

private:
	QTextCodec* m_codc;
};

#endif // TERMINAL_H
