<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<script src="http://a.tbcdn.cn/s/yui/3.2.0/build/yui/yui-min.js" type="text/javascript"></script>
</head>
<body onload="page_load();">
<h1>
打开firebug控制台，看下log的顺序
</h1>
11111
<script>

var page_load = function(){
	console.log('pageloaded');
};

</script>
<script>
YUI({
	combine:true,
	comboBase:'http://a.tbcdn.cn/??',
	base:'http://a.tbcdn.cn/s/yui/3.2.0/build/',
	root:'s/yui/3.2.0/build/',
	filter:{
		'searchExp': '&', 
		'replaceStr': ','
	}
}).use('node',function(Y){
	Y.log(Y.one('#k2'));
	Y.on('domready',function(e){
		Y.log('domready---');	
	});
	Y.on('available',function(){
		Y.log(Y.one('#k2').get('innerHTML'));	
	},'#k2');
});
</script>


<?php
ob_flush();
flush();
sleep(3);
?>

<span id="k2">2222</span>
<?php
ob_flush();
flush();
sleep(2);
?>
3333
<script>
console.log('domready');
</script>
</body>
</html>
