
/*comm模块global页面*/
/*判断客户端浏览器版本*/
$.extend({
    os: {
        ios: false,
        android: false,
        version: false
    }
});

(function() {
    var ua = navigator.userAgent;
    var browser = {},
        weixin = ua.match(/MicroMessenger\/([^\s]+)/),
        webkit = ua.match(/WebKit\/([\d.]+)/),
        android = ua.match(/(Android)\s+([\d.]+)/),
        ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
        ipod = ua.match(/(iPod).*OS\s([\d_]+)/),
        iphone = !ipod && !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
        webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
        touchpad = webos && ua.match(/TouchPad/),
        kindle = ua.match(/Kindle\/([\d.]+)/),
        silk = ua.match(/Silk\/([\d._]+)/),
        blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
        mqqbrowser = ua.match(/MQQBrowser\/([\d.]+)/),
        chrome = ua.match(/CriOS\/([\d.]+)/),
        opera = ua.match(/Opera\/([\d.]+)/),
        safari = ua.match(/Safari\/([\d.]+)/);
    if (weixin) {
        $.os.wx = true;
        $.os.wxVersion = weixin[1];
    }
    if (android) {
        $.os.android = true;
        $.os.version = android[2];
    }
    if (iphone) {
        $.os.ios = $.os.iphone = true;
        $.os.version = iphone[2].replace(/_/g, '.');
    }
    if (ipad) {
        $.os.ios = $.os.ipad = true;
        $.os.version = ipad[2].replace(/_/g, '.');
    }
    if (ipod) {
        $.os.ios = $.os.ipod = true;
        $.os.version = ipod[2].replace(/_/g, '.');
    }
    window.htmlEncode = function(text) {
        return text.replace(/&/g, '&amp').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    window.htmlDecode = function(text) {
        return text.replace(/&amp;/g, '&').replace(/&quot;/g, '/"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }
    window.NETTYPE = 0;
    window.NETTYPE_FAIL = -1;
    window.NETTYPE_WIFI = 1;
    window.NETTYPE_EDGE = 2;
    window.NETTYPE_3G = 3;
    window.NETTYPE_DEFAULT = 0;
})();

/*公共模块*/
var comm_util = {
	init:function(){
		$(".comm_util_message").hide();
		$(".comm_util_confirm_message").hide();
		$(".comm_util_choose_message").hide();
		$(".comm_util_loading").hide();
	},
	message:function( message ,fun ){
		$(".comm_util_message .text").text( message );
		$(".comm_util_message").show();
		$(".comm_util_message .button").unbind("chick").click( function(){
			$(".comm_util_message").hide();
			if( fun )
				fun("yes");
		});
	},
	confirmMessage:function( message , fun ){
		$(".comm_util_confirm_message .text").text( message );
		$(".comm_util_confirm_message").show();
		$(".comm_util_confirm_message .button .confirm").unbind("click").click( function(){
			$(".comm_util_confirm_message").hide();
			if( fun )
				fun("yes");
		});
		$(".comm_util_confirm_message .button .cancel").unbind("click").click( function(){
			$(".comm_util_confirm_message").hide();
			if( fun )
				fun("cancel");
		});
	},
	chooseMessage:function( messages ,fun ){
		$(".comm_util_choose_message .dialog .user").empty();
		for( var i = 0 ; i != messages.length ; ++i ){
			var div = $('<div class="comm_row userbutton"><div class="comm_button3">'+messages[i].text+'</div></div>');
			(function(i){
				div.unbind("click").click(function(){
					$(".comm_util_choose_message").hide();
					if( messages[i].click )
						messages[i].click();
				});
			})(i); 
			$(".comm_util_choose_message .dialog .user").append(div);
		}
		$(".comm_util_choose_message").show();
		$(".comm_util_choose_message .button").unbind("click").click(function(){
			$(".comm_util_choose_message").hide();
			if( fun )
				fun();
		});
	},
	loadingBegin:function(){
		$(".comm_util_loading").show();
	},
	loadingEnd:function(){
		$(".comm_util_loading").hide();
	},
    profile: function(){
        //未登录 
        if(_username() == ""){
            $(".me_index .header1").hide();
            $(".me_index .header2").show();
            $(".me_index .footer").hide();
        }
        //已登录 显示登录态
        else {
            $(".me_index .header1").show();
            $(".me_index .header2").hide();
            $(".me_index .footer").show();

            _get("/profile/" + _username(), {}, function(data){
                // 修改用户页面
                var data = data.data;
                $(".me_index .name").text(data.username);
                $(".me_index .shuoshuo").text(data.intro);
                // 修改用户个人页
                _input("address", "me_settings").val(data.address);
                _input("sex", "me_settings").val(data.gender);
                _input("grade", "me_settings").val(data.grade);
                _input("username", "me_settings").val(data.username);
                _input("weixin", "me_settings").val(data.weixin);
                _input("email", "me_settings").val(data.email);
                _input("phone", "me_settings").val(data.phone);
                _input("intro", "me_settings").val(data.intro);
            });
        }
    }, 
	log:function( log ){
		if( console )
			console.log( log );
	},
	debug:function( debug ){
		this.log(debug);
	}
};
$(document).ready(function(){
	comm_util.init();
});
var comm_page = {
    _current_page: '',
	_resumePageArgv:[],
	_pages:[],
	init:function(){
	},
	back:function( prevPageArgv ){

		if( this._pages.length > 1 ){
			this._pages[this._pages.length-1].close();	
			this._pages.pop();			

            this._current_page = this._pages[this._pages.length-1]._current_page;
			this._pages[this._pages.length-1].resume( prevPageArgv ,this._resumePageArgv[this._resumePageArgv.length-1]);
			this._resumePageArgv.pop();
		}else{
			comm_util.debug("back page,but pages length is " + _pages.length);
		}
	},
	change:function( nextPageName ,nextPageArg ){
		comm_util.debug("try to change page "+nextPageName);
		if( this._pages.length != 0 ){
			this._pages[this._pages.length-1].close();
			this._pages.pop();			
		}
		var page = window[nextPageName];	

        this._current_page = nextPageName;
        page._current_page = nextPageName;
		page.open( nextPageArg );
		this._pages.push( page );
	},
	go:function( nextPageName ,nextPageArg ,resumePageArgv ){
		comm_util.debug("try to open page "+nextPageName);
		if( this._pages.length != 0 ){
			this._pages[this._pages.length-1].hang();
			this._resumePageArgv.push( resumePageArgv );
		}
		var page = window[nextPageName];	

        this._current_page = nextPageName;
        page._current_page = nextPageName;
		page.open( nextPageArg );
		this._pages.push( page );
	}
};
$(document).ready(function(){
	comm_page.init();
});

/*图片上传模块*/
comm_upload = {
    uploadInfo: {},
    uploadQueue: [],
    previewQueue: [],
    maxUpload: 8,
    isBusy: false,
    xhr: {},
    seed: '',

    countUpload: function() {
        var self = this;
        var num = 0;
        $.each(self.uploadInfo, function(i, n) {
            if (n) {
                ++num;
            }
        });
        return num;
    },
    checkPicSize: function(file) {
        if (file.size > 10000000) {
            return false;
        }
        return true;
    },
    checkPicType: function(file) {
        return true;
    },
    uploadPreview: function(id){
        var self    = this;
        var reader  = new FileReader();
        var uploadBase64;
        var conf = {},
            file = self.uploadInfo[id].file;
        if (window.NETTYPE == window.NETTYPE_WIFI) {
            conf = {
                maxW: 3000,
                maxH: 1280,
                quality: 0.8,
            };
        }
        console.log(self.uploadInfo);

        reader.onload = function(e) {
            var result = this.result;
            if (file.type == 'image/jpeg') {
                try {
                    var jpg = new JpegMeta.JpegFile(result, file.name);
                } catch (e) {
                    _message('图片不是正确的图片数据');
                    comm_post.removeUploadImg(id);
                    return false;
                }
                if (jpg.tiff && jpg.tiff.Orientation) {
                    conf = $.extend(conf, {
                        orien: jpg.tiff.Orientation.value
                    });
                }
            }
            if (ImageCompresser.support()) {
                var img = new Image();
                img.onload = function() {
                    try {
                        uploadBase64 = ImageCompresser.getImageBase64(this, conf);
                    } catch (e) {
                        _message('压缩图片失败');
                        comm_post.removeUploadImg(id);
                        return false;
                    }
                    if (uploadBase64.indexOf('data:image') < 0) {
                        _message('上传照片格式不支持');
                        comm_post.removeUploadImg(id);
                        return false;
                    }
                    //self.uploadInfo[id].file = uploadBase64;
                    self.uploadInfo[id].file = uploadBase64.split(';base64,')[1];
                    //预览图片
                    comm_post.addUploadImg(uploadBase64, function(data){
                        comm_util.message("删除图片成功");
                        data.delUploadImg();
                    }, id);
                    self.uploadQueue.push(id);
                }
                img.onerror = function() {
                    _message('解析图片数据失败');
                    comm_post.removeUploadImg(id);
                    return false;
                }
                img.src = ImageCompresser.getFileObjectURL(file);
            } else {
                uploadBase64 = result;
                if (uploadBase64.indexOf('data:image') < 0) {
                    _message('上传照片格式不支持');
                    comm_post.removeUploadImg(id);
                    return false;
                }
                //self.uploadInfo[id].file = uploadBase64;
                self.uploadInfo[id].file = uploadBase64.split(';base64,')[1];
                //预览图片
                comm_post.addUploadImg(uploadBase64, function(data){
                    comm_util.message("删除图片成功");
                    data.delUploadImg();
                }, id);
                self.uploadQueue.push(id);
            }
        }
        reader.readAsBinaryString(self.uploadInfo[id].file);
    }, 
    checkUploadBySysVer: function() {
        if (jQuery.os.android 
                && (jQuery.os.version.toString().indexOf('4.4') === 0 
                || jQuery.os.version.toString() <= '2.1')) {
            _message('您的手机系统暂不支持传图');
            return false;
        } else if (jQuery.os.ios && jQuery.os.version.toString() < '6.0') {
            _message('手机系统不支持传图，请升级到ios6.0以上');
            return false;
        }
        if (jQuery.os.wx && jQuery.os.wxVersion.toString() < '5.2') {
            _message('当前微信版本不支持传图，请升级到最新版');
            return false;
        }
        return true;
    },
    createUpload: function(id) {
        var self = this;
        if (!self.uploadInfo[id]) {
            return false;
        }
        //todo
        var uploadUrl = '/upload';
        //var progressHtml = '<div class="progress" id="progress' + id + '"><div class="proBar" style="width:0%;"></div></div>';
        var formData = new FormData();
        formData.append('pic', self.uploadInfo[id].file);
        formData.append('id', id);
        var progress = function(e) {
            if (e.target.response) {
                var result = $.parseJSON(e.target.response);
                if (result.code != 0) {
                    _message('网络不稳定，请稍后重新操作');
                    removePic(id);
                }
            }
            //var progress = jq('#progress' + id).find('.proBar');
            if (e.total == e.loaded) {
                var percent = 100;
            } else {
                var percent = 100 * (e.loaded / e.total);
            }
            if (percent > 100) {
                percent = 100;
            }
            //progress.css('width', percent + '%');
            if (percent == 100) {
                //jq('#li' + id).find('.maskLay').remove();
                //jq('#li' + id).find('.progress').remove();
            }
        }
        var removePic = function(id) {
            donePic(id);
            comm_post.removeUploadImg(id);
        }
        var donePic = function(id) {
            isBusy = false;
            if (typeof self.uploadInfo[id] != 'undefined') {
                self.uploadInfo[id].isDone = true;
            }
            if (typeof self.xhr[id] != 'undefined') {
                self.xhr[id] = null;
            }
        }
        var complete = function(e) {
            //var progress = jq('#progress' + id).find('.proBar');
            //progress.css('width', '100%');
            //jq('#li' + id).find('.maskLay').remove();
            //jq('#li' + id).find('.progress').remove();
            donePic(id);
            var result = $.parseJSON(e.target.response);
            if (result.code == 0) {
                $("div.userimg[data='"+id+"']").attr("data", result.data);
                //result.data.picId;
                //todo
            } else {
                _message('网络不稳定，请稍后重新操作');
                removePic(id);
            }
        }
        var failed = function() {
            _message('网络断开，请稍后重新操作');
            removePic(id)
        }
        var abort = function() {
            _message('上传已取消');
            removePic(id)
        }
        self.xhr[id] = new XMLHttpRequest();
        self.xhr[id].addEventListener("progress", progress, false);
        self.xhr[id].addEventListener("load", complete, false);
        self.xhr[id].addEventListener("abort", abort, false);
        self.xhr[id].addEventListener("error", failed, false);
        self.xhr[id].open("POST", uploadUrl + '?t=' + Date.now());
        self.xhr[id].send(formData);
    },
    initUpload: function() {
        clearInterval(this.seed);

        var self = this;
        $('#addPic').on('click', function() {
            self.checkUploadBySysVer();
        });
        $('#uploadFile').on('click', function() {
            if (self.isBusy) {
                _message('上传中，请稍后添加');
                return false;
            }
        });
        self.seed = setInterval(function() {
            setTimeout(function() {
                if (self.previewQueue.length) {
                    var jobId = self.previewQueue.shift();
                    self.uploadPreview(jobId);
                }
            }, 1);
            setTimeout(function() {
                if (!self.isBusy && self.uploadQueue.length) {
                    var jobId = self.uploadQueue.shift();
                    self.isBusy = true;
                    self.createUpload(jobId);
                }
            }, 10);
        }, 300);
    },
    destoryUpload: function(){
        clearInterval(this.seed);
    }
};

/*index模块index页面*/
var index_index = {
	_bannerImgSize:0,
	_bannerImgIndex:0,
	_bannerTimer:null,
	_addBannerImg:function( img ){
		//获取宽度
		var allWidth = document.body.clientWidth;
		//comm_util.message(allWidth);
		//加入图片
		var div = $('<div class="comm_left img"><img class="comm_img" src="'+img+'"/></div>');
		div.css( 'left' ,(this._bannerImgSize * allWidth) + "px");
		div.css('width',allWidth+"px");
		$('.index_index .banner .show').append(div);
		//加入小圆点
		var div = $('<div class="comm_leftcol nochoosepoint"></div>');
		$(".index_index .banner .choose").append(div);
		this._bannerImgSize++;
		//调整图片组的宽度
		$('.index_index .banner .show').css('width',allWidth*this._bannerImgSize);
		//调整小圆点组的宽度
		$(".index_index .banner .choose").css('width',5*(this._bannerImgSize-1)+7*(this._bannerImgSize));
	},
	_clearBannerImg:function(){
		$(".index_index .banner .show").empty();
		$(".index_index .banner .choose").empty();
		this._bannerImgSize = 0 ;
	},
	_nextBannerAnimate:function(){
		//获取宽度
		var allWidth = document.body.clientWidth;;
		var curIndex;
		var nextIndex;
		curIndex = this._bannerImgIndex;
		
		if( this._bannerImgIndex == this._bannerImgSize - 1 )
			nextIndex = 0;
		else
			nextIndex = this._bannerImgIndex + 1;
		this._bannerImgIndex = nextIndex;
		$('.index_index .banner .show').animate({
			left:(-nextIndex * allWidth) + "px"
		},300,"linear",function(){
			var curDiv = $($(".index_index .banner .choose div")[curIndex]);
			curDiv.removeClass("choosepoint");
			curDiv.addClass("nochoosepoint");
			var nextDiv = $($(".index_index .banner .choose div")[nextIndex]);
			nextDiv.removeClass("nochoosepoint");
			nextDiv.addClass("choosepoint");
		});
	},
	_beginBannerAnimate:function(){
		this._bannerImgIndex = 0 ;
		var div = $($(".index_index .banner .choose div")[0]);
		div.removeClass("nochoosepoint");
		div.addClass("choosepoint");
		this._bannerTimer = setInterval( function(){
			index_index._nextBannerAnimate();
		}, 5000 );
		
	},
	_endBannerAnimate:function(){
		this._bannerImgIndex = 0 ;
		clearInterval(this._bannerTimer);
	},
	_open:function(){
		comm_body.clear();
		comm_footer.show();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("会美");
		comm_header.addRightSearch(function(){
			comm_page.go("me_search");
		});
		$(".index_index .metro .bbsitem").unbind("click").click(function(){
			comm_page.go("index_bbs",$(this).attr("data"));
		});
		$(".index_index .metro .moreitem").unbind("click").click(function(){
			comm_page.go("index_classify");
		});
		this._clearBannerImg();
		this._addBannerImg("/static/img/index/banner1.png");
		this._addBannerImg("/static/img/index/banner1.png");
		this._addBannerImg("/static/img/index/banner1.png");
		this._beginBannerAnimate();
		$(".index_index").show();
		comm_util.debug("index_index open success");
	},
	_close:function(){
		this._endBannerAnimate();
		$(".index_index").hide();
	},
	init:function(){
		comm_util.debug("index_index init success");
		
		$(".index_index").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	index_index.init();
});

/*index模块classify页面*/
var index_classify = {
	_clearItem:function(){
		$(".index_classify").empty();
	},
	_addItem:function(data){
		div = '<div class="comm_row item" data="'+data.data+'">'+
			'<div class="comm_leftcol text">'+data.title+'</div>'+
			'<div class="comm_rightcol next"></div>';
		if( data.num <= 0 )
			div += '<div class="comm_rightcol no_number"></div>';
		else if( data.num > 0 && data.num < 10 )
			div += '<div class="comm_rightcol one_number">'+data.num+'</div>';
		else	
			div += '<div class="comm_rightcol two_number">'+data.num+'</div>';
		div += '</div>';
		$(".index_classify").append( $(div) );
	},
	_open:function(){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("板块分类");
		comm_header.addLeftBack();
		this._clearItem();
		this._addItem({
			data:"五官美容",
			title:"五官美容",
			num:0
		});
		this._addItem({
			data:"面部轮廓",
			title:"面部轮廓",
			num:8
		});
		this._addItem({
			data:"乳房整形",
			title:"乳房整形",
			num:88
		});
		this._addItem({
			data:"会阴整形",
			title:"会阴整形",
			num:0
		});
		this._addItem({
			data:"疤痕整形",
			title:"疤痕整形",
			num:0
		});
		this._addItem({
			data:"切痣去疤",
			title:"切痣去疤",
			num:0
		});
		this._addItem({
			data:"吸脂减肥",
			title:"吸脂减肥",
			num:0
		});
		this._addItem({
			data:"除皱及其他",
			title:"除皱及其他",
			num:0
		});
		$(".index_classify .item").unbind("click").click(function(){
			comm_page.go( "index_bbs",$(this).attr("data"),"");
		});
		$(".index_classify").show();
		comm_util.debug("index_classify open success");
	},
	_close:function(){
		$(".index_classify").hide();
	},
	init:function(){
		comm_util.debug("index_classify init success");
		$(".index_classify").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	index_classify.init();
});

/*index模块bbs页面*/
var index_bbs = {
    _total: 0,
    _index: 0,
    _size: 10,
	_addItem:function(){
        var self = this;
        _get("/search_topic", {
            pageIndex: self._index, 
            pageSize: self._size
        }, function(data){
            var topics = data.data.topics;
            if(topics.length > 0)
                self._index ++; 
            for(var i in topics){
                comm_bbs.addItem({
                    topic_id: topics[i]._id,
                    title: topics[i].title,
                    content: topics[i].content,
                    images: topics[i].image,
                    user: topics[i].author,
                    time: topics[i].created,
                    comment: topics[i].reply,
                    favour: topics[i].likes
                });
            }
        });
	},
    _clearItem:function(){
        this._size = 10;
        this._index = 0;
    },
	_open:function(title){
        var self = this;
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle(title);
		comm_header.addLeftBack();
        //comm_bbs.clear();
		comm_bbs.setItemClick(function(data){
			comm_util.log( data.title );
			comm_page.go("index_content",data.topic_id,title);
		});
		comm_bbs.setTopMoreClick(function(){
			comm_bbs.clearItem();
            index_bbs._clearItem();
			index_bbs._addItem();
			comm_bbs.finishTopMoreClick();
		});
		comm_bbs.setBottomMoreClick(function(){
			index_bbs._addItem();
			comm_bbs.finishBottomMoreClick();
		});

        this.scroll(30);

        comm_bbs.clearItem();
        index_bbs._clearItem();
        this._addItem();
		comm_bbs.show();
		comm_util.debug("index_bbs open success");
	},
	_close:function(){
		comm_bbs.hide();
	},
    scroll: function(top){
        setTimeout(function(){
            $("body").scrollTop(top);
        }, 1000);
    },
	init:function(){
		comm_util.debug("index_bbs init success");
		
		$(".index_bbs").hide();
	},
	open:function( arg ){
		this._open(arg);
	},
	hang:function(){
		this._close();
	},
	resume:function( returnArg,resumeArgv ){
		this._open(resumeArgv);
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	index_bbs.init();
});

/*index模块content页面*/
var index_content = {
    _total: 0,
    _index: 0,
    _size: 10,
    _topic_id: '',

	_commentCommentClick:null,
	_commentFavoureClick:null,
	_setContent:function(data){
		$(".index_content .info .time").text(data.time);
		$(".index_content .info .look").text(data.look);
		$(".index_content .content .title").text(data.title);
		$(".index_content .content .text").html(data.content);
		$(".index_content .content .user").text(data.user);
		$(".index_content .content .imagelist").empty();
		for( var i = 0 ; i != data.images.length ; ++i ){
			var image = $('<div class="comm_leftcol img">'+
				'<img src="'+data.images[i]+'"/>'+
			'</div>');
			$(".index_content .content .imagelist").append(image);
		}
		//$(".index_content .info2 .favor").text(data.favour+"赞");
		$(".index_content .info2 .comment").text(data.comment+"评论");
		$(".index_content .info2 .favor").unbind("click").click(function(){
			if( data.favourClick )
				data.favourClick();
		});
		$(".index_content .info2 .comment").unbind("click").click(function(){
			if( data.commentClick )
				data.commentClick();
		});
	},
	_clearComment:function(){
        this._total = 0;
        this._index = 0;
        this._size  = 10;

		$(".index_content .comments").empty();
	},
	_addComment:function(data){
		var images = "";
		if( data.images ){
			for( var i = 0 ; i != data.images.length ; ++i ){
				images = images + '<div class="comm_leftcol img">'+
						'<img src="'+data.images[i]+'"/>'+
					'</div>';
			}
		}
		var item = $('<div class="comm_row item">'+
			'<div class="comm_leftcol img">'+
				'<img class="comm_img" src="'+data.icon+'"/>'+
			'</div>'+
			'<div class="comm_row infos">'+
				'<div class="comm_row basic">'+
					'<div class="comm_leftcol user">'+data.user+'</div>'+
					'<div class="comm_rightcol comment">'+
                    //data.comment+
                    '评论</div>'+
					'<div class="comm_rightcol favour">'+data.favour+' 赞</div>'+
				'</div>'+
				'<div class="comm_row time">'+
					data.time+
				'</div>'+
				'<div class="comm_row imagelist">'+
					images+
				'</div>'+
				'<div class="comm_row text">'+
					data.content+
				'</div>'+
			'</div>'+
		'</div>');
		item.find(".favour").data("data", data);
		item.find(".comment").data("data", data);
		$(".index_content .comments").append(item);
		$(".index_content .comments .favour").unbind("click").click( function(){
			if( index_content._commentFavoureClick )
				index_content._commentFavoureClick( $(this).data("data") );
		});
		$(".index_content .comments .comment").unbind("click").click( function(){
			if( index_content._commentCommentClick )
				index_content._commentCommentClick( $(this).data("data") );
		});
	},
	_setCommentCommentClick:function( fun ){
		this._commentCommentClick = fun;
	},
	_setCommentFavourClick:function( fun ){
		this._commentFavoureClick = fun;
	},
	_setBottomMoreClick:function( fun ){
		$(".index_content .bottommore .text").unbind("click").click(function(){
			$(".index_content .bottommore .text").hide();
			$(".index_content .bottommore .img").show();
			if( fun )
				fun ();
		});
	},
	_finishBottomMoreClick:function(){
		$(".index_content .bottommore .text").show();
		$(".index_content .bottommore .img").hide();
	},
	_clearBottomMoreClick:function(){
		$(".index_content .bottommore").hide();
	},
	_open:function(){
        var self = this;
		//设置头尾
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("内容");
		comm_header.addLeftBack();
		comm_header.addRightShare(function(){
			comm_util.message("点击分享");
		});
		comm_header.addRightCollect(function(){
			comm_util.message("点击收藏");
		});
		this._clearComment();
        this.fetch();

        //设置帖子评论内容
		this._setCommentCommentClick(function(data){
			//comm_util.message("点击了"+data.user+"评论");
			comm_page.go("index_comment", {
                topic_id: self._topic_id,
                category: 1,
                username: data.user
            });
		});
		this._setCommentFavourClick(function(data){
			//comm_util.message("点击了"+data.user+"赞");
            self.like(data.topic_id, data.user);
            // 点赞逻辑
		});
		
		//设置帖子评论下拉触发
		this._setBottomMoreClick(function(){
			self.fetch();

			index_content._finishBottomMoreClick();
		});

        $(".index_content").show();
		comm_util.debug("index_content open success");
	},
	_close:function(){
		$(".index_content").hide();
	},
	init:function(){
		comm_util.debug("index_content init success");
		$(".index_content").hide();
	},
	open:function( arg ){
        this._topic_id = arg;
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	},
    like: function(topic_id, name){
        var self = this;
        _put("/like", {
            topic_id: self._topic_id,
            username: name
        }, function(data){
            // 点赞/取消成功提示
        });
    },
    fetch: function(){
        var self = this;
        _get("/topic_reply", {
            topic_id: self._topic_id,
            pageIndex: self._index,
            pageSize: self._size
        }, function(data){
            if(self._index == 0){
                //设置帖子内容
                var topic = data.data.topic;
                self._setContent({
                    time: topic.created,
                    look: "6892",
                    title: topic.title,
                    content: topic.content,
                    user: topic.author,
                    images: topic.image,
                    favour: topic.likes,
                    comment: topic.reply,
                    favourClick:function(){
                        //comm_util.message("点击了赞");
                        self.like(topic.topic_id, _username());
                    },
                    commentClick:function(){
                        //comm_util.message("点击了评论");
                        comm_page.go("index_comment", {
                            topic_id: self._topic_id,
                            category: self._category
                        });

                        //comm_page.go("index_comment");
                    }
                });
            }

            var comment = data.data.replys;
            for(var i in comment){
                var tmp = comment[i];
                self._addComment({
                    topic_id: tmp._id,
                    icon: tmp.avatar,
                    user: tmp.author,
                    comment: tmp.reply,
                    favour: tmp.likes,
                    time: tmp.created,
                    content: tmp.title + " " + tmp.content,
                    images: tmp.image
                });
            }
            if(comment.length > 0){
                self._index ++;
            }
        });
    }
};
$(document).ready(function(){
	index_content.init();
});

/*index模块comment页面*/
var index_comment = {
    _topic_id: '',
    _category: '',
	_open:function(){
        var self = this;
		//设置头尾
		comm_body.clear();
		comm_footer.hide();
		comm_header.clear();
		comm_header.addLeftBack();
		comm_header.setTitle("评论");
		comm_header.show();
		//设置内容
		comm_post.clear();
		comm_post.setConfirmButton("评论",function(){
			//comm_util.message("评论成功");
            self.submit("评论成功");
		});
		comm_post.setCancelButton("取消",function(){
			comm_page.back();
		});
		
        $(".index_comment .footer .post").unbind("click").click(function(){
            self.submit();
        });
		//comm_util.message("发帖成功");
		comm_post.setTipText("这里是填写标题","这里是填写内容");
		comm_post.setAddImgButton(function(data){
			if( data == "camera")
				comm_util.message("选择拍照上传");
			else 
				comm_util.message("选择图片上传");
		});
		comm_post.addUploadImg("/static/img/comm/sample.png",function(data){
			comm_util.message("删除图片成功");
			data.delUploadImg();
		});
		comm_post.addUploadImg("/static/img/comm/sample.png",function(data){
			comm_util.message("删除图片成功");
			data.delUploadImg();
		});
		comm_post.show();
		comm_util.debug("index_comment open success");
	},
	_close:function(){
		comm_post.hide();
	},
	init:function(){
		comm_util.debug("index_comment init success");
	},
	open:function( arg ){
        if(arg.topic_id) this._topic_id = arg.topic_id;
        if(arg.category) this._category = arg.category;
        if(arg.username) {
            this._username = arg.username;
            $(".comm_post input[name='title']").val(
                "@" + this._username
            );
        }

		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	},
    submit:function(message){
        var self = this;
        var obj = {};

        if(self._topic_id == ''){
            obj.is_topic = true;
        }
        else {
            obj.is_topic = false;
        }
        obj.topic_id = self._topic_id;
        obj.author  = _username();
        obj.title   = $.trim($(".comm_post input[name='title']").val());
        obj.content = $.trim($(".comm_post textarea[name='content']").val());
        if(obj.title == ""){
            _message("标题不能为空");
            return false;
        }
        if(obj.content == ""){
            _message("内容不能为空");
            return false;
        }

        _put("/new_topic", obj, function(data){
            _message(message, function(){
			    comm_footer.choose("index_index");
            });
        });
    }
};
$(document).ready(function(){
	index_comment.init();
});

/*expert模块index页面*/
var expert_index = {
	_addItem:function(){
		comm_bbs.addItem({
			title:"隆鼻7天后鼻子竟变得如此自然_1",
			content:"呜呜，我做的鼻子怎么变得这么低，这才一个礼拜，等过1个月岂不是更低，怎么办",
			images:[
			],
			user:"唯美的爱",
			time:"2013-10-13",
			comment:"129",
			favour:"50"
		});
		comm_bbs.addItem({
			title:"隆鼻7天后鼻子竟变得如此自然_2",
			content:"呜呜，我做的鼻子怎么变得这么低，这才一个礼拜，等过1个月岂不是更低，怎么办",
			images:[
				"/static/img/comm/sample1.png"
			],
			user:"唯美的爱",
			time:"2013-10-13",
			comment:"129",
			favour:"50"
		});
		comm_bbs.addItem({
			title:"隆鼻7天后鼻子竟变得如此自然_3",
			content:"呜呜，我做的鼻子怎么变得这么低，这才一个礼拜，等过1个月岂不是更低，怎么办",
			images:[
				"/static/img/comm/sample2.png",
				"/static/img/comm/sample3.png",
			],
			user:"唯美的爱",
			time:"2013-10-13",
			comment:"129",
			favour:"50"
		});
	},
	_open:function(){
		comm_body.clear();
		comm_footer.show();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("专家");
		comm_bbs.clear();
		comm_bbs.setItemClick(function(data){
			comm_util.log( data.title );
			comm_page.go("index_content",data.title);
		});
		comm_bbs.setTopMoreClick(function(){
			comm_bbs.clearItem();
			expert_index._addItem();
			comm_bbs.finishTopMoreClick();
		});
		comm_bbs.setBottomMoreClick(function(){
			expert_index._addItem();
			comm_bbs.finishBottomMoreClick();
		});
		this._addItem();
		comm_bbs.show();
		comm_util.debug("expert_index open success");
	},
	_close:function(){
		comm_bbs.hide();
	},
	init:function(){
		comm_util.debug("expert_index init success");
		$(".expert_index").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( returnArg,resumeArgv ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	expert_index.init();
});

/*post模块index页面*/
var post_index = {
	_open:function(){
        var self = this;
		//设置头尾
		comm_body.clear();
		comm_footer.show();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("发帖");
		//设置内容
		comm_post.clear();
		comm_post.setClassifyButton("请选择发帖的板块",function(){
			comm_page.go("post_classify","","post_classify");
		});
		comm_post.setConfirmButton("发帖",function(){
            self.submit();
			//comm_util.message("发帖成功");
		});
		comm_post.setCancelButton("取消",function(){
			comm_footer.choose("index_index");
		});
		
		//comm_util.message("发帖成功");
		comm_post.setTipText("这里是填写标题","这里是填写内容");
		comm_post.setAddImgButton(function(data){
			if( data == "camera")
				comm_util.message("选择拍照上传");
			else 
				comm_util.message("选择图片上传");
		});
        /*
		comm_post.addUploadImg("/static/img/comm/sample.png",function(data){
			comm_util.message("删除图片成功");
			data.delUploadImg();
		});
		comm_post.addUploadImg("/static/img/comm/sample.png",function(data){
			comm_util.message("删除图片成功");
			data.delUploadImg();
		});
        */
		comm_post.show();
		comm_util.debug("post_index open success");
	},
	_close:function(){
		comm_post.hide();
	},
	init:function(){
		comm_util.debug("post_index init success");
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( returnArg ,resumeArg){
		this._open();
		if( resumeArg == "post_classify" && returnArg ){
			comm_post.setClassifyContent( returnArg );
		}
	},
	close:function(){
		this._close();
	},
    submit:function(){
        var obj = {};
        obj.is_topic= true;
        obj.author  = _username();
        //obj.category= $.trim($(".comm_post input[name='category']").val())
        obj.category= 1
        obj.title   = $.trim($(".comm_post input[name='title']").val())
        obj.content = $.trim($(".comm_post textarea[name='content']").val());
        if(obj.category == ""){
            _message("发帖板块不能为空");
            return false;
        }
        if(obj.title == ""){
            _message("标题不能为空");
            return false;
        }
        if(obj.content == ""){
            _message("内容不能为空");
            return false;
        }

        _put("/new_topic", obj, function(data){
            _message("发帖成功", function(){
                $(".comm_post input[name='title']").val("")
                $(".comm_post textarea[name='content']").val("");

			    comm_footer.choose("index_index");
            });
        });
    }
};
$(document).ready(function(){
	post_index.init();
});

/*post模块classify页面*/
var post_classify = {
	_clasify:["眼部整形","鼻部整形","嘴唇下巴","额骨下颌","乳房整形","吸脂整形","脂肪填充","注射美容","切痣除疤","激光美容","五官美容","面部轮廓","会阴整形","疤痕整形","除皱及其他"],
	_open:function(){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("选择板块");
		comm_header.addLeftBack();
		var showText = [];
		for( var i = 0 ; i != this._clasify.length ; ++i ){
			showText.push({
				text:this._clasify[i],
				data:this._clasify[i]
			});
		}
		comm_choose.setChoose( showText , function( data ){
			comm_page.back( data );
		});
		comm_choose.show();
		comm_util.debug("post_classify open success");
	},
	_close:function(){
		comm_choose.hide();
	},
	init:function(){
		comm_util.debug("post_classify init success");
		$(".post_classify").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	post_classify.init();
});

/*near模块index页面*/
var near_index = {
	_itemClick:null,
	_setTopMoreClick:function( fun ){		
		$(".near_index .topmore .text").unbind("click").click(function(){
			$(".near_index .topmore .text").hide();
			$(".near_index .topmore .img").show();
			if( fun )
				fun ();
		});
	},
	_finishTopMoreClick:function(){
		$(".near_index .topmore .text").show();
		$(".near_index .topmore .img").hide();
	},
	_setBottomMoreClick:function( fun ){
		$(".near_index .bottommore .text").unbind("click").click(function(){
			$(".near_index .bottommore .text").hide();
			$(".near_index .bottommore .img").show();
			if( fun )
				fun ();
		});
	},
	_finishBottomMoreClick:function(){
		$(".near_index .bottommore .text").show();
		$(".near_index .bottommore .img").hide();
	},
	_setItemClick:function( fun ){
		this._itemClick = fun;
	},
	_addItem:function(data){
		var div = 
		$('<div class="comm_row item">'+
			'<div class="comm_leftcol icon">'+
				'<img class="comm_img" src="'+data.icon+'"/>'+
			'</div>'+
			'<div class="comm_leftcol text">'+
				'<div class="comm_row user">'+data.user+'</div>'+
				'<div class="comm_row info">'+
					'<div class="comm_leftcol district">'+data.district+'</div>'+
					'<div class="comm_leftcol identity">认证：'+data.identity+'</div>'+
				'</div>'+
			'</div>'+
			'<div class="comm_rightcol distance">'+
				data.distance+
			'</div>'+
		'</div>');
		div.data("data",data);
		$(".near_index .content").append(div);
		$(".near_index .content .item").unbind("click").click(function(){
			if( near_index._itemClick )
				near_index._itemClick( $(this).data("data") );
		});
	},
	_clear:function(){
		$(".near_index .content").empty();
		$(".near_index .topmore .text").show();
		$(".near_index .topmore .img").hide();
		$(".near_index .bottommore .text").show();
		$(".near_index .bottommore .img").hide();
	},
	_open:function(){
		comm_body.clear();
		comm_footer.show();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("附近");
		this._clear();
		this._setTopMoreClick(function(){
			comm_util.message("点击了上面的刷新按钮");
			near_index._finishTopMoreClick();
		});
		this._setBottomMoreClick(function(){
			comm_util.message("点击了下面的刷新按钮");
			near_index._finishBottomMoreClick();
		});
		this._setItemClick(function(data){
			comm_page.go("near_info",data.user);
		});
		this._addItem({
			icon:"/static/img/near/person_test1.png",
			user:"玛丽亚_1",
			district:"北京",
			identity:"普通用户",
			distance:"0.02km"
		});
		this._addItem({
			icon:"/static/img/near/person_test2.png",
			user:"玛丽亚_2",
			district:"北京",
			identity:"医生",
			distance:"0.02km"
		});
		this._addItem({
			icon:"/static/img/near/person_test3.png",
			user:"玛丽亚_3",
			district:"北京",
			identity:"普通用户",
			distance:"0.02km"
		});
		$(".near_index").show();
		comm_util.debug("near_index open success");
	},
	_close:function(){
		$(".near_index").hide();
	},
	init:function(){
		comm_util.debug("near_index init success");
		$(".near_index").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	near_index.init();
});

/*near模块info页面*/
var near_info = {
    _username: '',
	_open:function(data){
		comm_body.clear();
		comm_body.setGreyBackground();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("个人资料");
		comm_header.addLeftBack();

		comm_header.addRightShare(function(){
			comm_util.message("点击了分享按钮");
		});

        this.fetch(data);
	
		comm_info.show();
		comm_util.debug("near_info open success");
	},
	_close:function(){
		comm_info.hide();
	},
	init:function(){
		comm_util.debug("near_info init success");
	},
	open:function( arg ){
		this._open(arg);
	},
	hang:function(){
		this._close();
	},
	resume:function( returnArg ,resumeArg){
		this._open(resumeArg);
	},
	close:function(){
		this._close();
	},
    fetch:function(username){
        _get("/profile/" + username,  {}, function(data){
            var user = data.data;
            comm_info.setData({
                icon: user.avatar,
                user: user.username,
                district: user.address,
                sex: user.gender,
                age: user.age,
                identity: user.cert,
                level: user.grade,
                mail: user.email,
                phone: user.phone,
                weixin: user.weixin,
                info: user.intro,
                images: user.image,
                /*
                 * images:[
                    "/static/img/index/sample1.png",
                    "/static/img/index/sample2.png",
                    "/static/img/index/sample3.png"
                ],
                */
                click:function(){
                    comm_page.go("near_bbs",data,data);
                }
            });
        });
            
    }
};
$(document).ready(function(){
	near_info.init();
});

/*near模块bbs页面*/
var near_bbs = {
	_addItem:function(){
		comm_bbs.addItem({
			title:"隆鼻7天后鼻子竟变得如此自然_1",
			content:"呜呜，我做的鼻子怎么变得这么低，这才一个礼拜，等过1个月岂不是更低，怎么办",
			images:[
			],
			user:"唯美的爱",
			time:"2013-10-13",
			comment:"129",
			favour:"50"
		});
		comm_bbs.addItem({
			title:"隆鼻7天后鼻子竟变得如此自然_2",
			content:"呜呜，我做的鼻子怎么变得这么低，这才一个礼拜，等过1个月岂不是更低，怎么办",
			images:[
				"/static/img/comm/sample1.png"
			],
			user:"唯美的爱",
			time:"2013-10-13",
			comment:"129",
			favour:"50"
		});
		comm_bbs.addItem({
			title:"隆鼻7天后鼻子竟变得如此自然_3",
			content:"呜呜，我做的鼻子怎么变得这么低，这才一个礼拜，等过1个月岂不是更低，怎么办",
			images:[
				"/static/img/comm/sample2.png",
				"/static/img/comm/sample3.png",
			],
			user:"唯美的爱",
			time:"2013-10-13",
			comment:"129",
			favour:"50"
		});
	},
	_open:function(data){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle(data);
		comm_header.addLeftBack();
		comm_bbs.clear();
		comm_bbs.setItemClick(function(data){
			comm_util.log( data.title );
			comm_page.go("index_content",data.title);
		});
		comm_bbs.setTopMoreClick(function(){
			comm_bbs.clearItem();
			near_bbs._addItem();
			comm_bbs.finishTopMoreClick();
		});
		comm_bbs.setBottomMoreClick(function(){
			near_bbs._addItem();
			comm_bbs.finishBottomMoreClick();
		});
		this._addItem();
		comm_bbs.show();
		comm_util.debug("near_bbs open success");
	},
	_close:function(){
		comm_bbs.hide();
	},
	init:function(){
		comm_util.debug("near_bbs init success");
		$(".near_bbs").hide();
	},
	open:function( arg ){
		this._open(arg);
	},
	hang:function(){
		this._close();
	},
	resume:function( returnArg,resumeArgv ){
		this._open(resumeArgv);
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	near_bbs.init();
});

/*me模块district页面*/
var me_district_distruct = [
["北京","东城|西城|崇文|宣武|朝阳|丰台|石景山|海淀|门头沟|房山|通州|顺义|昌平|大兴|平谷|怀柔|密云|延庆"],    
["上海","黄浦|卢湾|徐汇|长宁|静安|普陀|闸北|虹口|杨浦|闵行|宝山|嘉定|浦东|金山|松江|青浦|南汇|奉贤|崇明"],    
["天津","和平|东丽|河东|西青|河西|津南|南开|北辰|河北|武清|红挢|塘沽|汉沽|大港|宁河|静海|宝坻|蓟县"],    
["重庆","万州|涪陵|渝中|大渡口|江北|沙坪坝|九龙坡|南岸|北碚|万盛|双挢|渝北|巴南|黔江|长寿|綦江|潼南|铜梁|大足|荣昌|壁山|梁平|城口|丰都|垫江|武隆|忠县|开县|云阳|奉节|巫山|巫溪|石柱|秀山|酉阳|彭水|江津|合川|永川|南川"],    
["河北","石家庄|邯郸|邢台|保定|张家口|承德|廊坊|唐山|秦皇岛|沧州|衡水"],    
["山西","太原|大同|阳泉|长治|晋城|朔州|吕梁|忻州|晋中|临汾|运城"],    
["内蒙古","呼和浩特|包头|乌海|赤峰|呼伦贝尔盟|阿拉善盟|哲里木盟|兴安盟|乌兰察布盟|锡林郭勒盟|巴彦淖尔盟|伊克昭盟"],    
["辽宁","沈阳|大连|鞍山|抚顺|本溪|丹东|锦州|营口|阜新|辽阳|盘锦|铁岭|朝阳|葫芦岛"],    
["吉林","长春|吉林|四平|辽源|通化|白山|松原|白城|延边"],    
["黑龙江","哈尔滨|齐齐哈尔|牡丹江|佳木斯|大庆|绥化|鹤岗|鸡西|黑河|双鸭山|伊春|七台河|大兴安岭"],    
["江苏","南京|镇江|苏州|南通|扬州|盐城|徐州|连云港|常州|无锡|宿迁|泰州|淮安"],    
["浙江","杭州|宁波|温州|嘉兴|湖州|绍兴|金华|衢州|舟山|台州|丽水"],    
["安徽","合肥|芜湖|蚌埠|马鞍山|淮北|铜陵|安庆|黄山|滁州|宿州|池州|淮南|巢湖|阜阳|六安|宣城|亳州"],    
["福建","福州|厦门|莆田|三明|泉州|漳州|南平|龙岩|宁德"],    
["江西","南昌市|景德镇|九江|鹰潭|萍乡|新馀|赣州|吉安|宜春|抚州|上饶"],    
["山东","济南|青岛|淄博|枣庄|东营|烟台|潍坊|济宁|泰安|威海|日照|莱芜|临沂|德州|聊城|滨州|菏泽"],    
["河南","郑州|开封|洛阳|平顶山|安阳|鹤壁|新乡|焦作|濮阳|许昌|漯河|三门峡|南阳|商丘|信阳|周口|驻马店|济源"],    
["湖北","武汉|宜昌|荆州|襄樊|黄石|荆门|黄冈|十堰|恩施|潜江|天门|仙桃|随州|咸宁|孝感|鄂州"],  
["湖南","长沙|常德|株洲|湘潭|衡阳|岳阳|邵阳|益阳|娄底|怀化|郴州|永州|湘西|张家界"],    
["广东","广州|深圳|珠海|汕头|东莞|中山|佛山|韶关|江门|湛江|茂名|肇庆|惠州|梅州|汕尾|河源|阳江|清远|潮州|揭阳|云浮"],    
["广西","南宁|柳州|桂林|梧州|北海|防城港|钦州|贵港|玉林|南宁地区|柳州地区|贺州|百色|河池"],    
["海南","海口|三亚"],    
["四川","成都|绵阳|德阳|自贡|攀枝花|广元|内江|乐山|南充|宜宾|广安|达川|雅安|眉山|甘孜|凉山|泸州"],    
["贵州","贵阳|六盘水|遵义|安顺|铜仁|黔西南|毕节|黔东南|黔南"],    
["云南","昆明|大理|曲靖|玉溪|昭通|楚雄|红河|文山|思茅|西双版纳|保山|德宏|丽江|怒江|迪庆|临沧"],  
["西藏","拉萨|日喀则|山南|林芝|昌都|阿里|那曲"],    
["陕西","西安|宝鸡|咸阳|铜川|渭南|延安|榆林|汉中|安康|商洛"],    
["甘肃","兰州|嘉峪关|金昌|白银|天水|酒泉|张掖|武威|定西|陇南|平凉|庆阳|临夏|甘南"],    
["宁夏","银川|石嘴山|吴忠|固原"], 
["青海","西宁|海东|海南|海北|黄南|玉树|果洛|海西"],    
["新疆","乌鲁木齐|石河子|克拉玛依|伊犁|巴音郭勒|昌吉|克孜勒苏柯尔克孜|博尔塔拉|吐鲁番|哈密|喀什|和田|阿克苏"],    
["香港",""],    
["澳门",""],    
["台湾","台北|高雄|台中|台南|屏东|南投|云林|新竹|彰化|苗栗|嘉义|花莲|桃园|宜兰|基隆|台东|金门|马祖|澎湖"]    
//["其它","北美洲|南美洲|亚洲|非洲|欧洲|大洋洲"]
];
var me_district = {
	_chooseProvinceAndDistrict:function( province , district ){
		comm_page.back( {
			"province":province,
			"district":district
		});
	},
	_chooseProvince:function( province ){
		var district = [];
		for( var i = 0 ; i != me_district_distruct.length ; ++i ){
			if( me_district_distruct[i][0] == province ){
				district = me_district_distruct[i][1].split("|");;
				break;
			}
		}
		if( district.length == 0 || district[0].length != 0 ){
			this._chooseProvinceAndDistrict(province,"");
		}else{
			var showText = [];
			for( var i = 0 ; i != district.length ; ++i ){
				showText.push({
					text:district[i],
					data:{
						"province":province,
						"district":district[i]
					}
				});
			}
			comm_choose.setChoose( showText , function( data ){
				me_district._chooseProvinceAndDistrict( data.province , data.district );
			});
		}
	},
	_open:function(){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("选择地区");
		comm_header.addLeftBack();
		var showText = [];
		for( var i = 0 ; i != me_district_distruct.length ; ++i ){
			showText.push({
				text:me_district_distruct[i][0],
				data:me_district_distruct[i][0]
			});
		}
		comm_choose.setChoose( showText , function( data ){
			me_district._chooseProvince( data );
		});
		comm_choose.show();
		comm_util.debug("me_district open success");
	},
	_close:function(){
		comm_choose.hide();
	},
	init:function(){
		comm_util.debug("me_district init success");
		$(".me_district").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	me_district.init();
});

/*me模块index页面*/
/*个人模块主页*/
var me_index = {
	_open:function(){
		comm_body.clear();
		comm_footer.show();
		comm_header.show();
		comm_header.clear();
		comm_header.addRightSearch(function(){
			comm_page.go("me_search");
		});
		comm_header.setTitle("个人");
		$(".me_index .header1,.me_index .header2,.me_index .content .item").unbind("click").click( function(){
			comm_page.go($(this).attr("data"), _username());
		});
		$(".me_index .footer .text").unbind("click").click(function(){
			comm_util.confirmMessage("你确认要退出登录吗？",function(result){
				if( result == "yes" )
					comm_util.message("你点击了退出登录");
			});
		});
		$(".me_index").show();
		comm_util.debug("me_index open success");
	},
	_close:function(){
		$(".me_index").hide();
	},
	init:function(){
        var self = this;
		comm_util.debug("me_index init success");
		$(".me_index .header1,.me_index .header2,.me_index .content .item").click( function(){
			comm_page.go($(this).attr("data"));
		});

        $(".me_index .logout").click(function(){
            self.logout(); 
        });
		
        $(".me_index").hide();

        comm_util.profile();        
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	},
    logout: function(){

        var self = this;
        comm_util.confirmMessage("确认注销登录?", function(){
            _post("/logout", {username: _username()}, function(){
                location.reload();
            });
        });
    }
};
$(document).ready(function(){
	me_index.init();
});

/*me模块login页面*/
/*个人模块登陆页*/
var me_login = {
	_open:function(){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("登录");
		comm_header.addLeftBack();
		$(".me_login").show();
		comm_util.debug("me_login open success");
	},
	_close:function(){
		$(".me_login").hide();
	},
	init:function(){
		comm_util.debug("me_login init success");
		$(".me_login .register").click(function(){
			comm_page.go("me_register");
		});
		$(".me_login .forget").click(function(){
			comm_page.go("me_forget");
		});
		$(".me_login").hide();

        $(".me_login .login").click(function(){
            var obj = {};
            obj.username    = _input("username").val();
            obj.passwd      = _input("password").val();

            if($.trim(obj.username) == ""){
			    _message("请填写用户名");
                return false;
            }
            if($.trim(obj.passwd) == ""){
			    _message("请填写密码");
                return false;
            }

            _post('/login', obj, function(data){

                _message("登录成功", function(){
			        comm_page.go("me_index");
        
                    comm_util.profile();
                });
            });

        });
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	me_login.init();
});

/*me模块register页面*/
/*个人模块注册页*/
var me_register = {
	_open:function(){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("注册");
		comm_header.addLeftBack();
		$(".me_register").show();
		comm_util.debug("me_register open success");
	},
	_close:function(){
		$(".me_register").hide();
	},
	init:function(){
		comm_util.debug("me_register init success");
		$(".me_register").hide();

        $(".me_register .register").click(function(){
            var obj = {};
            obj.username = _val("username");
            obj.passwd   = _val("password");
            obj.re_passwd= _val("retype");
            obj.email    = _val("email");

            if(obj.username == ""){
                _message("请输入用户名");
                return false;
            }
            if(obj.passwd == ""){
                _message("请输入密码");
                return false;
            }
            if(obj.re_passwd != obj.passwd){
                _message("两次输入密码不一致");
                return false;
            }
            if(obj.email == ""){
                _message("请输入邮箱");
                return false;
            }
        
            _put("/register", obj, function(data){
                _message("注册成功");
            });
        });
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	me_register.init();
});

/*me模块forget页面*/
/*个人模块找回密码页*/
var me_forget = {
	_open:function(){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("找回密码");
		comm_header.addLeftBack();
		$(".me_forget .button").click(function(){
			alert("找回密码");
		});
		$(".me_forget").show();
		comm_util.debug("me_forget open success");
	},
	_close:function(){
		$(".me_forget").hide();
	},
	init:function(){
		comm_util.debug("me_forget init success");
		$(".me_forget").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	me_forget.init();
});

/*me模块settings页面*/
/*个人模块设置页*/
var me_settings = {
	_open:function(){
        var self = this;
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("设置");
		comm_header.addLeftBack();
		comm_header.addRightText("保存",function(){
            self.submit();
		});
		$(".me_settings .head").unbind("click").click(function(){
			comm_util.chooseMessage([{
				text:'拍照上传',
				click:function(){
					comm_util.message("点击了拍照上传");
				}
			},{
				text:'选择图片上传',
				click:function(){
					comm_util.message("点击了选择图片上传");
				}
			}],function(){
				comm_util.message("点击了取消");
			});
		});
		$(".me_settings .content .district").unbind("click").click(function(){
			comm_page.go("me_district","","me_district");
		});
		$(".me_settings .content .message").unbind("click").click(function(){
			comm_page.go("me_message","","me_message");
		});
		$(".me_settings").show();
		comm_util.debug("me_settings open success");
	},
	_close:function(){
		$(".me_settings").hide();
	},
	init:function(){
		comm_util.debug("me_settings init success");
		$(".me_settings").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( returnArg ,resumeArgv ){
		this._open();
		if( resumeArgv == "me_district" && returnArg ){
			//由地区页面返回过来的
			$(".me_settings .content .district .comm_input2").val(
				returnArg.province + " " + returnArg.district
			);
		}
	},
	close:function(){
		this._close();
	},
    submit:function(){
        var obj = {};
        obj.sex = $(".me_settings input[name='sex']:checked").val();
        obj.age = _val("age");
        obj.address = _val("address");
        obj.grade   = _val("grade");
        obj.email   = _val("email");
        obj.phone   = _val("phone");
        obj.weixin  = _val("weixin");
        obj.intro   = _val("intro");

        _post("/profile/"+_username(), obj, function(data){
            _message("修改成功", function(){
			    comm_page.go("me_index");
            });
        });
    }
};
$(document).ready(function(){
	me_settings.init();
});

/*me模块about页面*/
var me_about = {
	_open:function(){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("关于");
		comm_header.addLeftBack();
		$(".me_about").show();
		comm_util.debug("me_about open success");
	},
	_close:function(){
		$(".me_about").hide();
	},
	init:function(){
		comm_util.debug("me_about init success");
		$(".me_about").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	me_about.init();
});

/*me模块collect页面*/
var me_collect = {
	_addItem:function(){
		comm_bbs.addItem({
			title:"隆鼻7天后鼻子竟变得如此自然_1",
			content:"呜呜，我做的鼻子怎么变得这么低，这才一个礼拜，等过1个月岂不是更低，怎么办",
			images:[
			],
			user:"唯美的爱",
			time:"2013-10-13",
			comment:"129",
			favour:"50"
		});
		comm_bbs.addItem({
			title:"隆鼻7天后鼻子竟变得如此自然_2",
			content:"呜呜，我做的鼻子怎么变得这么低，这才一个礼拜，等过1个月岂不是更低，怎么办",
			images:[
				"/static/img/comm/sample1.png"
			],
			user:"唯美的爱",
			time:"2013-10-13",
			comment:"129",
			favour:"50"
		});
		comm_bbs.addItem({
			title:"隆鼻7天后鼻子竟变得如此自然_3",
			content:"呜呜，我做的鼻子怎么变得这么低，这才一个礼拜，等过1个月岂不是更低，怎么办",
			images:[
				"/static/img/comm/sample2.png",
				"/static/img/comm/sample3.png",
			],
			user:"唯美的爱",
			time:"2013-10-13",
			comment:"129",
			favour:"50"
		});
	},
	_open:function(){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("专家");
		comm_header.addLeftBack();
		comm_bbs.clear();
		comm_bbs.setItemClick(function(data){
			comm_util.log( data.title );
			comm_page.go("index_content",data.title);
		});
		comm_bbs.setTopMoreClick(function(){
			comm_bbs.clearItem();
			me_collect._addItem();
			comm_bbs.finishTopMoreClick();
		});
		comm_bbs.setBottomMoreClick(function(){
			me_collect._addItem();
			comm_bbs.finishBottomMoreClick();
		});
		this._addItem();
		comm_bbs.show();
		comm_util.debug("me_collect open success");
	},
	_close:function(){
		comm_bbs.hide();
	},
	init:function(){
		comm_util.debug("me_collect init success");
		$(".me_collect").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( returnArg,resumeArgv ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	me_collect.init();
});

/*me模块score页面*/
var me_score = {
	_setConfirmClick:function(fun){
		$(".me_score .button .confirm").unbind("click").click(function(){
			if( fun )
				fun();
		});
	},
	_setCancelClick:function(fun){
		$(".me_score .button .cancel").unbind("click").click(function(){
			if( fun )
				fun();
		});
	},
	_setScore:function(score){
		$(".me_score .score").text("我的积分："+score+"分");
	},
	_open:function(){
		comm_body.clear();
		comm_body.setGreyBackground();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("积分");
		comm_header.addLeftBack();
		comm_header.addRightText("积分明细",function(){
			comm_page.go("me_scoretrade","");
		});
		this._setScore(100);
		this._setConfirmClick(function(){
			comm_util.message("转账成功");
		});
		this._setCancelClick(function(){
			comm_page.back();
		});
		$(".me_score").show();
		comm_util.debug("me_score open success");
	},
	_close:function(){
		$(".me_score").hide();
	},
	init:function(){
		comm_util.debug("me_score init success");
		$(".me_score").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	me_score.init();
});

/*me模块scoretrade页面*/
var me_scoretrade = {
	_setBottomMoreClick:function( fun ){
		$(".me_scoretrade .bottommore .text").unbind("click").click(function(){
			$(".me_scoretrade .bottommore .text").hide();
			$(".me_scoretrade .bottommore .img").show();
			if( fun )
				fun ();
		});
	},
	_finishBottomMoreClick:function(){
		$(".me_scoretrade .bottommore .text").show();
		$(".me_scoretrade .bottommore .img").hide();
	},
	_clear:function(){
		$(".me_scoretrade .itemlist").empty();
		$(".me_scoretrade .bottommore .text").show();
		$(".me_scoretrade .bottommore .img").hide();
	},
	_addItem:function( data ){
		var div = 
		'<div class="comm_row item">'+
			'<div class="comm_leftcol leftinfo">'+
				'<div class="comm_row title">'+data.title+'</div>'+
				'<div class="comm_row score">'+data.score+'</div>'+
			'</div>'+
			'<div class="comm_rightcol rightinfo">'+
				'<div class="comm_row operator">'+data.operator+'</div>'+
				'<div class="comm_row time">'+data.time+'</div>'+
			'</div>'+
		'</div>';
		$(".me_scoretrade .itemlist").append($(div));
	},
	_open:function(){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("积分明细");
		comm_header.addLeftBack();
		comm_header.addRightText("积分说明",function(){
			comm_page.go("me_scoreinfo");
		});
		this._clear();
		this._addItem({
			title:"发帖自动加分",
			score:"+5",
			operator:"系统",
			time:"2014-06-07 13:03"
		});
		this._addItem({
			title:"购买积分",
			score:"+200",
			operator:"系统",
			time:"2014-06-07 13:03"
		});
		this._setBottomMoreClick(function(){
			me_scoretrade._addItem({
				title:"购买积分",
				score:"+200",
				operator:"系统",
				time:"2014-06-07 13:03"
			});
			me_scoretrade._finishBottomMoreClick();
		});
		$(".me_scoretrade").show();
		comm_util.debug("me_scoretrade open success");
	},
	_close:function(){
		$(".me_scoretrade").hide();
	},
	init:function(){
		comm_util.debug("me_scoretrade init success");
		$(".me_scoretrade").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	me_scoretrade.init();
});

/*me模块scoreinfo页面*/
var me_scoreinfo = {
	_open:function(){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("积分说明");
		comm_header.addLeftBack();
		$(".me_scoreinfo").show();
		comm_util.debug("me_scoreinfo open success");
	},
	_close:function(){
		$(".me_scoreinfo").hide();
	},
	init:function(){
		comm_util.debug("me_scoreinfo init success");
		$(".me_scoreinfo").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	me_scoreinfo.init();
});

/*me模块message页面*/
var me_message = {
	_timeInerval:null,
	_isClickReply:false,
	_setTopMoreClick:function( fun ){		
		$(".me_message .topmore .text").unbind("click").click(function(){
			$(".me_message .topmore .text").hide();
			$(".me_message .topmore .img").show();
			if( fun )
				fun ();
		});
	},
	_finishTopMoreClick:function(){
		$(".me_message .topmore .text").show();
		$(".me_message .topmore .img").hide();
	},
	_preaddItem:function( data ){
		var replyDiv = "";
		if( data.replyUser ){
			replyDiv = '<span class="comm_leftcol text1">回复</span>'+
					'<span class="comm_leftcol text2">@'+data.replyUser+'：</span>';
		}
		var replyButton = ""; 
		if( data.replyClick ){
			replyButton = '<div class="comm_leftcol replybutton">回复</div>';
		}
		var div = 
		$('<div class="comm_row item">'+
			'<div class="comm_leftcol icon">'+
				'<img class="comm_img" src="'+data.icon+'"/>'+
			'</div>'+
			'<div class="comm_row info">'+
				'<div class="comm_row title">'+data.user+'</div>'+
				'<div class="comm_row time">'+data.time+'</div>'+
				'<div class="comm_row content">'+
					replyDiv +
					'<span class="comm_row reply">'+
						data.content +
					'</span>'+
				'</div>'+
				'<div class="comm_row button">'+
					replyButton + 
					'<div class="comm_leftcol delbutton">删除</div>'+
				'</div>'+
			'</div>	'+
		'</div>');
		div.find(".replybutton").unbind("click").click(function(){
			me_message._isClickReply = true;
			me_message._showReplyMessage(data.user);
			if( data.replyClick )
				data.replyClick( );
		});
		div.find(".delbutton").unbind("click").click(function(){
			comm_util.confirmMessage("确认要删除"+data.user+"的消息",function(result){
				if( result == "yes"){
					data.removeMessage = function(){
						div.remove();
					};
					if( data.delClick )
						data.delClick();
				}
			});	
		});
		$(".me_message .itemlist").prepend(div);
	},
	_showReplyMessage:function( relpyUser ){
		
		$(".me_message .replymessage .input").html("");
		$(".me_message .replymessage .placeholder").text("回复"+relpyUser);
		$(".me_message .replymessage").show();
		clearInterval(this._timeInerval);
		this._timeInerval = setInterval(function(){
			if( $.trim($(".me_message .replymessage .input").html()).length != 0 )
				$(".me_message .replymessage .placeholder").text("");
			else
				$(".me_message .replymessage .placeholder").text("回复"+relpyUser);
		},500);
	},
	_hideReplyMessage:function(){
		$(".me_message .replymessage").hide();
		clearInterval(this._timeInerval);
	},
	_setSendMessageClick:function( fun ){
		$(".me_message .replymessage .sendbutton").unbind("click").click(function(){
			if( fun )
				fun();
		});
	},
	_clear:function( data ){
		$(".me_message .itemlist").empty();
		$(".me_message .topmore .text").show();
		$(".me_message .topmore .img").hide();
		$(".me_message .replymessage").hide();
		$(".me_message .replymessage").unbind("click").click(function(){
			me_message._isClickReply = true;
		});
		$("body").unbind("click").click(function(){
			if( me_message._isClickReply == false )
				me_message._hideReplyMessage();
			me_message._isClickReply = false;
		});
	},
	_open:function(){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("留言");
		comm_header.addLeftBack();
		this._clear();
		this._setSendMessageClick(function(){
			comm_util.message("回复成功");
			me_message._hideReplyMessage();
		});
		this._preaddItem({
			icon:"/static/img/me/person_test1.png",
			user:"樱桃小丸子",
			time:"2014-06-05 13:03",
			replyUser:"玛丽苏",
			content:"亲，已完全消肿啦~亲，已完全消肿啦~亲，已完全消肿啦~亲，已完全消肿啦~亲，已完全消肿啦~亲，已完全消肿啦~亲，已完全消肿啦~亲，已完全消肿啦~亲，已完全消肿啦~亲，已完全消肿啦~亲，已完全消肿啦~亲，已完全消肿啦~亲，已完全消肿啦~",
			delClick:function(){
				comm_util.message("删除成功");
				this.removeMessage();
			}
		});
		this._preaddItem({
			icon:"/static/img/me/person_test3.png",
			user:"苏蒂亚",
			time:"2014-06-05 13:03",
			content:"亲，最近恢复的怎么样啦？亲，最近恢复的怎么样啦？亲，最近恢复的怎么样啦？亲，最近恢复的怎么样啦？亲，最近恢复的怎么样啦？亲，最近恢复的怎么样啦？亲，最近恢复的怎么样啦？亲，最近恢复的怎么样啦？亲，最近恢复的怎么样啦？",
			delClick:function(){
				comm_util.message("删除成功");
				this.removeMessage();
			},
			replyClick:function(){
			}
		});
		this._preaddItem({
			icon:"/static/img/me/person_test1.png",
			user:"樱桃小丸子",
			time:"2014-06-05 13:03",
			replyUser:"樱桃小丸子",
			content:"亲，已完全消肿啦~亲，已完全消肿啦~",
			delClick:function(){
				comm_util.message("删除成功");
				this.removeMessage();
			}
		});
		this._preaddItem({
			icon:"/static/img/me/person_test2.png",
			user:"玛丽苏",
			time:"2014-06-05 13:03",
			content:"亲，最近恢复的怎么样啦？",
			delClick:function(){
				comm_util.message("删除成功");
				this.removeMessage();
			},
			replyClick:function(){
			}
		});
		this._setTopMoreClick(function(){
			me_message._preaddItem({
				icon:"/static/img/me/person_test2.png",
				user:"玛丽苏",
				time:"2014-06-05 13:03",
				content:"亲，最近恢复的怎么样啦？",
				delClick:function(){
					comm_util.message("删除成功");
					this.removeMessage();
				}
			});
			me_message._finishTopMoreClick();
		});
		$(".me_message").show();
		comm_util.debug("me_message open success");
	},
	_close:function(){
		$(".me_message").hide();
	},
	init:function(){
		comm_util.debug("me_message init success");
		$(".me_message").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	me_message.init();
});

/*me模块password页面*/
var me_password = {
	_open:function(){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("修改密码");
		comm_header.addLeftBack();
		$(".me_password").show();
		comm_util.debug("me_password open success");
	},
	_close:function(){
		$(".me_password").hide();
	},
	init:function(){
		comm_util.debug("me_password init success");
		$(".me_password").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	me_password.init();
});

/*me模块search页面*/
var me_search = {
	_open:function(){
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("搜索");
		comm_header.addLeftBack();
		$(".me_search").show();
		comm_util.debug("me_search open success");
	},
	_close:function(){
		$(".me_search").hide();
	},
	init:function(){
		comm_util.debug("me_search init success");
		$(".me_search").hide();
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	me_search.init();
});

/*me模块complaint页面*/
var me_complaint = {
	_open:function(){
		//设置头尾
		comm_body.clear();
		comm_footer.hide();
		comm_header.show();
		comm_header.clear();
		comm_header.addLeftBack();
		comm_header.setTitle("意见反馈");
		//设置内容
		comm_post.clear();
		comm_post.setConfirmButton("提交",function(){
			comm_util.message("提交成功");
		});
		comm_post.setCancelButton("取消",function(){
			comm_page.back();
		});
		comm_post.setTipText("这里是填写标题","这里是填写内容");
		comm_post.setAddImgButton(function(data){
			if( data == "camera")
				comm_util.message("选择拍照上传");
			else 
				comm_util.message("选择图片上传");
		});
        /*
		comm_post.addUploadImg("/static/img/comm/sample.png",function(data){
			comm_util.message("删除图片成功");
			data.delUploadImg();
		});
		comm_post.addUploadImg("/static/img/comm/sample.png",function(data){
			comm_util.message("删除图片成功");
			data.delUploadImg();
		});
        */
		comm_post.show();
		comm_util.debug("me_complaint open success");
	},
	_close:function(){
		comm_post.hide();
	},
	init:function(){
		comm_util.debug("me_complaint init success");
	},
	open:function( arg ){
		this._open();
	},
	hang:function(){
		this._close();
	},
	resume:function( arg ){
		this._open();
	},
	close:function(){
		this._close();
	}
};
$(document).ready(function(){
	me_complaint.init();
});

/*comm模块info页面*/
//����ģ��ͷ��
var comm_info = {
	setData:function(data){
		$(".comm_info .header .icon img").attr("src",data.icon);
		$(".comm_info .header .text .user").text( data.user );
		$(".comm_info .header .text .district").text( data.district );
		$(".comm_info .content .sex .value").text( data.sex );
		$(".comm_info .content .age .value").text( data.age );
		$(".comm_info .content .identity .value").text( data.identity );
		$(".comm_info .content .class .value").text( data.level );
		$(".comm_info .content .mail .value").text( data.mail );
		$(".comm_info .content .phone .value").text( data.phone );
		$(".comm_info .content .weixin .value").text( data.weixin );
		$(".comm_info .content .info .value").text( data.info );
		$(".comm_info .content .imagelist").empty();
		if( data.images ){
			for( var i = 0 ; i != data.images.length ; ++i ){
				var div = 
					'<div class="comm_leftcol img">'+
						'<img class="comm_img" src="'+data.images[i]+'"/>'+
					'</div>';
				$(".comm_info .content .imagelist").append( $(div) );
			}
		}
		$(".comm_info .content .bbsitem").unbind("click").click(function(){
			if( data.click )
				data.click();
		});
	},
	init:function(){
		$(".comm_info").hide();
	},
	show:function(){
		$(".comm_info").show();
	},
	clear:function(){
	},
	hide:function(){
		$(".comm_info").hide();
	}
};
$(document).ready(function(){
	comm_info.init();
});

/*comm模块choose页面*/
//公共模块头部
var comm_choose = {
	init:function(){
		comm_util.debug("comm_choose init success");
		$(".comm_choose").hide();
	},
	setChoose:function( choose , fun ){
		$(".comm_choose").empty();
		for( var i = 0 ; i != choose.length ; ++i ){
			var div = $('<div class="comm_row item"><div class="comm_leftcol text">'+choose[i].text+'</div></div>');
			div.data('data',choose[i].data);
			$(".comm_choose").append(div);
		}
		$('.comm_choose .item').unbind("click").click(function(){
			if( fun )
				fun( $(this).data('data') );
		});
	},
	show:function(){
		$(".comm_choose").show();
	},
	hide:function(){
		$(".comm_choose").hide();
	}
};
$(document).ready(function(){
	comm_choose.init();
});
/*comm模块bbs页面*/
//公共模块头部
var comm_bbs = {
	_clickfun:null,
	init:function(){
		comm_util.debug("comm_bbs init success");
		$(".comm_bbs").hide();
	},
	setItemClick:function( fun ){
		this._clickfun = fun;
	},
	setTopMoreClick:function( fun ){		
		$(".comm_bbs .topmore .text").unbind("click").click(function(){
			$(".comm_bbs .topmore .text").hide();
			$(".comm_bbs .topmore .img").show();
			if( fun )
				fun ();
		});
	},
	finishTopMoreClick:function(){
		$(".comm_bbs .topmore .text").show();
		$(".comm_bbs .topmore .img").hide();
	},
	setBottomMoreClick:function( fun ){
		$(".comm_bbs .bottommore .text").unbind("click").click(function(){
			$(".comm_bbs .bottommore .text").hide();
			$(".comm_bbs .bottommore .img").show();
			if( fun )
				fun ();
		});
	},
	finishBottomMoreClick:function(){
		$(".comm_bbs .bottommore .text").show();
		$(".comm_bbs .bottommore .img").hide();
	},
	addItem:function( item ){
		var images = "";
		if( item.images ){
			for( var j = 0 ; j != item.images.length ; ++j ){
				images = images + 
					'<div class="comm_leftcol img">'+
						'<img src="'+item.images[j]+'"/>'+
					'</div>';
			}
		}
		var div = $(
			'<div class="comm_row item">'+
				'<div class="comm_row title">'+
					item.title +
				'</div>'+
				'<div class="comm_row content">'+
					item.content +
				'</div>'+
				'<div class="comm_row imglist">'+
					images +
				'</div>' +
				'<div class="comm_row info">' +
					'<div class="comm_leftcol user">'+
						item.user +
					'</div>'+
					'<div class="comm_leftcol time">'+
						item.time +
					'</div>'+
					'<div class="comm_rightcol comment">'+
						item.comment + '评论'+
					'</div>' +
					'<div class="comm_rightcol favour">'+
						item.favour + '赞'+
					'</div>'+
				'</div>'+
			'</div>'
		);
		div.data("data",item);
		$(".comm_bbs .itemlist").append(div);
		$(".comm_bbs .item").unbind("click").click( function(){
			if( comm_bbs._clickfun )
				comm_bbs._clickfun( $(this).data("data") );
		});
		
	},
	show:function(){
		$(".comm_bbs").show();
	},
	clearItem:function(){
		$(".comm_bbs .itemlist").empty();
	},
	clear:function(){
		$(".comm_bbs .itemlist").empty();
		$(".comm_bbs .topmore .img").hide();
		$(".comm_bbs .bottommore .img").hide();
		$(".comm_bbs .topmore .text").show();
		$(".comm_bbs .bottommore .text").show();
	},
	hide:function(){
		$(".comm_bbs").hide();
	}
};
$(document).ready(function(){
	comm_bbs.init();
});

/*comm模块post页面*/
/*个人模块注册页*/
var comm_post = {
	_open:function(){
		comm_footer.show();
		comm_header.show();
		comm_header.clear();
		comm_header.setTitle("发帖");
		$(".comm_post").show();
		comm_util.debug("comm_post open success");
	},
	init:function(){
		comm_util.debug("comm_post init success");
		$(".comm_post").hide();
	},
	setClassifyButton:function( title , fun ){
		$(".comm_post .classify").show();
		$(".comm_post .classify .text .comm_input2").attr("placeholder",title);
		$(".comm_post .classify").unbind("click").click(function(){
			if( fun )
				fun();
		});
	},
	clearClassify:function( ){
		$(".comm_post .classify").hide();
	},
	setClassifyContent:function( title ){
		$(".comm_post .classify .text .comm_input2").val(title);
	},
	setConfirmButton:function( title , fun ){
		$(".comm_post .footer .post .comm_button").text(title); 
		$(".comm_post .footer .post").unbind("click").click(function(){
			if( fun )
				fun();
		});
	},
	setCancelButton:function( title , fun ){
		$(".comm_post .footer .cancel .comm_button2").text(title); 
		$(".comm_post .footer .cancel").unbind("click").click(function(){
			if( fun )
				fun();
		});
	},
	setTipText:function( text1,text2 ){
		$(".comm_post .header .comm_input2").attr("placeholder",text1);
		$(".comm_post .content .comm_input2").attr("placeholder",text2);
	},
	setAddImgButton:function( fun ){
        var self = this;
		$(".comm_post .uploadimg .addimg").unbind("change").change(function(e){
            e = e || window.event;
            var fileList = e.target.files;
            if (!fileList.length) {
                return false;
            }
            for (var i = 0; i < fileList.length; i++) {
                if (comm_upload.countUpload() >= comm_upload.maxUpload) {
                    _message('你最多只能上传8张照片');
                    break;
                }
                var file = fileList[i];
                if (!comm_upload.checkPicSize(file)) {
                    _message('图片体积过大');
                    continue;
                }
                if (!comm_upload.checkPicType(file)) {
                    _message('上传照片格式不支持');
                    continue;
                }
                var id = Date.now() + i;
                comm_upload.uploadInfo[id] = {
                    file: file,
                    isDone: false,
                };
 
                comm_upload.previewQueue.push(id);
            }
            if (comm_upload.countUpload() >= comm_upload.maxUpload) {
                //todo hide add button
            }
            $(this).val('');
            /*
			comm_util.chooseMessage([{
				text:"拍照上传",
				click:function(){
					if( fun )
						fun("camera");
				}
			},{
				text:"选择图片上传",
				click:function(){
					if( fun )
						fun("picture");
				}
			}],function(){
			});
            */
		});
	},
	addUploadImg:function( img, fun, image_id){
		var div = $('<div data="' + 
                image_id
                + '" class="comm_leftcol img userimg"><img class="comm_img" src="'
                + img +'"/></div>');
		div.unbind("click").click(function(){
			comm_util.confirmMessage("是否删除图片？",function(result){
				if( result =="yes"){
					var operation = {
						delUploadImg:function(){
                            // 删除上传列表的图片
                            comm_upload.uploadInfo[image_id] = null;
							div.remove();
						}
					};
					if( fun )
						fun(operation);
				}
			});
		});
		$(".comm_post .uploadimg .addimg").before(div);
	},
    removeUploadImg: function(image_id){
        $("div.userimg[data='"+image_id+"']").remove();
    },
	clear:function(){
		$(".comm_post .uploadimg .userimg").remove();
		$(".comm_post .classify").hide();
	},
	show:function(){
        comm_upload.initUpload();
		$(".comm_post").show();
	},
	hide:function(){
        comm_upload.destoryUpload();
		$(".comm_post").hide();
	}
};
$(document).ready(function(){
	comm_post.init();
});

/*comm模块header页面*/
//公共模块头部
var comm_header = {
	_addLeft:function( icon ){
		var div = $('<div class="img"><img class="comm_img"" src="'+icon.img+'"/><div class="info">'+icon.text+'</div></div>');
		div.css('width',icon.width);
		div.css('position','relative');
		div.css('height',icon.height);
		div.click( icon.click );
		$(".comm_header .left").append(div);
	},
	_addRight:function( icon ){
		var div = $('<div class="img"><img class="comm_img" src="'+icon.img+'"/><div class="info">'+icon.text+'</div></div>');
		div.css('width',icon.width);
		div.css('position','relative');
		div.css('height',icon.height);
		div.click( icon.click );
		$(".comm_header .right").append(div);
	},
	init:function(){
		comm_util.debug("comm_header init success");
	},
	setTitle:function( title){
		$(".comm_header .text").text( title );
	},
	show:function(){
		$(".comm_header").show();
	},
	hide:function(){
		$(".comm_header").hide();
	},
	addLeftBack:function(){
		this._addLeft({
			img:'/static/img/comm/back.png',
			width:'25px',
			height:'25px',
			text:'',
			click:function(){
				comm_page.back();
			}
		});
	},
	addRightSearch:function( fun ){
		this._addRight({
			img:'/static/img/comm/search.png',
			width:'25px',
			height:'25px',
			text:'',
			click:fun
		});
	},
	addRightEdit:function( fun ){
		this._addRight({
			img:'/static/img/comm/edit.png',
			width:'25px',
			height:'25px',
			text:'',
			click:fun
		});
	},
	addRightShare:function( fun ){
		this._addRight({
			img:'/static/img/comm/share.png',
			width:'25px',
			height:'25px',
			text:'',
			click:fun
		});
	},
	addRightCollect:function( fun ){
		this._addRight({
			img:'/static/img/comm/collect.png',
			width:'25px',
			height:'25px',
			text:'',
			click:fun
		});
	},
	addRightText:function( text2,fun ){
		this._addRight({
			img:'/static/img/comm/text.png',
			width:'63px',
			height:'25px',
			text:text2,
			click:fun
		});
	},
	clear:function(){
		$(".comm_header .left").empty();
		$(".comm_header .right").empty();
	},
};

function _ajax(type, url, obj, callback){
    //todo 添加loading
    $.ajax({
        type: type,
        url: url,
        data: obj,
        success: function(data){
            var data = JSON.parse(data);
            if(data.code != 0){
			    comm_util.message(data.retmessage);
                return false;
            }
            callback(data);
        },
        error: function(e){
			comm_util.message("系统错误");
        },
        complete: function(){
            //todo 删除loading
        }
    });
}

function _input(name, page){
    if(page && page != undefined){
        return $("."+ page +" input[name='" + name + "']");
    }
    else {
        return $("."+ comm_page._current_page +" input[name='" + name + "']");
    }
}

function _val(name){
    var input = _input(name);
    return $.trim(input.val());
}

function _get(url, obj, callback){
    _ajax('get', url, obj, callback);
}

function _post(url, obj, callback){
    _ajax('post', url, obj, callback);
}

function _put(url, obj, callback){
    _ajax('put', url, obj, callback);
}

function _message(text, fun){
    comm_util.message(text, fun);
}

function _cookie(name){
    var cookie_start = document.cookie.indexOf(name);
    var cookie_end = document.cookie.indexOf(";", cookie_start);
    return cookie_start == -1 ? '' : unescape(document.cookie.substring(cookie_start + name.length + 1, (cookie_end > cookie_start ? cookie_end : document.cookie.length)));
}

function _username(){
    var rt   = _cookie("remember_token");
    var name = rt.split("|");
    return name[0];
}

function _sprintf(){
    var arg = arguments,
        str = arg[0] || '',
        i, n;
    for (i = 1, n = arg.length; i < n; i++) {
        str = str.replace(/%s/, arg[i]);
    }
    return str;
}

$(document).ready(function(){
	comm_header.init();
});

/*comm模块footer页面*/
/*公共模块尾部*/
var comm_footer = {
	_curchoose:null,
	_chooseplace:{"index_index":"0%",
		"expert_index":"20%",
		"post_index":"40%",
		"near_index":"60%",
		"me_index":"80%"
	},
	init:function(){
		$(".comm_footer .item").click(function(){
			comm_footer.choose( $(this).attr("data") );
		});
		setTimeout( this.initClick , 100 );
		comm_util.debug("comm_footer init success");
	},
	initClick:function(){
		$(".comm_footer .item[data=me_index]").click();
	},
	show:function(){
		$('.comm_footer').show();
	},
	hide:function(){
		$('.comm_footer').hide();
	},
	choose:function( index ){
		if( this._curchoose != null ){
			var div = '.comm_footer .item[data='+this._curchoose+'] .text';
			var div2 = '.comm_footer .item[data='+this._curchoose+'] img';
			var color = 'rgb(152,152,152)';
			var imgsrc = '/static/img/comm/'+this._curchoose+'.png';
			$(div).css('color',color);
			$(div2).attr('src',imgsrc);
		}
		var div = '.comm_footer .item[data='+index+'] .text';
		var div2 = '.comm_footer .item[data='+index+'] img';
		var color = '#FF8549';
		var imgsrc = '/static/img/comm/'+index+'_check.png';
		$(div).css('color',color);
		$(div2).attr('src',imgsrc);
		
		var div3 = '.comm_footer .line';
		$(div3).animate({"margin-left":this._chooseplace[index]},"normal");
		this._curchoose = index;
		comm_page.change(index);
	}
};
$(document).ready(function(){
	comm_footer.init();
});

/*comm模块body页面*/
//����ģ��ͷ��
var comm_body = {
	setGreyBackground:function(){
		$("body").css("background","#F5F5F5");
	},
	setWhiteBackground:function(){
		$("body").css("background","none");
	},
	init:function(){
	},
	clear:function(){
		$("body").css("background","none");
	},
};
$(document).ready(function(){
	comm_body.init();
});