
# Hello World!

--------------------------------------------

首先，我们来运行一些最简单的例子帮你了解 KISSY<span class="badge">Examples</span>：

**种子**：获取最新的 KISSY 1.4.0 [种子文件地址](http://g.tbcdn.cn/kissy/k/1.4.0/seed-min.js)

<div class="alert alert-info">
	<div style="font-size:20px;">http://g.tbcdn.cn/kissy/k/1.4.0/seed-min.js</div>
</div>

**启动**：Hello World!

	KISSY.ready(function(S){
		alert('Hello World!');
	});

**DOM操作**：获取一个className叫`continue`的`button`，并将它的内容改为"Hello Kissy"。

	KISSY.use('node',function(S){
		S.one('button.continue').html('Hello Kissy!');
	});

**事件处理**：点击一个id为`click-me`的`button`，显示`#banner-msg`的内容。

	KISSY.use('node',function(S){
		S.one('#click-me').on('click',function(e){
			S.one('#banner-msg').show();
		});
	});

**Ajax**：请求一个`api/getWeather`的接口，带入参数`zipcode`，将结果显示在`#weather-con`中。

	KISSY.use('io,node',function(S){
		S.io({
			url:'/api/getWeather',
			data:{
				zipcode:10010
			},
			success:function(data){
				S.one('#weather-con').html('<em>' + data + '</em> 摄氏度');
			}
		});
	});

> [开始进入学习教程](startup.html)