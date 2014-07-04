//terminal测试
var terminal = application.getTerminal();
terminal.cout("Hello Fish");
terminal.cerr("Hello Fish2");
//commandline测试
var commandline = application.getCommandLine();
terminal.cout("argv count " + commandline.argc() );
for( var i = 0 ; i != commandline.argc() ; ++i )
	terminal.cout("argv "+ i +" : " + commandline.argv(i) );
//system测试
var system = application.getSystem();
console.log(system.getDesktopSize());
console.log("width: "+system.getDesktopSize().width + " height: "+system.getDesktopSize().height);
//window测试
var window1 = application.createWindow();
window1.setSize(1000,800);
window1.setPosition(100,200);
window1.load("index.html");
window1.onClose( function(){
	application.exit(0);
});
window1.show();