# 快速开始

> <a href="http://demo.kissyui.com/tutorial/demo.html" class="btn btn-primary btn-lg">Try This Demo!</a> &nbsp;

## 1，复制 & 粘贴

	<script src="http://g.tbcdn.cn/kissy/k/1.4.0/seed-min.js"></script>

种子文件是一个**非常小**的 JS 文件，通过他可以动态加载 KISSY 的模块文件，因为体积很小，推荐将种子文件至于`<head>`标签内。

## 2，开始使用 KISSY

	// 创建一个 KISSY 沙箱
	KISSY.use('node',function(S,Node){
		// 装载了 Node 模块，并处于可用状态
		// Your Code here...
	});

页面生命周期内始终存在全局对象`KISSY`。KISSY 采用弱沙箱的设计，多个沙箱共享同一份 KISSY 对象，即沙箱A对KISSY的修改会影响到沙箱B，因此，不通过API就对KISSY作任何修改将会非常危险。回调函数传入的第一个参数永远是`KISSY`全局对象，紧跟着的参数将会传回模块对象。形如`use('a,b,c',function(S,A,B,C){})`。被依赖的模块实现会返回一个对象（或类），都可以通过这种方式带入当前沙箱中，KISSY 的沙箱之间通过这种方法相互传递信息，避免全局对象的污染。沙箱内定义的变量亦不会污染全局命名空间。

创建 KISSY 沙箱时你需要指定要载入的模块，KISSY 的功能是模块化的，包括`node`，`event`，`ajax`（在1.4.x中被`io`取代）等。这个例子中载入了`node`模块，在沙箱中可以通过回调参数来使用`node`的 API。**特别的**，`node`模块中最常用的 API 被挂载在 KISSY 对象上，作为快捷调用方式。比如`S.all`和`S.one`。

KISSY 会自动计算模块依赖和模块去重，将所需模块的最小子集载入到页面中。一旦 node 模块加载完成，就会执行沙箱的回调逻辑。**注意**：沙箱回调为异步执行，不管是否已经预先载入了 node。所以两个并列的沙箱的执行时机是不确定的。开发者不应当去关心沙箱的先后顺序。

> 注意，这种使用方法是**错误的**：`var Node = KISSY.use('node');`

## 3，DOM 操作：查找/操作/绑定事件

node 模块对 DOM 节点底层 API 做了封装和扩展，你可以方便查找、创建、删除、修改元素。

	KISSY.use('node', function (S) {
		// 查找 DOM 节点.
		var oneElementById     = S.one('#foo'),
			oneElementByName   = S.one('body'),
			allElementsByClass = S.all('.bar');

		// 创建 DOM 节点.
		var contentNode = S.Node('<div>'),
			listNode    = S.Node('<ul>'),
			footerNode  = S.Node('<footer>');

		// 操作节点，支持链式调用
		contentNode.html('Hello Kissy!')
					.append('<p>touch me</p>')
					.addClass('highlight')
					.appendTo('body');

		// 绑定事件
		S.one('#close-button').on('click', function (e) {
			contentNode.hide();
		});
	});

## 4，使用动画

KISSY 提供 anim 模块，完成 DOM 元素的动画，模块将自动探测硬件对 CSS3 的支持，优先使用 CSS3 动画，但上层接口保持统一。

	KISSY.use("anim",function(S,Anim){
		// 初始化动画实例
		var anim = Anim('#anim-el',
			// 动画目标样式
			{
				'background-color':'#fcc',
				'border-wdith':'5px'
			},
			// 动画时长，秒
			5,
			// 动画特效
			'bounceOut',
			// 动画结束的回调
			function(){
				alert('动画结束');
			});

		// 开始执行动画
		anim.run();
	});

## 5，通过 Ajax 装载内容

在 1.4.0 中，Ajax 功能被命名为 io 模块，使用方法：

	KISSY.use('io,node',function(S,IO,Node){
		// 获取content.html的内容，替换到#content元素内
		IO({
			url:'content.html',
			data:{
				user_name:10010
			},
			success:function(data){
				S.one('#content').html(data);
			}
		});
	});

## 6，核心模块的快捷调用方式

尽管模块内容可以通过沙箱回调参数形式带入，核心模块也将最常用的功能挂载到了`KISSY`全局对象上。可以通过`KISSY.ModeName`来调用，比如

	KISSY.use('node,anim,io,json',function(S){
		// 通过 S 来调用
		/*
			S.Ajax
			S.IO
			S.Node
			S.DOM
			S.Cookie
			S.Event
			S.Anim
			S.JSON
			S.Cookie
			...
		*/
	});

## 7，自定义模块

> <a href="http://demo.kissyui.com/tutorial/demo1.html" class="btn btn-primary btn-lg">Try This Demo!</a> &nbsp;

这个Demo和上一个的不同之处在于，我们将它改造成了一个独立的模块。

创建一个新模块：

	KISSY.add(function(S, N, E, A, IO){
		var $ = S.all;
		var opLotto = {
			init: function(){
				...
			},
			...
		}
		return opLotto;
	}, {requires: ['node', 'event', 'anim', 'ajax']});

模块其实就是一个对象，模块名可以忽略，我们会返回这个对象以便在使用模块时方便调用，最后是依赖配置。Demo中我们把这个模块保存为 `opLotto.js`。同时，我们需要指定这个模块所属的包：

	KISSY.config({
		packages: [
			{
				name: "module",
				tag: "20130618",
				path: "./", 
				charset: "gbk"
			}
		]
	});

这样来调用模块逻辑：

	KISSY.use('module/opLotto, node, event', function(S, OP, N, E){
		S.ready(function(S){
			var $ = S.all;
			OP.init();
			...
		});
	})

> 包配置相关信息请移步[KISSY模块规范](kmd.html)

## 8，调用官方组件

KISSY 内置了很多有用的组件比如 button，calendar，datalazyload等，这些组件的用法非常简单，比如要用到 button 组件，只需要：

	KISSY.use("button", function(S, Button) {
		var btn = new Button({
			content: "我是按钮1",
			render: "#button_container",
			tooltip: "hover时显示"
		});
		btn.render();
	})

## 9，调用 Gallery 中的组件

gallery 是社区贡献的组件集合，汇集了各种各样的功能，比如 kcharts，imgcrop，waterfallx，slide，uploader。

gallery 鼓励分享，任何人都可以为 gallery 提交自己的组件。在 KISSY 1.4.x 中内置了 gallery package，使用 gallery 组件非常方便：

	KISSY.use('gallery/offline/1.0/index', function (S, Offline) {
		var offline = new Offline();
		...
	});

## 10，开启模块的Combo

由于 KISSY 的模块非常颗粒化，会不会页面中载入的 JavaScript 文件过多，导致 HTTP 请求数太多呢？有两种方法来减少请求数：

- CDN 动态合并（Combo）
- 静态编译，本地合并，使用工具 [KISSY Module Compiler](kmc.html)

动态合并，比如`KISSY.use('overlay')`会带来13个请求：

![](http://gtms02.alicdn.com/tps/i2/T1IuezFfBdXXaC5N70-657-280.png)

要想开启动态Combo，在全局配置中增加一项`开启动态合并`：

	KISSY.config('combine',true);

或者这样开启：

	<script src="seed-min.js" data-config="{combine:true}"></script>

页面额外请求数变为1个：

![](http://gtms03.alicdn.com/tps/i3/T12iCAFmlaXXa2La3m-575-80.png)

Combo 后的链接为：

	http://g.tbcdn.cn/kissy/k/1.4.0/??node-min.js,dom/base-min.js,event/dom/base-min.js,event/base-min.js,event/dom/shake-min.js,event/dom/focusin-min.js,anim-min.js,anim/base-min.js,event/custom-min.js,anim/timer-min.js,event-min.js,anim/transition-min.js



