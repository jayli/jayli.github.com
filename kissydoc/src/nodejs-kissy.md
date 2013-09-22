# 在Node环境中运行kissy

KISSY 可以运行在 Node 环境中，由于KISSY下辖多数模块都依赖于DOM，只有seed、oo、base、xtemplate等组件可以完整运行于 Node，因此要获得Dom支持需要载入node模块`jsdom`，jsdom 可以在服务器端生成一套完整的浏览器宿主环境。

## 在 node 环境中安装 kissy

这里使用了[JSDom](https://github.com/tmpvar/jsdom) 来生成服务端的浏览器宿主环境，KISSY 可以和任何合法的 DOM 树结构一起工作。

	npm install kissy jsdom

## 创建页面 DOM 骨架

JSDom 有非常多有用的特性，并且是高可配置的。下面的代码用JSDom创建了一个简单的浏览器页面环境，最重要的，创建了document 和window。

	var jsdom = require('jsdom');

	// 将没用的特性都关掉
	jsdom.defaultDocumentFeatures = {
		// 不需要载入外部资源
		FetchExternalResources   : false,
		// 不需要处理外部资源
		ProcessExternalResources : false,
		// 关掉随机的事件响应（处于性能考虑）
		MutationEvents           : false,
		// 不需要浏览器自带的Css选择器
		QuerySelector            : false
	};

	var dom = jsdom.defaultLevel;

	// 创建一个document和window
	var document = 
		jsdom.jsdom("<html><head></head><body><h1>Hello kissy!</h1></body></html>"),
	window = document.createWindow();

## 将 KISSY 运行起来

	var KISSY = require('kissy');

	KISSY.use('node',function(S){
		S.log(S.one('body').html());
	});

结果输出：

	<h1>Hello kissy!</h1>

## 执行 Dom 操作

我们增加一点代码，初始化一个Button组件：

	// 引用node和button
	KISSY.use('node,button',function(S,N,Button){
		
		// 常见的 DOM 操作
		S.Node('<div id="J"></div>')
			.appendTo('body');
		
		// 生成一个Button
		var b = new Button({
			content:'hello jayli',
			render:'#J'
		}).render();

		S.log(S.one('body').html());
	});

输出结果为：

	<h1>Hello kissy!</h1>
	<div id="J">
		<div class="ks-button ks-button-shown" 
				role="button" 
				style="display: ;" 
				tabindex="0" 
				hidefocus="true">
			hello jayli
		</div>
	</div>

这就是我们想要的结果，KISSY 已经成功的渲染了一个button组件

## 使用add()和use()进行代码管理

NodeJS 遵循 [CommonJS](http://www.commonjs.org) 规范，文件本身就是一个封闭的上下文。而 KISSY 遵循 [KMD](kmd.html) 规范。通过固定的模块书写格式来约定模块上下文，除了包装格式不同外，对于模块的定义是完全一致的。因此，在Node环境中也可以使用use()和add()来管理代码。使用方式请参照[KMD规范](kmd.html)。

	var KISSY = require('kissy');

	// 注册模块a
	KISSY.add('a',function(S){
		return {
			// A的模块返回
		};
	});

	// 使用模块a
	KISSY.use('a',function(S,A){
		// Your code...	
	});

在服务器端模块的载入都是阻塞式的，因此无需预定义Modules列表，即不用预先`KISSY.config('modules',{})`来定义模块依赖。

## FAQ

1，执行`eval()`时如果带有对KISSY的引用，会报错`KISSY is not defined`。比如在引用XTemplate的时候，要这样来获得KISSY全局对象

	global.KISSY=require('kissy');
