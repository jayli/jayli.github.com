/**
 * Sandbox-seed
 *		- 自动加载外部脚本
 *		- 模块依赖关系对父模块不可见
 *		- modules之间的进一步解耦
 *
 * @module Sandbox
 * @author 拔赤 lijing00333@163.com
 *
 *		- http://jayli.github.com
 *
 *
 */

//Sandbox全局对象
Sandbox = {
	/**
	 * 全局模块树，动态构建
	 * 格式：
	 *	'mojo-name':{
	 *		fullpath:'',
	 *		callback:foo,
	 *		requires:[]
	 *	}
	 * @property 
	 * @type object
	 * @default {}
	 */
	_Mojos:{},
	/**
	 * 增加一个模块到_Mojos中
	 * 参数格式：
	 *	{
	 *		mojoname:
	 *		fullpath:
	 *		callback:
	 *		requires:
	 *	}
	 * @method _addMojo
	 * @param o 要增加的object
	 * @private
	 */
	_addMojo:function(o){
		var that = this;
		that._Mojos[o.mojoname] = {};
		that._Mojos[o.mojoname].fullpath = o.fullpath;
		that._Mojos[o.mojoname].auto = o.auto;
		that._Mojos[o.mojoname].callback = o.callback;
		that._Mojos[o.mojoname].requires = o.requires;
	},
	/**
	 * 使用add添加模块的代码
	 * @method add
	 * @interface 
	 * @param mojoname 模块名称, 可以为空
	 * @param callback 回调
	 * @param config 配置，包含requires:[]，成员为外部脚本的fullpath
	 * @static
	 */
	add:function(mojoname,callback,config){
		var that = this;
		var o = {};
		if(typeof mojoname == 'function'){
			var config = callback,
				callback = mojoname,
				mojoname = 'K_'+new Date().getTime();
		}
		o.mojoname = mojoname;
		o.callback = callback;
		o.fullpath = that._RuntimeScript;
		var config = config||{};
		var requires = config.requires?config.requires:[];
		var auto = (typeof config.auto != 'undefined')?config.auto:true;//默认都是自动加载
		o.requires = requires;
		o.auto = auto;
		that._addMojo(o);
		/*
		that._loadUnloaded(function(S){

		});
		*/
	},
	/**
	 * namespace
	 * yui的namespace在闭包中对上下文要求太苛刻，重写之，只判断是否存在，不做类型处理
	 * @method namespace
	 * @param string 命名空间串
	 * @static
	 */
	namespace:function(){
		var a = arguments,o=null,d;
		for(var i = 0;i<a.length; i++){
			d = ("" + a[i]).split(".");
			var _win = this; 
			//默认根
			if(/^(S|Sandbox|SB)$/.test(d[0])){
				var j = 1;
				var _win = this;
			}else{
				var j = 0;
				var _win = window;

			}
			for(;j<d.length;j++){
				if(typeof _win[d[j]] === 'undefined')_win[d[j]] = {};
				_win = _win[d[j]];
			}
		}
		return _win;
	},
	/**
	 * 遍历_Mojos，计算当前未加载的脚本，并加载之，对排序无要求
	 * @method _loadUnloaded 
	 * @param callback 加载完成的回调 
	 * @private
	 */
	_loadUnloaded:function(callback){
		var that = this;
		var _a = [];
		for(var i in that._Mojos){
			var _req = that._Mojos[i].requires;
			for(var j = 0;j<_req.length;j++){
				if(!that._checkLoaded(_req[j])){
					_a.push(_req[j]);
				}
			}
		}
		_a = that.distinct(_a);

		var recursion = function(){
			if(_a.length == 0){
				callback(that);
				return false;
			};
			that.loadScript(_a.pop(),recursion);
		};
		recursion();
	},
	/**
	 * 检查文件是否已经加载,已经加载return true否则return false
	 * @method _checkLoaded
	 * @param fullpath 传入要检查的文件fullpath 
	 * @private
	 */
	_checkLoaded:function(fullpath){
		var that = this;
		if(that.inArray(fullpath,that._LoadQueue))return true;
		else return false;
		/*
		for(var i in that._Mojos){
			if(that._Mojos[i].fullpath == fullpath)return true;
		}
		return false;
		*/
	},
	/**
	 * 检查是否还有需要加载的脚本,true，加载完全，若返回一个脚本的fullpath，说明还有未加载的
	 * @method _checkAllLoaded 
	 * @private
	 */
	_checkAllLoaded:function(){
		var that = this;
		for(var i in that._Mojos){
			var _req = that._Mojos[i].requires;
			for(var j in _req){
				if(that._checkLoaded(_req[j]) == false){
					return _req[j];
				}
			}
		}
		return true;
	},
	_Uses:[],
	/**
	 * 创建执行模块回调的顺序存储到_ExeQueue中,一定是在脚本完全加载后执行
	 * TODO 并未用到树遍历，只是粗糙的偏等计算并去重，有待进一步改进
	 * @method _buildExeQueue
	 * @private
	 */
	_buildExeQueue:function(){
		var that = this;
		var _a = [];
		for(var i in that._Mojos){
			_a.push(that._Mojos[i].fullpath);
			var _req = that._Mojos[i].requires;
			for(var j in _req){
				_a.push(_req[j]);
			}
		}
		_a = that.distinct(_a);

		that._ExeQueue = [];
		for(var i in _a){
			for(var j in that._Mojos){
				if(_a[i] == that._Mojos[j].fullpath && (that._Mojos[j].auto == true || that.inArray(j,that._Uses))){
					that._ExeQueue.push(j);
					//break;
				}
			}
		}
		that._reorder();
		/*

		for(var i = 0;i<that._Uses.length;i++){
			if(that._Mojos[that._Uses[i]]){
				that._ExeQueue = that._ExeQueue.concat(that._Uses);
			}
		}
		*/

	},
	/**
	 * 重新排序_ExeQueue，如果不排序，同一个文件中的mojo执行顺序是倒序的
	 *
	 * @method
	 * @private
	 */
	_reorder : function(){
		var that = this;
		for(var i = 0;i<that._LoadQueue.length;i++){
			var _a = [];//[2,4,7]
			var _ta = [];//['m1','m2','m3']
			var fullpath = that._LoadQueue[i];
			for(var j = 0;j<that._ExeQueue.length;j++){
				var mojoname = that._ExeQueue[j];
				if(that._Mojos[mojoname].fullpath == fullpath){
					_a.push(j);
					_ta.push(mojoname);
				}
			}
			//这个文件中只有一个mojo，不用对_ExeQueue倒序，继续下一个循环
			if(_a.length <= 1){
				continue;
			}else{
				_a.reverse();
				for(var k = 0;k<_a.length;k++){
					var index = _a[k];
					var mname = _ta[k];
					that._ExeQueue[index] = mname;
				}
			}
		}

	},

	/**
	 * 已经loaded的脚本文件存储在这里
	 * 类似：
	 * 		['1.js','2.js']
	 * @property 
	 * @private
	 * @type []
	 */
	_LoadQueue:[],
	/**
	 * 执行模块的回调的顺序,这里的mojo-name是模块定义的时候指定的名称,重复的名称会被覆盖
	 * 类似：
	 * 		['mojo-name','mojo-name-1']
	 * @property 
	 * @private
	 * @type []
	 */
	_ExeQueue:[],

	/**
	 * 根据模块树，按照顺序执行模块树中的回调
	 * @method _runConstructors
	 * @private
	 */
	_runConstructors:function(){
		var that = this;
		that._buildExeQueue();
		var _a = that._ExeQueue.reverse();
		for(var i = 0;i<_a.length;i++){
			that._Mojos[_a[i]].callback(that);
		}
	},
	/**
	 * 当前文件的依赖的script fullpath
	 * @property 
	 * @private
	 * @type string
	 */
	_RuntimeScript:'',


	/**
	 * 主线程执行的队列，用于存放多个ready沙箱的回调
	 * item格式为：
	 * 		{callback:callback,requires:requires}
	 * @property 
	 * @static
	 * @type []
	 */
	DoQueue:[],

	/**
	 * 开启沙箱
	 * @method ready
	 * @interface 
	 * @param callback 回调
	 * @param config 配置，包含requires:[]，成员为外部脚本的fullpath
	 * @static
	 */
	ready:function(callback,config){
		var that = this;
		if(typeof config != 'undefined'){
			var requires = config.requires;
		}else{
			var requires = [];
		}
		that.DoQueue.push({callback:callback,requires:requires});
		if(that.domReady){
			that.run(requires,callback);
			return;
		}
	},

	use : function(){
		var that = this;
		var a = arguments;
		for(var i = 0;i<a.length;i++){
			that._Uses.push(a[i]);
		}
		return this;

	},
	/**
	 * 主线程开始调用各自的沙箱回调
	 * @method run
	 * @param a 主线程依赖的模块数组
	 * @param callback 回调
	 * @private
	 */
	run:function(a,callback){
		var that = this;
		var requires = that.clone(that.distinct(a?a:[])).reverse();
		var recursion = function(){
			if(requires.length == 0){
				//callback(that);
				//从这里继续
				if(that._checkAllLoaded() == true){
					that._runConstructors();
					callback(that);
				}else{
					that._loadUnloaded(recursion);
				}
				/*
				that._loadUnloaded(function(S){
					callback(S);	
				});
				*/
				return false;
			}
			that.loadScript(requires.pop(),recursion);
		};
		recursion();
	},

	/**
	 * load脚本
	 * TODO opera 10+下有bug
	 * @method loadScript
	 * @param url 脚本fullpath
	 * @param callback 回调
	 * @private
	 */
	loadScript:function(url, callback){   
		var that = this;
		that._RuntimeScript = url;
		if(that.inArray(url,that._LoadQueue)){
			callback();
			return false;
		}
		that._LoadQueue.push(url);

		//如果是css
		if(/\.css$/i.test(url)){
			that.loadCSS(url);
			callback();
			return false;
		}

	 	var script = document.createElement("script")   
	   	script.type = "text/javascript";   
	 
	   	if (script.readyState){  //IE   
			script.onreadystatechange = function(){   
			   if(script.readyState == "loaded" ||   
				 	  script.readyState == "complete"){   
					script.onreadystatechange = null;   
					callback();   
			   }   
			};   
		} else {  //Others   
			script.onload = function(){   
				callback();   
		   };   
	   }   
	 
	   script.src = url;   
	   document.getElementsByTagName("head")[0].appendChild(script);   
	},  
	/**
	 * load样式
	 * @method loadCSS
	 * @param url 脚本fullpath
	 * @private
	 */
	loadCSS:function(url){   
		var cssLink = document.createElement("link");   
		cssLink.rel = "stylesheet";   
		cssLink.rev = "stylesheet";   
		cssLink.type = "text/css";   
		cssLink.media = "screen";   
		cssLink.href = url;   
		document.getElementsByTagName("head")[0].appendChild(cssLink);   
	},
	/** 
	 * 给数组去重,前向去重，若有重复，去掉前面的重复值,保留后面的
	 * @method  distinct  
	 * @param { array } 需要执行去重操作的数组
	 * @return { array } 返回去重后的数组
	 */  
	distinct:function(A){
		var that = this;
		if(!(A instanceof Array) || A.length <=1 )return A;
		var a = [],b=[];
		for(var i = 1;i<A.length;i++){
			for(var j = 0;j<i;j++){
				if(that.inArray(j,b))continue;
				if(A[j] == A[i]){
					b.push(j);
				}
			}
		}
		for(var i = 0;i<A.length;i++){
			if(that.inArray(i,b))continue;
			a.push(A[i]);
		}
		return a;
	},
	/**
	* 判断数值是否存在数组中
	* @param { value } v : 要匹配的数值
	* @param { array } a : 存在的数组
	*/
	inArray : function(v, a){
		var o = false;
		for(var i=0,m=a.length; i<m; i++){
			if(a[i] == v){
				o = true;
				break;
			}
		}
		return o;
	},
	/**
	* 深拷贝
	* @param { object } o : 要拷贝的对象
	* @param { object } a : 返回对象
	*/
	clone : function(o){
		var fd = this;
		var objClone;
		if (o.constructor == Object || o.constructor ==  Array) objClone = new o.constructor(); 
		else objClone = new o.constructor(o.valueOf()); 
		for (var key in o){
			if (objClone[key] != o[key]){ 
				if (typeof(o[key]) == 'object'){ 
					objClone[key] = fd.clone(o[key]);
				}else{
					objClone[key] = o[key];
				}
			}
		}
		objClone.toString = o.toString;
		objClone.valueOf = o.valueOf;
		return objClone; 
	},	

	/**
	* 浏览器判断，来自yui3
	* @property
	* @static
	*/
	UA :function() {

		var numberfy = function(s) {
				var c = 0;
				return parseFloat(s.replace(/\./g, function() {
					return (c++ == 1) ? '' : '.';
				}));
			},
		
			nav = navigator,

			o = {
			ie: 0,
			opera: 0,
			gecko: 0,
			webkit: 0,
			mobile: null,
			air: 0,
			caja: nav.cajaVersion,
			secure: false,
			os: null
		},

		ua = nav && nav.userAgent, 

		loc = window.location,

		href = loc && loc.href,
		
		m;

		o.secure = href && (href.toLowerCase().indexOf("https") === 0);

		if (ua) {

			if ((/windows|win32/i).test(ua)) {
				o.os = 'windows';
			} else if ((/macintosh/i).test(ua)) {
				o.os = 'macintosh';
			}

			// Modern KHTML browsers should qualify as Safari X-Grade
			if ((/KHTML/).test(ua)) {
				o.webkit=1;
			}
			// Modern WebKit browsers are at least X-Grade
			m=ua.match(/AppleWebKit\/([^\s]*)/);
			if (m&&m[1]) {
				o.webkit=numberfy(m[1]);

				// Mobile browser check
				if (/ Mobile\//.test(ua)) {
					o.mobile = "Apple"; // iPhone or iPod Touch
				} else {
					m=ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/);
					if (m) {
						o.mobile = m[0]; // Nokia N-series, Android, webOS, ex: NokiaN95
					}
				}

				m=ua.match(/AdobeAIR\/([^\s]*)/);
				if (m) {
					o.air = m[0]; // Adobe AIR 1.0 or better
				}

			}

			if (!o.webkit) { // not webkit
				// @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
				m=ua.match(/Opera[\s\/]([^\s]*)/);
				if (m&&m[1]) {
					o.opera=numberfy(m[1]);
					m=ua.match(/Opera Mini[^;]*/);
					if (m) {
						o.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
					}
				} else { // not opera or webkit
					m=ua.match(/MSIE\s([^;]*)/);
					if (m&&m[1]) {
						o.ie=numberfy(m[1]);
					} else { // not opera, webkit, or ie
						m=ua.match(/Gecko\/([^\s]*)/);
						if (m) {
							o.gecko=1; // Gecko detected, look for revision
							m=ua.match(/rv:([^\s\)]*)/);
							if (m&&m[1]) {
								o.gecko=numberfy(m[1]);
							}
						}
					}
				}
			}
		}
		
		return o;
	}(),

	domReady:false,

	/**
	 * onDomReady
	 * @param onReady 回调
	 * @param config 配置项，包含requires:[]，成员为脚本地址
	 */
	onDOMContentLoaded:function(onready,config){
		var that = this;	
		var Browser = that.UA;
		this.conf = {enableMozDOMReady:true};  
		if( config )  
		for( var p in config)  
		    this.conf[p] = config[p];  
	   
		var isReady = false;  
		function doReady(){  
		    if( isReady ) return;  
		    isReady = true;  
			that.domReady = isReady;
		    onready();  
		}  
		/*IE*/  
		if( Browser.ie ){  
		   if (self !== self.top) {
		   	document.onreadystatechange = function() {
		   		if (document.readyState == 'complete') {
		   			document.onreadystatechange = null;
		   			doReady();
		   		}
		   	};
		   } else {
		   	(function(){  
		   		if ( isReady ) return;  
		   		try {  
		   			document.documentElement.doScroll("left");  
		   		} catch( error ) {  
		   			setTimeout( arguments.callee, 0 );  
		   			return;  
		   		}  
		   		doReady();  
		   	})();  

		   }//else over
		   window.attachEvent('onload',doReady);  

		}  
		/*Webkit*/  
		else if (Browser.webkit && Browser.version < 525){  
		    (function(){  
		   	 if( isReady ) return;  
		   	 if (/loaded|complete/.test(document.readyState))  
		   		 doReady();  
		   	 else  
		   		 setTimeout( arguments.callee, 0 );  
		    })();  
		    window.addEventListener('load',doReady,false);  
		}  
		/*FF Opera 高版webkit 其他*/  
		else{  
		    if( !Browser.ff || Browser.version != 2 || this.conf.enableMozDOMReady)  
		   	 document.addEventListener( "DOMContentLoaded", function(){  
		   		 document.removeEventListener( "DOMContentLoaded", arguments.callee, false );  
		   		 doReady();  
		   	 }, false );  
		    window.addEventListener('load',doReady,false);  
		}  


	}//DOMContentLoaded end


};

//全局启动入口
Sandbox.onDOMContentLoaded(function(){
	for(var i = 0 ;i < Sandbox.DoQueue.length;i++){
		var SD = Sandbox.DoQueue[i];
		Sandbox.run(SD.requires,SD.callback);
	}
	
});


