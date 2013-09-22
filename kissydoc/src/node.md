# node

Node 模块提供了对DOM节点的最高层的封装，可以创建、操作、遍历、查找Dom节点。封装后的Node节点在各个浏览器端均具有一致的API，这些API甚至在NodeList类型上也是可以用的。同时，Node还提供了对CSS、动画、事件的基本的封装。可以让你方便的操作DOM节点。

## 载入Node模块

载入KISSY种子文件后，这样载入Node模块

	// 载入 Node 模块
	KISSY.use('node',function(S,Node){
		// 装载了 Node 模块，并处于可用状态
		// Your Code here...
	});

从这里了解[use()](loader.html)方法。

## 使用Node

Node API 是基于DOM Api 实现的，定义了一系列的语法糖，让用户更舒服的使用Node api，写的代码更加优雅。如果你对标准jQuery DOM API很了解，那么你对Node API也会非常熟悉。

## 查找节点

	// 使用 S.one( [css selector string] )
	var node = S.one('#main');

	// 或者传入一个HtmlElement元素
	var bodyNode = S.one(document.body);

`one()`方法类似于jquery的$，通过传入选择器或者Dom实例来获取目标（包装后）的Node节点。如果传入一个css选择器，`one()`函数将返回第一个匹配的节点。如果要获得节点列表，需要使用`all()`方法。

> 注意：KISSY 在选择器上的实现是渐进增强的，在高级浏览器中优先使用`querySelector`和`getElementsByClassName`等原生函数，在低版本的IE中降级使用`selector/ie`的js实现。对于异类的CSS3特有的选择器，在低版本IE中用sizzle实现。这样做主要是为了精简选择器的实现代码，降低 KISSY 核心代码体积。
>
> KISSY 会根据浏览器平台加载正确的代码，用户不用关心平台，KISSY 一定会调用最合适、性能最优的选择器实现。在1.4.0中，不需要用户手动引用`sizzle`模块了，KISSY 会自行判断加载。

## 操作内容

KISSY Node 节点支持链式调用。[使用范例](http://docs.kissyui.com/docs/html/tutorials/quickstart/node.html)。

	S.one('#test')
		.parent('.fathor')
		.next()
		.html('<p></p>')
		.on('click', function() { /* ... */ });

这种风格和jQuery保持一致。创建节点：

	S.Node('<div>hello kissy</div>').appendTo('body');
	
这里的例子涉及查找子节点、父节点，找兄弟节点，修改内容，绑定事件，创建节点。

## 访问 Node 节点的属性

	var imgNode = S.one('#preview');
	var bigSrc = imgNode.attr('src');//得到imgNode的src属性

	imgNode.attr('src', 'new.png');// 设置src属性为一个新的值
	imgNode.next().html('hello world');// 设置imgNode下一个兄弟节点的innerHTML

Node 实例通过`attr`方法来读写常见的属性。一些className和innerHTML相关的常用操作，被封装为addClass、replaceClass或者html方法。更多用法请参照下文API部分。

## Node 事件操作

	S.one('#demo').on('click', function(e) {
		e.halt();
		alert('event: ' + e.type + ' target: ' + e.target.tagName); 
	});

回调传回一个门面对象`e`，e是原生事件对象，是非封装后的，这时`e.target`是裸的节点。除了preventDefault()和stopPropagation()之外，e还包含halt()方法，停止事件加阻止默认行为。

## Node 方法

Node 实例实现了一些快捷方法，用来方便用户更快捷的操作DOM节点。比如append、next、appendTo、addClass等等。

## NodeList  集合

	var doneTasks = S.all('#tasklist .completed');

	// 针对所有的节点进行操作
	doneTasks.removeClass('highlight');

	// 调用each()方法来遍历这些节点
	doneTasks.each(function (taskNode,k) {
		taskNode.html('这是第'+k+'个节点');
	});

查找节点集合最简单的办法即使用`S.all`，DOM 操作方法中，KISSY库会尽可能的返回节点集合，而非节点。通过`nodeList[i]`来获取第`i`个节点（从0开始计算）。

节点集合暴露each()方法，方便我们对节点集合进行遍历。对一个Nodelist执行attr方法，将返回第一个节点的属性值。

Node 实例支持逐级查找`S.all('.s1').all('.s2')`和`S.all('.s1 .s2')`是等价的。

> `S.all('.s1').all('.s2')`和`S.all('.s1 .s2')`毕竟还是不同的，在一个多次遍历的场景中，无报错的情况下，通常第一个用法速度优于第二个，因为S.one始终从document根节点开始查找。

KISSY 支持几乎所有的CSS3选择器。CSS3选择器种类如下：

- [CSS 3 选择器](http://www.w3.org/TR/css3-selectors/)
- [选择器 API](http://www.w3.org/TR/selectors-API/)

## 无障碍支持

KISSY 支持标准的[ARIA](http://www.w3.org/TR/wai-aria/)。即 KISSY 可以完整的支持无障碍特性。比如对[roles](http://www.w3.org/TR/wai-aria/#roles)和[state](http://www.w3.org/TR/wai-aria/#supportedState)的支持。这些特性可以和读屏软件很好的兼容，在增强html标签语义化的同时，让盲人用户使用页面更加顺畅。

	// 写一个属性
	var node = S.one('#toolbar').attr('role', 'toolbar');
	// 同时写多个属性
	node.attr({
		role: 'menu', 'aria-hidden': true 
	});

------------------------------------

# Node或NodeList 的实例方法

### all()，one() 

	S.one('.filter'); // 从document根节点开始查找一个节点
	S.all('.filter'); // 从document根节点开始查找一批节点
	node.one('.child'); // 得到当前节点下的匹配选择器的一个节点
	node.all('.children'); // 得到当前节点下的匹配选择器的节点列表

### getDOMNode()，getDOMNodes()

	node.getDOMNode();// 得到一个原生节点
	node.getDOMNodes();// 得到一个原生节点组成的数组

### end()

得到上一次 one() 和 all() 操作前的 NodeList 或者 Node 对象。引入该方法是为了更好的支持链式操作( chaining )，可以在一个语句内对不同层次得节点集合进行不同的操作.[demo](http://docs.kissyui.com/source/raw/api/core/node/end.html)。

	S.one("body").all(".d1").css("color", "red");// => 返回节点.d1
	S.one("body").all(".d1").css("color", "red").end();// => 返回节点 body
	S.one("body").all(".d1").css("color", "red")
		.end()
		.all('.d2');// => 返回节点 .d2 

### equals()

判断节点是否相等

	<div class='a b' id='a'></div>
	<div class='a b' id='b'></div>
	<script>
		KISSY.all(".a").equals(KISSY.all(".b")) // => true
	</script>

### add()

将多个Nodelist/Node对象合并为一个集合返回，原有对象不会变化，参数和all保持一致

	<p>1</p><div>2</div>
	<script>
		var pdiv = S.all("p");
		var all= pdiv.add("div");  //  pdiv 不会变化
		all.css("color","red"); // => 1,2 都为红字
	</script>

### item()

返回NodeList的某个下标表示的节点，得到的是封装后的Node节点，而非原生节点，得到原生节点直接用数组下标获取`S.all('.a')[0]`

	<div class='a' id='a'></div>
	<div class='a' id='b'></div>
	<script>
		// 取第0个节点
		S.all(".a").item(0).attr("id")  // => a
		// 取第一个节点
		S.all(".a").item(1).attr("id")  // => b
		// 取第二个节点
		S.all(".a").item(2)  // => null
	</script>

### slice()

获取包含当前节点列表选定范围内原生节点的新 NodeList 对象

	var as = S.all(".a");
	var subs = as.slice(1,3); // => subs != as
	subs.length // => 2，subs 为被截取之后的节点 

### scrollTop()

返回节点滚动条的垂直位置.[demo](http://docs.kissyui.com/source/raw/api/core/node/scrollTop-get.html)

	var p = S.all("p:first").scrollTop();
	alert(p);// 返回第一个p元素的滚动条高度

设置当前节点的滚动条的高度

	S.one('.filter').scrollTop(100);// 设置元素.filter的滚动条高度为100

一般这样获取页面的滚动条高度

	KISSY.one(document).scrollTop();
	KISSY.DOM.scrollTop();// 这两者完全一致

### scrollLeft()，用法同scrollTop()

### height() 和 width()

获得节点的计算高度或宽度，css('height') 和 height() 的区别在于 height() 返回不带单位的纯数值, 而 css('height') 则返回带单位的原始值(例如 40% ).

![](http://docs.kissyui.com/source/raw/api/core/node/height.png)

该方法也可以用来得到 windw 和 document 的高度

	S.all(window).height(); // 得到浏览器可以区域的高度, 相当于 DOM.viewportHeight()
    S.all(document).height(); //得到 html 文档的高度, 相当于 DOM.docHeight()

> 在现代浏览器中, css height 属性不包括 padding , border 或者 margin.

设置元素的高度或宽度

	S.all('.filter').height(100);// 设置一组元素的高度为100px
	S.all('.filter').height('100px');// 设置一组元素的高度为100px
	S.all('.filter').height('20em');// 设置一组元素的高度为20em

- [得到各种各样高度的demo](http://docs.kissyui.com/source/raw/api/core/node/height-get.html)
- [设置元素高度的demo](http://docs.kissyui.com/source/raw/api/core/node/height-set.html)

附图：下图为浏览器常用尺寸的获取办法，这里是通过原生节点方式获取

![](http://gtms01.alicdn.com/tps/i1/T1mB1SFhlXXXcmL1nK-609-602.gif)


### addStyleSheet()

添加样式表

	node.addStyleSheet('xx {_width:xx;}');// 可以写css hack

另外一种加样式的方法：

	var styleEl = S.all("<style>p {color:red}</style>").appendTo("head");

### append()

将参数内容插入到当前节点列表中的每个元素的末尾.

	<h2>Greetings</h2>
	<div class="container">
	  <div class="inner">Hello</div>
	  <div class="inner">Goodbye</div>
	</div>
	<script>
	KISSY.use("node",function(S,Node){
		Node.all('.inner').append('<p>Test</p>');
	});
	</script>

操作之后的结果为：

	<h2>Greetings</h2>
	<div class="container">
	  <div class="inner">
		Hello
		<p>Test</p>
	  </div>
	  <div class="inner">
		Goodbye
		<p>Test</p>
	  </div>
	</div>

把页面上已有的元素 prepend 到另外一个:

	S.all('.container').append(S.all('h2'));

如果当前节点列表只包括一个节点, 那么他将会被移到目标容器中(而不是克隆):

- [在所有段落中添加一些 html 字符串demo](http://docs.kissyui.com/source/raw/api/core/node/append-1.html)
- [给所有段落添加一个文本节点](http://docs.kissyui.com/source/raw/api/core/node/append-2.html)
- [给所有段落添加一个 `NodeList` 对象](http://docs.kissyui.com/source/raw/api/core/node/append-3.html)

### appendTo()

将当前节点列表中的每个元素插入到容器列表的每个元素的最后一个子节点后面.

我们可以创建元素后立即插入到多个已有元素:

	S.all('<p>Test</p>').appendTo('.inner');

也可以把一个已有元素插入到另一个

	S.all('h2').appendTo(S.all('.container'));

如果容器列表只有一个节点, 那么当前节点列表会被移动到容器内(不是克隆):

- [把多个 span 插入到已有元素](http://docs.kissyui.com/source/raw/api/core/node/appendTo.html)

### prepend()

用法同append()，prepend()表示插入到最前

### prependTo()

用法同prependTo()，prependTo()表示插入到最前

### insertBefore()

在某个节点之前插入节点

	S.all('<p>Test</p>').insertBefore('.inner');

也可以操作现有元素

	S.all('h2').insertBefore(S.all('.container'));

如果目标节点只有一个, 那么当前节点就会移动到目标节点之前。

- [把段落插入到 div 节点之前Demo](http://docs.kissyui.com/source/raw/api/core/node/insertBefore.html)

### before()

和insertBefore()方法的功能一样, 只不过参数意义不同, insertBefore 表示当前节点列表被插入到参数目标节点之前, 而该方法则表示参数节点被插入到当前节点之前.

- [Demo](http://docs.kissyui.com/source/raw/api/core/node/before.html)

### insertAfter()

用法类似于insertBefore()

### after()

用法类似于before()

### animate()

对当前节点(列表)上做动画，返回一个NodeList实例。

	var node=KISSY.all(".foo");
	node.animate({
		width:100,
		height:300
	}, {
		duration: 2000,
		easing:'easeBoth' ,
		complete: function () {
		}
	});

等价于

	KISSY.all(".foo").each(function(n){
		new KISSY.Anim(n,...).run();
	});

参数请参照[Anim](anim.html)。

### stop()

停止当前动画，同`Anim.stop()`。

### pause()

停止当前节点列表的动画，同`Anim.pause()`

### resume()

继续当前节点的动画，含义同`Anim.resume()`

### isRunning()

判断当前节点是否在做动画的过程中

### isPaused()

判断当前节点是否已经暂停动画

### show()

显示当前节点

	node.show();// 直接显示
	node.show(0.5,function(){
		// 0.5 秒后执行这里的回调	
	});

### hide()

隐藏节点

	node.hide();// 直接隐藏
	node.hide(0.5,function(){
		// 0.5 秒后执行这里的回调	
	});
	
### toggle()

更改节点的隐藏和显示状态

	node.toggle();// 直接切换显示状态
	node.toggle(0.5,function(){
		// 0.5 秒后执行这里的回调	
	});

### fadeIn()

当前节点以渐隐效果显示

	node.fadeIn(1,function(){
		// 1 秒后执行回调	
	},easeIng);
	// easyIng 取值请参照Anim

### fadeOut()

当前节点渐隐效果消逝，用法同fadeIn()

### fadeToggle()

当前节点渐隐效果切换显示状态

### slideDown()

当前节点从上到下滑动显示，参数同fadeIn()

### slideUp()

当前节点从下到上活动显示，参数同fadeIn()

### slideToggle()

当前节点上下滑动切换显示状态，参数同fadeIn()

### filter()

对于NOdeList过滤出符合条件的节点，返回NodeList

	KISSY.use('node',function(S,Node)){
		var els = S.all('a').filter('.container');
		// 过滤出className为container的a标签
	});

### test()

根据选择器获取的所有元素是否都符合过滤条件

	var els = S.all('a');
	console.log(els.test('.container'));//a标签是否都包含class名container

### clone()

节点的深度克隆，用法：`node.clone(deep,withDataAndEvent,deepWithDataAndEvent)`

参数默认值：

- deep:false
- withDataAndEvent:false
- deepWithDataAndEvent:false

比如这段代码

	<div class="container">
		<div class="hello">Hello</div>
		<div class="goodbye">Goodbye</div>
	</div>

如果将页面中已经存在的节点插入到其他位置，它会从原来的位置移除，类似：

	KISSY.one('.hello').appendTo('.goodbye');

DOM 结构变为：

	<div class="container">
		<div class="goodbye">
			Goodbye
			<div class="hello">Hello</div>
		</div>
	</div>

为了阻止原来的元素移动，而插入一个元素的复制版本，那么你可以这样写

	KISSY.one('.hello').clone(true).appendTo('.goodbye');

这样DOM结果为：

	<div class="container">
		<div class="hello">Hello</div>
			<div class="goodbye">
			Goodbye
			<div class="hello">Hello</div>
			<div class="hello">Hello</div>
		</div>
	</div>

默认情况下 clone 后的元素不会具备源元素的 data 属性以及事件绑定，但是如果你设置了 `withDataAndEvent=true` , 那么 clone 后的元素也会具备源元素的 data 属性以及事件绑定。

	node.clone(true,true);

更进一步的你可以设置 deepWithDataAndEvent 来使得 clone 后元素的子孙元素也具备源元素对应子孙元素的 data 属性和事件绑定.注意这时 deep 参数也要设置为 true.

	node.clone(true,true,true);

源元素的对象以及数组类型的 data 属性只是引用被复制到 clone 后的元素，他们的值则会在源元素以及克隆元素间共享，如果想进行 deep copy，请手动进行

	var elem=KISSY.one(".hello").attr("custom",{x:1});
	elem.clone().attr("custom",{x:2});

[克隆后保留原有事件逻辑Demo](http://docs.kissyui.com/source/raw/api/core/dom/clone.html)

### empty()

清除节点的所有子孙节点以及子孙节点上的事件.

### replaceWith()

将 node 节点（数组）替换为新的节点（数组） newNode

### hasClass()

判断当前节点是否包含某个className

### addClass()

给当前节点增加一个className

### removeClass()

从当前节点删除一个className

### replaceClass()

className的替换

	// 将.container的className类名更改为other-class
	S.one('.container').replaceClass('container','other-class');

### toggleClass()

如果存在某个classname，则移除，否则就添加上

### removeAttr()

移除节点的属性

### attr()

读写dom节点的属性

	// 批量设置属性
	node.attr({
		{ src: 'kissy.png', width: 400, height: 400 }
	});
	node.attr('id','myId');// 设置单个属性
	node.attr('id');//=>得到id的值

### hasAttr()

判断节点是否包含某个属性

### prop()

读写dom节点的属性值，和attr的不同在于，prop()读写的是dom节点自身具有的属性，而attr()的范围更大，但相比于prop()在某些场景下不够精确。比如，我可以通过attr来设置一个自定义属性，prop则不行：

	node.attr('data-my-key','my-value');// 有效
	node.prop('data-my-key','my-value');// 无效

例如设置 input 或 button 的 disabled property 或者 checkbox 的 checked property。最常见的情况即是用 prop 来设置 disabled 以及 checked 而不要用 attr() 方法 . 而 val() 方法用来设置和读取 value property.

	var c = S.Node("<input type='checkbox' checked='checked'/>");
	console.log(c.attr('checked'));//=>'checked'
	console.log(c.prop('checked'));//=>true
	console.log(c.attr('nodeName'));//=> undefined
	console.log(c.prop('nodeName').toLowerCase());// => input

	c.prop("disabled", false); // ok
	c.prop("checked", true); // ok
	c.val("someValue"); // ok

[Demo:selectionStart/End 兼容](http://docs.kissyui.com/source/raw/demo/dom/selection-start.html)

### hasProp()

判断节点是否原生具有某个属性

当你使用该方法时, 请先考虑下是否是自定义 property , 如果是自定义 property 推荐采用 data() 系列方法. 如果是 DOM property , 一般直接判断 prop() 返回值即可

### val()

读写元素的value值

	node.val(); // 读
	node.val('test');// 写

### text()

读写元素的文本值

### css()

读写dom节点的样式

	// 写单个样式
	node.css('position','absolute');
	// 批量写样式
    node.css({position: 'absolute', top: '10px', left: '10px'});
	// 读样式
	node.css('position');

### offset()

读写元素的位置
	
	// 读位置
	var a = node.offset();
	/* a 是一个坐标对象
		{
			top:100,
			left:20
		}
	*/

	// 写位置
	node.offset({
		'top':100,
		'left':20
	});

### scrollIntoView()

将节点显示在视口范围内

	node.scrollIntoView();// 将node显示在视口范围内
	node.scrollIntoView(true);// 强制上端和左端与窗口上端和左端对齐
	//第二个参数：是否允许容器左右滚动以保证元素显示在其可视区域.
	node.scrollIntoView(true,true);

### parent()

查找祖先节点

	node.parent();//返回父元素
	node.parent('.container');//返回满足选择器格式的父级元素，会一直向上找，直到document
	node.parent(['.a','.b']);//同时查找多个
	// 可以通过自定义函数来查找父级节点
	node.parent(function(p){
		// 注意：这里p是原生节点
		return p.className == 'myclass';
	});
	
### index()

查找当前节点在众兄弟节点的索引位置

	node.index();// => 返回本节点在兄弟节点中的索引位置
	node.index('selector');// => 返回node在匹配选择器节点中的位置

### next()

找到下一个同级节点，如果没有下一个同级节点，则返回null

	node.next();//下一个兄弟节点，若无，返回null
	node.next('.class');//返回下一个符合选择器的兄弟节点

### prev()

返回上一个同级兄弟节点，如果没有，返回null，用法参照next()

### first()

返回node的第一个子节点

	node.first();//返回node第一个子节点
	nodelist.first();//返回nodelist里第一个node的第一个子节点

### last()

返回node最后一个子节点，用法同first()

### siblings()

获得node节点的兄弟节点

	node.siblings();//返回node所有兄弟节点
	node.siblings('.filter');//获得符合‘.filter’的兄弟节点

### children()

返回node的所有子节点

	node.children();//返回所有子节点
	node.children('.filter');返回符合选择器的所有子节点

注意这里的子节点不包含文本节点

### contains()

判断node节点是否包含另外一个节点，参数可以是textNode。

	node.contains('.selector');// 是否包含选择器匹配的（第一个）节点
	node.contains(otherNode);//传入node参数
	node.contains([node1,node2]);//传入数组
	node.contains(domNode);//传入裸的节点亦可
	node.contains(nodeList);//这时会判断nodeList的第一个元素是否和node具有包含关系

### html()

读写元素的innerHTML属性

	node.html();//返回innerHTML
	node.html('abc');//设置node的innerHTML
	node.html('abc<script>alert(22);</script>',true);// 执行innerHTML中的脚本

### remove()

从DOM树中删除当前节点

### data()

读写DOM元素的扩展属性(expando)，embed, object, applet 这三个标签不能设置 expando。该函数并不能读取 data-xx 伪属性。

	node.data('data-size','100');// data-size 的 expando , 值为 100;
	node.data('data-size');//100

要注意伪属性、DOM自有属性、和扩展属性expando之间的差别

	// 给dom元素写了一个伪属性
	S.one('button').attr('data-x','asd');
	// 通过data 是读不出来的
	console.log(S.one('button').data('data-x'));

但这样可以：

	// 给dom元素写了一个扩展属性expando
	S.one('button').attr('data-x','asd');
	// 通过data 是可以读出来的，但无法通过浏览器工具查看到button上有这个属性data-x
	console.log(S.one('button').data('data-x'));

### removeData()

删除某个扩展属性

### hasData()

判断是否具有某个属性，hasData() 可以判断一个元素是否经过 data() 设置过扩展属性，而如果直接调用 data( selector ) 那么当元素没有设置过扩展属性时，会在元素上关联一个空存储对象，并返回它.

### unselectable()

让node节点变为不可选择的节点。在 ie 下会引发该元素鼠标点击获取不到焦点, 在 firefox 下要得到同样的效果则需要阻止 mousedown 事件.

### innerWidth()

获取node的innerWidth，包含padding

	<div style="width: 100px;">
		<div id="test" style="width: 80%; height: 20px; padding: 10px;"></div>
	</div>
	<script>
		var S = KISSY, DOM = S.DOM,
		elem = S.get('#test');

		DOM.innerWidth(elem); // 返回 100
		DOM.innerHeight(elem); // 返回 40
	</script>

### innerHeight()

获取node的innerHeight，用法同innerWidth

### outerWidth()

返回node的outerWidth，注意: 该值除了包含元素本身宽度和 padding 外, 还包含 border或margin .

	<div style="width: 100px;">
		<div id="test" style="width: 80%; 
					height: 20px; 
					padding: 10px;
					border: 2px solid gray;
					margin: 6px;"></div>
	</div>
	<script>
		var S = KISSY, DOM = S.DOM,
		elem = S.get('#test');

		DOM.outerWidth(elem); // 返回 104
		DOM.outerHeight(elem); // 返回 44
		DOM.outerWidth(elem, true); // 返回 116
		DOM.outerHeight(elem, true); // 返回 56
	</script>

### outerHeight()

返回node的outerHeight，用法同上

### on()

on 方法是给文档添加行为的主要方式. 所有的事件类型, 例如 focus , mouseover , resize 都是有效的事件类型。window 的 beforeunload 和 error 事件使用了不标准的方式, 该方法不支持, 请直接在 window 对象上注册事件处理器.

当一个节点的某个事件出发时, 绑定该事件的所有处理器都会被调用.如果有多个事件处理器, 则他们的执行顺序和绑定的顺序保持一致, 当所有的事件处理器执行完毕后, 事件才继续向上传播.

	S.one('#foo').on('click',function(){
		// 其中this是原生节点
		alert('clicked : '+this.id);
	});

上面的代码作用是：为 id 为 foo 的元素绑定 click 事件.当用户在该元素内部点击时, 则 alert 会弹出来.

### detach()

接触绑定事件，用法参照[Event](event.html)

### fire()

模拟事件发生。用 Event.on 绑定的事件处理器可以被用户触发的原生事件调用. 但是这些事件处理器也可以使用 fire 手动调用. 调用 fire() 和用户触发导致的处理器调用调用是一样的顺序.[参照这个demo](http://docs.kissyui.com/source/raw/api/core/event/fire.html)

	node.on('click',function(){
		// 其中this是原生节点
		alert(this.text());
	});

	node.fire('click');


