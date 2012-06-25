/*! Sandbox.js (Sandbox :: a funny js Loader)
v1.0 (c) Jayli (bachi@taobao.com)
MIT License
http://github.com/jayli/sandbox

	 _____                 _ _               
	/  ___|               | | |              
	\ `--.  __ _ _ __   __| | |__   _____  __
	 `--. \/ _` | '_ \ / _` | '_ \ / _ \ \/ /
	/\__/ / (_| | | | | (_| | |_) | (_) >  < 
	\____/ \__,_|_| |_|\__,_|_.__/ \___/_/\_\

*/
;(function(exports){var mix=function(o,a){for(var i in a){o[i]=a[i];}};var S=function(){arguments.callee.ready.apply(arguments.callee,arguments);};mix(S,{_autoload:function(){if(typeof window.__autoload=='undefined'){return false;}else{return true;}},_parseAutoload:function(code){var that=this;if(!that._autoload())return[];var map=__autoload();var removeComments=function(code){return code.replace(/(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g,'\n').replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g,'\n');};var trim=function(s){return s.replace(/(^\s*)|(\s*$)/g,"");};code=removeComments(code);var pattern,i;var ret=[],match;for(i in map){var str=i.replace('.','\\.');pattern=new RegExp('[^.]\\b'+str+'\\s*','g');while((match=pattern.exec(code))){var f=trim(match[0]);if(f&&map[f]){if(that._checkLoaded(map[f]))continue;ret.push(map[f]);}}}
return ret;},_Mojos:{},_addMojo:function(o){var that=this;that._Mojos[o.mojoname]={};that._Mojos[o.mojoname].fullpath=o.fullpath;that._Mojos[o.mojoname].auto=o.auto;that._Mojos[o.mojoname].attached=false;that._Mojos[o.mojoname].callback=o.callback;that._Mojos[o.mojoname].requires=o.requires;},add:function(mojoname,callback,config){var that=this,o={};if(typeof mojoname=='function'){var config=callback,callback=mojoname,mojoname='K_'+Math.random().toString().replace('.','');}
o.mojoname=mojoname;o.callback=callback;o.fullpath=that._RuntimeScript;var config=config||{},requires=config.requires?config.requires:[],auto=(typeof config.auto!='undefined')?config.auto:true;o.requires=requires;o.auto=auto;that._addMojo(o);return this;},namespace:function(){var a=arguments,o=null,d;for(var i=0;i<a.length;i++){d=(""+a[i]).split(".");var _win=this;if(/^(S|Sandbox|SB)$/.test(d[0])){var j=1,_win=this;}else{var j=0,_win=window;}
for(;j<d.length;j++){if(typeof _win[d[j]]==='undefined')_win[d[j]]={};_win=_win[d[j]];}}
return _win;},_loadUnloaded:function(callback){var that=this,_a=[];for(var i in that._Mojos){var _req=that._Mojos[i].requires;for(var j=0;j<_req.length;j++){if(!that._checkLoaded(_req[j])){_a.push(_req[j]);}}}
_a=that.distinct(_a);var recursion=function(){if(_a.length==0){callback(that);return false;};var _item=_a.reverse().pop();_a=_a.reverse();that.loadScript(_item,recursion);};recursion();},_checkLoaded:function(fullpath){var that=this;if(that.inArray(fullpath,that._LoadQueue))return true;else return false;},_checkAllLoaded:function(){var that=this;for(var i in that._Mojos){var _req=that._Mojos[i].requires;for(var j in _req){if(that._checkLoaded(_req[j])==false){return _req[j];}}}
return true;},_Uses:[],_buildExeQueue:function(){var that=this,_a=[];for(var i in that._Mojos){_a.push(that._Mojos[i].fullpath);var _req=that._Mojos[i].requires;for(var j in _req){_a.push(_req[j]);}}
_a=that.distinct(_a);that._ExeQueue=[];for(var i in _a){for(var j in that._Mojos){if(_a[i]==that._Mojos[j].fullpath&&(that._Mojos[j].auto==true||that.inArray(j,that._Uses))){that._ExeQueue.push(j);}}}
that._reorder();},_reorder:function(){var that=this;for(var i=0;i<that._LoadQueue.length;i++){var _a=[],_ta=[],fullpath=that._LoadQueue[i];for(var j=0;j<that._ExeQueue.length;j++){var mojoname=that._ExeQueue[j];if(that._Mojos[mojoname].fullpath==fullpath){_a.push(j);_ta.push(mojoname);}}
if(_a.length<=1){continue;}else{_a.reverse();for(var k=0;k<_a.length;k++){var index=_a[k],mname=_ta[k];that._ExeQueue[index]=mname;}}}},_LoadQueue:[],_ExeQueue:[],_runConstructors:function(){var that=this;that._buildExeQueue();var _a=that._ExeQueue.reverse();for(var i=0;i<_a.length;i++){if(that._Mojos[_a[i]].attached){continue;}
that._Mojos[_a[i]].attached=true;var callback=that._Mojos[_a[i]].callback;var ret=that._parseAutoload(callback.toString());if(ret.length==0||callback.done){callback(that);}else{that.ready(callback,{requires:ret});}
callback.done=true;}},_RuntimeScript:'',DoQueue:[],ready:function(callback,config,status){var that=this;if(typeof config=='boolean'){arguments.callee.apply(this,[callback,{requires:[]},config]);return this;}
var status=typeof status=='undefined'?false:true;if(typeof config!='undefined'){var requires=config.requires;}else{var requires=[];}
if(that.domReady||status){that.run(requires,callback);return this;}
that.DoQueue.push({callback:callback,requires:requires});return this;},use:function(){var that=this;var a=arguments;for(var i=0;i<a.length;i++){if(that.domReady){that.run(that._Mojos[a[i]].requires,that._Mojos[a[i]].callback);}else{that._Uses.push(a[i]);}}
return this;},run:function(a,callback){var that=this;var requires=that.distinct(a?a:[]).concat().reverse();var recursion=function(){if(requires.length==0){if(that._checkAllLoaded()==true){that._runConstructors();var ret=that._parseAutoload(callback.toString());if(ret.length==0||callback.done){callback(that);}else{that.ready(callback,{requires:ret});}
callback.done=true;}else{that._loadUnloaded(recursion);}
return false;}
that.loadScript(requires.pop(),recursion);};recursion();return this;},_loadingQueue:[],loadScript:function(url,callback){var that=this;that._RuntimeScript=url;if(that.inArray(url,that._LoadQueue)){callback();return false;}
if(url instanceof Array){if(url.length==1){that.loadScript.apply(that,[url[0],callback]);return false;}
var _url=url.reverse().pop();url=url.reverse();that.loadScript(_url,function(){that.loadScript.apply(that,[url,callback]);});return false;}
if(that.inArray(url,that._loadingQueue)){setTimeout(function(){that.loadScript.apply(that,[url,callback]);},100);return;}
that._loadingQueue.push(url);if(/\.css$/i.test(url)){that.loadCSS(url);that._LoadQueue.push(url);callback();return false;}
var script=document.createElement("script")
script.type="text/javascript";if(script.readyState){script.onreadystatechange=function(){if(script.readyState=="loaded"||script.readyState=="complete"){script.onreadystatechange=null;that._LoadQueue.push(url);callback();}};}else{script.onload=function(){that._LoadQueue.push(url);callback();};}
script.src=url;document.getElementsByTagName("head")[0].appendChild(script);},loadCSS:function(url){var cssLink=document.createElement("link");cssLink.rel="stylesheet";cssLink.rev="stylesheet";cssLink.type="text/css";cssLink.media="screen";cssLink.href=url;document.getElementsByTagName("head")[0].appendChild(cssLink);},load:function(){var that=this;var a=[];var _cb=arguments[arguments.length-1];var cb=(typeof _cb)=='function'?_cb:new Function;for(var i=0;i<arguments.length;i++){if(typeof arguments[i]=='string'){a.push(arguments[i]);}}
that.ready(cb,{requires:a});return this;},distinct:function(A){var that=this;if(!(A instanceof Array)||A.length<=1)return A;var a=[],b=[];for(var i=1;i<A.length;i++){for(var j=0;j<i;j++){if(that.inArray(j,b))continue;if(A[j]==A[i]){b.push(j);}}}
for(var i=0;i<A.length;i++){if(that.inArray(i,b))continue;a.push(A[i]);}
return a;},inArray:function(v,a){var o=false;for(var i=0,m=a.length;i<m;i++){if(a[i]==v){o=true;break;}}
return o;},UA:function(){var numberfy=function(s){var c=0;return parseFloat(s.replace(/\./g,function(){return(c++==1)?'':'.';}));},nav=navigator,o={ie:0,opera:0,gecko:0,webkit:0,mobile:null,air:0,caja:nav.cajaVersion,secure:false,os:null},ua=nav&&nav.userAgent,loc=window.location,href=loc&&loc.href,m;o.secure=href&&(href.toLowerCase().indexOf("https")===0);if(ua){if((/windows|win32/i).test(ua)){o.os='windows';}else if((/macintosh/i).test(ua)){o.os='macintosh';}
if((/KHTML/).test(ua)){o.webkit=1;}
m=ua.match(/AppleWebKit\/([^\s]*)/);if(m&&m[1]){o.webkit=numberfy(m[1]);if(/ Mobile\//.test(ua)){o.mobile="Apple";}else{m=ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/);if(m){o.mobile=m[0];}}
m=ua.match(/AdobeAIR\/([^\s]*)/);if(m){o.air=m[0];}}
if(!o.webkit){m=ua.match(/Opera[\s\/]([^\s]*)/);if(m&&m[1]){o.opera=numberfy(m[1]);m=ua.match(/Opera Mini[^;]*/);if(m){o.mobile=m[0];}}else{m=ua.match(/MSIE\s([^;]*)/);if(m&&m[1]){o.ie=numberfy(m[1]);}else{m=ua.match(/Gecko\/([^\s]*)/);if(m){o.gecko=1;m=ua.match(/rv:([^\s\)]*)/);if(m&&m[1]){o.gecko=numberfy(m[1]);}}}}}}
return o;}(),domReady:false,onDOMContentLoaded:function(onready,config){var that=this;var Browser=that.UA;this.conf={enableMozDOMReady:true};if(config)
for(var p in config)
this.conf[p]=config[p];var isReady=false;function doReady(){if(isReady)return;isReady=true;that.domReady=isReady;onready();}
if(Browser.ie){if(self!==self.top){document.onreadystatechange=function(){if(document.readyState=='complete'){document.onreadystatechange=null;doReady();}};}else{(function(){if(isReady)return;try{document.documentElement.doScroll("left");}catch(error){setTimeout(arguments.callee,50);return;}
doReady();})();}
window.attachEvent('onload',doReady);}
else if(Browser.webkit&&Browser.version<525){(function(){if(isReady)return;if(/loaded|complete/.test(document.readyState))
doReady();else
setTimeout(arguments.callee,10);})();window.addEventListener('load',doReady,false);}
else{if(!Browser.ff||Browser.version!=2||this.conf.enableMozDOMReady)
document.addEventListener("DOMContentLoaded",function(){document.removeEventListener("DOMContentLoaded",arguments.callee,false);doReady();},false);window.addEventListener('load',doReady,false);}}});S.onDOMContentLoaded(function(){for(var i=0;i<S.DoQueue.length;i++){var SD=S.DoQueue[i];S.run(SD.requires,SD.callback);}});exports.Sandbox=S;}(this));
