WebkitUI
========

<h2>跨平台本地WebApp</h2>
<h3>概述</h3>
<pre>
这个项目是使用QtWebkit接口，在PC上跨平台构造WebApp
有以下优点：
1.跨平台特性，支持Mac,Windows,Linux等PC平台
2.开发简单，仅用html,css,js就能构成WebApp
3.性能高效，支持静态页面放在本地的方式来构造WebApp
</pre>
<h3>运行示例</h3>
![示例1](http://github.com/fishedee/WebkitUI/blob/master/brief/test1.png) 
![示例2](http://github.com/fishedee/WebkitUI/blob/master/brief/test2.png) 
<h3>代码示例</h3>
<pre>
var window = application.createWindow();
window.setSize(624,800);
window.setPosition(100,200);
window.load("static/index.html");
window.onClose( function(){
	application.exit(0);
});
window.show();
</pre>
