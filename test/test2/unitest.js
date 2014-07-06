//window测试
var window1 = application.createWindow();
window1.setSize(400,600);
window1.setPosition(100,100);
window1.load("static/index.html");
window1.onClose( function(){
	application.exit(0);
});
window1.show();