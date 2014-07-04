//window测试
var window1 = application.createWindow();
window1.setSize(624,800);
window1.setPosition(100,200);
window1.load("static/index.html");
window1.onClose( function(){
	application.exit(0);
});
window1.show();