// ==UserScript==
// @name           TMS Hacker
// @namespace      TMS Code Editor! Just enjoy yourself!
// @description    http://github.com/jayli/tms-hacker
// @include        http://tms.taobao.com/page/editTemplate.htm
// @include        http://tms.taobao.com/page/editTemplate.htm*
// @date           2012-7-01
// @require http://a.tbcdn.cn/s/yui/3.5.0/build/yui/yui-min.js
// @version			0.1 
// ==/UserScript==

var MOJO_MAP = MOJO_MAP || {};

(function(exports,undefined){

	//使用的YUI版本
	var YUI_VERSION = '3.5.0';

	//本项目的根路径，比如 'apps/lottery/'
	var PROJECT_ROOT = '';
	
	var	CONFIG = {
		combine: true,
		comboBase: 'http://a.tbcdn.cn/??',
		root: 's/yui/'+YUI_VERSION+'/build/',
		//定制项目assets编码
		charset: 'utf-8',
		filter: {
			'searchExp': "&", 
			'replaceStr': ","
		},
		groups: MOJO_MAP,
		useBrowserConsole: true,
		logInclude: {TestRunner: true}
	};

	var X = YUI(CONFIG);

	//重写X中应当具有的全局方法
	// base:传入combineBase的地址
	X.mix(X,{
		addModule:function(o,base){
			this.applyConfig({
				groups: {
					'extend': {
						combine: true,
						comboBase: base?base:'http://a.tbcdn.cn/??',
						root: PROJECT_ROOT,
						modules: o
					}
				}
			});
			return X;
		},
		/**
		 * @param {function} callback
		 * @param {object} requires
		 * */
		ready:function(cb,requires){
			var mname = 'yui-'+Math.random().toString().replace('.','');
			this.add(mname,cb,YUI_VERSION,requires);
			this.use(mname);
			return this;
		}
		
	});

	// 全局导出
	exports.Hacker = X;
	
})(window);


/*
var els = document.getElementsByTagName('img');
for(var i = 0;i<els.length;i++){
    var el = els[i];
    var img = el.src;
    if(/static\.flickr\.com/.test(img)){
        el.src = 'http://uedmagazine.com/ued/getpic.php?p='+img;
    }
}
*/

