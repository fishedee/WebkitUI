(function(){
    var handlers = {};
	application.createWindow = function(){
        var win = application._createWindow();
        win.onClose = function( fun ){
            if( handlers["closeEvent"] != undefined )
                win._onClose.disconnect(handlers["closeEvent"]);
            win._onClose.connect(fun);
        }
		return win;
	};
	application.getTerminal = function(){
        var terminal = application._getTerminal();
		return terminal;
	};
	application.getCommandLine = function(){
        var commandline = application._getCommandLine();
		return commandline;
	};
    application.getSystem = function(){
        var system = application._getSystem();
        return system;
    };
	application.exit = function( retcode ){
		application._exit( retcode );
	}
})();
