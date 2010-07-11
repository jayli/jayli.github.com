<!DOCTYPE html>
<html lang="zh">
<head>
	<title>Cubee &copy; - Taobao-UED@Beijing</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />
	<meta name="author" content="" />
	<meta name="keywords" content="" />
	<meta name="description" content="" />
	<link rel="stylesheet" type="text/css" href="../build/css/reset.css">
	<link rel="stylesheet" type="text/css" href="assets/styles/style.css">
	<link rel="stylesheet" type="text/css" href="assets/styles/highlight.css" media="all" />
	<script src="assets/scripts/highlight.js"></script>
	<script src="assets/scripts/lang-js.js"></script>
	<script src="assets/scripts/lang-xml.js"></script>
	<script src="assets/scripts/lang-html.js"></script>
	<script src="assets/scripts/lang-css.js"></script>
	<!--script src="assets/scripts/helpers.js"></script-->
	<script type="text/javascript" src="http://cn.yimg.com/i/yui/3.0.0/build/yui/yui-min.js"></script>
	</head>
	<!--?php
		foreach($_GET as $k => $v){
			$file = preg_replace('/(.php|.html)$/i','',trim($k));
		}
	?-->
 
<body>
<div id="doc">
	<div id="hd">
		<h1>Cubee</h1>
		<div class="navv">
		</div>
	</div>
	<div id="bd">
		<div class="body-wrap">
			<div class="bd-container">
				<div class="main-mod">
					<div class="main-mod-hd">
						<span class="crumb"><!--a href="http://taobao-wd.ns1.name/wiki/doku.php">WIKI首页</a> |--> <a href="start.php">开发者首页</a></span>
						<h2>首页</h2>
					</div>
					<div class="main-mod-bd">
						<div class="left-sider" id="J_sider"><!--左栏-->
							<!--loading-->
							<p class="loading"><img src="assets/images/loading.gif" border=0 /></p>
						</div>
						<div class="main">
							<div class="main-wrap" id="J_main"><!--主内容-->
								<!--?php
									if(file_exists('page/'.$file.'.php')){
										include('page/'.$file.'.php');
									}else if(file_exists('page/'.$file.'.html')){
										include('page/'.$file.'.html');
									}else{
										include('page/index.php');
									}
								?-->
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div id="ft">
	<p>维护：李晶(lijing00333@163.com) 蒋吉兵(idd.chiang@gmail.com)&nbsp;|&nbsp;copyright &copy; 2009 Taobao UED @ Beijing</p>	
	</div>
</div>
<script>
YUI({combine:true}).use('node','io',function(Y){


	//根据className返回类型
	var getType = function(className){
		var a = ['html','js','css','xml'];
		for(var i = 0;i<a.length;i++){
			if(className.indexOf(a[i]) >= 0){
				return a[i];
			}
		}
		return '';
	};

	//显示每一页
	var showDetail = function(key){
		var url = 'page/'+ key +'.php';
		Y.one('#J_main').prepend('<p class="loading" style="position:absolute;right:10px;"><img src="assets/images/loading.gif" border=0 /></p>');
		Y.io(url,{
			on:{
				complete:function(id,o){
					Y.one('#J_main').set('innerHTML',o.responseText);
					var pres = Y.all('#J_main pre');
					pres.each(function(node){
						var name = node.getAttribute('name');
						if(name == ''){
							name = 's'+new Date().getTime().toString();
							node.setAttribute('name',name);
						}
						var code = node.get('innerHTML');	
						var type = getType(node.getAttribute('className'));
						var hl = new DlHighlight({
							lang:type
						});
						var formatted = hl.doItNow(code);
						node.set('innerHTML',formatted);
						node.addClass('DlHighlight');
						/*
						DlHighlight.HELPERS.highlightByName(name, "pre", {
							lineNumbers:false
						});
						*/
					});

				}
			}
		});
	};


	//根据url得到key
	var getK = function(str){
		if(str.indexOf('#') < 0){
			k = 'index';
		}else{
			k = str.split('#')[1];
		}
		return k;
	};

	//bind 全局事件
	Y.io('guide.php',{
		on:{
			complete:function(id,o){
				Y.one('#J_sider').set('innerHTML',o.responseText);
				Y.all('#J_sider a').on('click',function(e){
					showDetail(getK(e.target.get('href')));
				});
			}
		}
	});

	showDetail(getK(window.location.href));
});
</script>
</body>
</html>
