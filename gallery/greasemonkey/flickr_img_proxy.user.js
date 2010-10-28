// ==UserScript==
// @name           Flickr img proxy
// @namespace      Flickr img proxy
// @description    http://www.uedmagazine.com
// @include        http://www.flickr.com/
// @require http://a.tbcdn.cn/s/yui/3.2.0/build/simpleyui/simpleyui-min.js
// ==/UserScript==

var els = document.getElementsByTagName('img');
for(var i = 0;i<els.length;i++){
	var el = els[i];
	var img = el.src;
	if(/static\.flickr\.com/.test(img)){
		el.src = 'http://uedmagazine.com/ued/getpic.php?p='+img;
	}
}
