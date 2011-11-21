<style>
p img {
	float:none;
}
</style>
# 附录A jQuery基础

目前已经有很多类库让开发者能够更加容易地处理DOM，但流行度和赞誉很少有能与jQuery抗衡的。理由：jQuery的API非常优秀，轻量，基于命名空间，不会和正在使用的任何东西冲突。更多的是，jQuery非常容易扩展；已经开发出了一个完整的plug-ins网站（http://plugins.jquery.com/），上面从JavaScript校验到进度条统统都有。

jQuery的命名空间是在jQuery这个变量下面的，它的别名是一个简单的美元符号“$”。和其他类库如Prototype（http://prototypejs.org/）不同的是，它没有扩展任何的JavaScript原生的对象，最大程度上避免和其他类库的冲突。

关于jQuery的其他方面重点需要理解的是选择器。如果你熟悉CSS，选择器应该是你的第二天性。所有jQuery的实例方法都运行在选择器之上，故除了在元素上迭代遍历，还可以只用选择器来获取它们。在jQuery选择器上调用任何函数都会在每个被选中的元素上执行。

举例来说，在所有类名为foo的元素上增加一个值为selected的类名。第一个例子基于纯JavaScript，第二个使用JQuery：

	// 原生JavaScript代码
	var elements = document.getElementsByClassName("foo");
	for (var i=0; i < elements.length; i++) {
	  elements[i].className += " selected";
	}
	// jQuery 代码
	$(".foo").addClass("selected");

从而，可以看到jQuery的选择器API是如何极大地降低代码量的。来深入看一下这些选择器。就如同在CSS中会使用ID（“#”）来选择元素一样，你可以在jQuery中这么做：

	// 通过ID选择元素
	var element = document.getElementById("wem");
	var element = $("#wem");
	// 通过class选择所有元素
	var elements = document.getElementsByClassName("bar");
	var elements = $(".bar");
	// 通过标签选择所有元素
	var elements = document.getElementsByTagName("p");
	var elements = $("p");
	
就像在CSS中，还可以用复合选择器来选择更具体的元素：

	// 选择.bar中的.foo
	var foo = $(".bar .foo");

甚至使用属性选取一个元素：

	var username = $("input[name='username']");

或则，选择第一个匹配的元素：

	var example = $(".wem:first");

每当我们在选择器上调用一个函数，在所有选中的元素上都会起作用：

	// 给所有的.foo元素添加一个名为'bar'的class
	$(".foo").addClass("bar");

刚才提到过，所有jQuery的函数都是基于命名空间的，故如果在一个DOM元素上直接调用它们就会失败：

	// 这段代码会失败
	var element = document.getElementById("wem");
	element.addClass("bar");

相反，如果想用jQuery的API，首先要用jQuery实例将该元素包装起来：

	var element = document.getElementById("wem");
	$(element).addClass("bar");
	
## DOM遍历

一旦已经选择了一些元素，相对于它们，jQuery提供了许多方法（http://api.jquery.com/category/traversing/）来找到其他的元素：

	var wem = $("#wem");
	// 找到匹配的子节点
	wem.find(".test");
	// 选择父节点
	wem.parent();
	// 或者，得到一组父节点，通过传入一个指定的选择器来匹配父节点
	wem.parents(".optionalSelector");
	// 选择（第一个元素的）直接的子节点
	wem.children();

或者，也可以在这些元素内部进行遍历：

	var wem = $("#wem");
	// 通过指定索引位置0来返回元素
	wem.eq( 0 );
	// 返回第一个元素,和$.fn.eq(0)
	wem.first();
	// 通过传入一个选择器来过滤得到所匹配的元素
	wem.filter(".foo");
	// 同脱传入一个匹配函数来过滤所需要的元素
	wem.filter(function(){
	  // this, is the current element
	  return $(this).hasClass(".foo");
	});
	// 返回元素的匹配给定选择器的子孙节点
	wem.has(".selected");
	
jQuery也有一些迭代器，map()和each()，它们接受一个回调：

	var wem = $("#wem");
	// 将选中的每个元素都传入一个函数
	// 根据返回值来构建一个新数组
	wem.map(function(element, index){
	  assertEqual(this, element);
	  return this.id;
	});
	// 使用一个函数来遍历每个选中的元素，和`for`循环等价
	wem.each(function(index, element){
	  assertEqual(this, element);
	  /* ... */
	});
	
同时还可以给选择器手动添加元素：

	// 添加所有的p元素到给定的选择器上
	var wem = $("#wem");
	wem.add( $("p") );
	
## DOM操作

然而，jQuery不仅仅是选择器；它还有一个强大的API来接口DOM并操作DOM。除了选择器，jQuery的构造器接受HTML标签输入，并生成新的新的元素：

	var element = $("p");
	element.addClass("bar")
	element.text("Some content");
	
将新元素到DOM中也非常简单——只要使用jQuery的append()或prepend()函数即可。为了解决性能问题，理想状态下你希望在生成的元素上在添加到DOM之前再做一些操作：

	// 追加一个元素
	var newDiv = $("<div />");
	$("body").append(newDiv);
	// 将元素作为第一个子节点添加到母节点中
	$(".container").prepend($("<hr />"));
	
或者，在另一个元素之前/之后插入一个元素：

	// 在元素之后插入节点
	$(".container").after( $("<p />") );
	// 在元素之前插入节点
	$(".container").before( $("<p />") );
	
删除元素也很简单：

	// 删除元素
	$("wem").remove();
	
那改变元素的属性如何呢？jQuery也提供同样的支持。例如，使用addClass()函数为元素添加类名：

	$("#foo").addClass("bar");
	// 移除一个class
	$("#foo").removeClass("bar");
	// 判断元素是否包含某个class
	var hasBar = $("#foo").hasClass("bar");
	
设置和获取CSS样式也同样足够简单。css()函数同时扮演getter和setter的角色，这个依赖于传递给它参数类型：

	var getColor = $(".foo").css("color");
	// 设置颜色样式
	$(".foo").css("color", "#000");
	// 或通过传入对象来对多个样式设置值
	$(".foo").css({color: "#000", backgroundColor: "#FFF"});
	
jQuery还提供一些最常用的样式变更的快捷方法：

	// 隐藏元素
	$(".bar").hide();
	// 显示元素
	$(".bar").show();
	
或者，如果希望逐渐改变不透明度：

	$(".foo").fadeOut();
	$(".foo").fadeIn();
	
jQuery的getter和setter函数不仅限于CSS。例如，可以使用html()函数来获取和设置元素的内容：

	// 得到这个选择器对应元素的HTML代码
	var getHTML = $("#bar").html();
	// 给这个选择器所对应的元素设置HTML代码
	$("#bar").html("<p>Hi</p>");
	
text()函数也是一样道理，只是它的参数内容会被转义：

	var getText = $("#bar").text();
	$("#bar").text("Plain text contents");
	
最后，删除一个元素的所有子元素，只要使用empty()函数：

	$("#bar").empty();
	
## 事件

在浏览器中处理事件经历了一个动荡的历史后，结果就是API各不相同，缺少一致性。jQuery为我们处理这个问题，提供了一个统一的API消除了各种浏览器之间的差异。下面是jQuery的事件处理的一个简要的概况，但想要参考更多的信息，请看第二章以及它的官方文档（http://api.jquery.com/category/events/）。

使用bind()函数来添加事件处理句柄，传递进事件类型和回调函数：

	$(".clicky").bind("click", function(event){
	  // 发生点击事件时执行这里的代码
	});
	
jQuery为常用的事件提供了一些快捷方法，除了调用bind()函数，还可以这样做，如下：

	$(".clicky").click(function(){ /* ... */ });
	
还有一个事件可能经常会用到就是document.ready。在页面加载过程中触发，它在DOM完成后在有一些如图片等加载完之前。jQuery提供了一个优雅的方式——直接给jQuery对象传递一个函数即可：

	jQuery(function($){
	  // document.ready时执行这里的代码
	});

经常让jQuery新手迷惑的地方就是回调中上下文的改变。例如，在上面的例子中，回调的上下文变成指向该元素，此处就是$(".clicky")：

	$(".clicky").click(function(){ 
	  // ‘this’指向事件的目标对象
	  assert( $(this).hasClass(".clicky") );
	});
	
如果在回调中使用this就导致一个问题。习惯用法就是将上下文保存到一个局部变量中，常常命名为self：

	var self = this;
	$(".clicky").click(function(){ 
	  self.clickedClick();
	});
	
另一种方法就是使用jQuery.proxy()代理函数将回调包装起来，如下：
	$(".clicky").click($.proxy(function(){ 
	  // 上下文不会改变
	}, this));
	
想了解事件委托和上下文更多的信息，请参考第二章。

## Ajax

Ajax或XMLHttpRequest，在各个浏览器之间的实现也是差别很大的。jQuery也将它进一步的抽象，消除了这些差别，提供了我们一个漂亮的API。在第三章中详细介绍了jQuery的Ajax接口API，这里有一个简要的概况。

jQuery有一个底层的函数叫ajax()，同时提供了几个高层的抽象。ajax()函数接受一个哈希对象来设置一些选项，如端点url，请求的类型type，还有成功后的success回调函数：

	$.ajax({
	  url: "http://example.com",
	  type: "GET",
	  success: function(){ /* ... */ }
	});
	
尽管如此，jQuery提供了快捷方法使得API调用更加简洁：
	$.get("http://example.com", function(){ /* on success */ })
	$.post("http://example.com", {some: "data"});
	
jQuery的dataType选项告诉jQuery如何来处理Ajax响应。不指定，默认情况下，jQuery通过响应头信息做一个智能的推测。如果你知道响应的类型，最好能明确地的设置类型：

	// 请求一个 JSON
	$.ajax({
	  url: "http://example.com/endpoint.jso",
	  type: "GET",
	  dataType: "json",
	  success: function(json){ /* ... */ }
	});
	
jQuery同时对常用的数据类型提供请求的快捷方法，如getJSON()，就等同于上面的ajax()函数调用：

	$.getJSON("http://example.com/endpoint.json", function(json){ /* .. */ });
	
想更深入的分析理解jQuery的Ajax接口API中的选项，请参考第三章以及其官方的文档。

## 做个好市民

jQuery为自己能做个web好市民而感到非常自豪；例如，它完全基于命名空间，没有污染全局作用域。但jQuery对象的别名$其他类库也经常使用，如Prototype。因此，为了避免这种冲突，应该使用jQuery的noConfilct模式，来改变它的别名并释放$：

	var $J = jQuery.noConflict(); 
	assertEqual( $, undefined );
	
当你在写jQuery扩展时，应该假设jQuery的noConflict模式是打开的，也就是说$并不指代jQuery对象。然而，在实际情况中$是非常有用的快捷变量，因此最佳实践是保证它是个局部变量：

	(function($){
	  // $ 是局部变量
	  $(".foo").addClass("wem");
	})(jQuery);
	
为了简单化，jQuery在document.ready事件中将其本身作为参数传递进来：

	jQuery(function($){
	  // 当页面加载完成后执行这里的代码
	  assertEqual( $, jQuery );
	});

## 扩展

再也没有比扩展jQuery更简单的事情了。如果想要添加类函数，只要直接在jQuery对象上创建函数即可：

	jQuery.myExt = function(arg1){ /*...*/ };
	// 这样就可以使用它了
	$.myExt("anyArgs");

如果想要添加函数实例，并且能在元素的选择器上有效，只要在jQuery.fn对象上创建函数即可，它其实就是jQuery.prototype的别名。最佳实践是在扩展的最后返回当前上下文（也就是说，this），这样就能链式调用了：

	jQuery.fn.wemExt = function(arg1){
	  $(this).html("Bar");
	  return this;
	};
	$("#element").wemExt(1).addClass("foo");

另一个最佳实践就是将扩展用模块的模式（http://goo.gl/czZm）来封装，这可以避免作用域泄露和变量冲突。将扩展包装在一个匿名函数中，所有的变量都是局部的：

	(function($){
	  // Local context in here
	  var replaceLinks = function(){
		var re = /((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g;
		$(this).html(
		 $(this).html().replace(re, '<a target="_blank" href="$1">$1</a> ')
		);
	  };
	  $.fn.autolink = function() {
		return this.each(replaceLinks);
	  };
	})(jQuery);
	
## 构建一个Growl的jQuery插件

将我们学到jQuery知识理论联系实际，创建一个Growl库试试。对于不熟悉Growl的人来说，先介绍一下：它是Mac OS X的通知类库（http://growl.info/），应用程序可以用来在桌面上显示消息而不会让用户感到很冒失。接下来，我们将来模拟该OS X类库，在页面中用JavaScript来显示消息，如在图A-1所示。

![](http://img04.taobaocdn.com/tps/i4/T17PmBXfhSXXXXXXXX-239-209.png)

图A-1,Growl消息举例

首先创建一个#container的div，我们所有的消息元素都是它的后代。如你所见，我们引入了jQuery和jQuery UI类库——后面将使用后者来添加一些效果。当页面加载完，我们添加叫container的div：

	//= require <jquery>
	//= require <jquery.ui>
	(function($){
	  var container = $("<div />");
	  container.attr({id: "growl"});
	  $(function(){
		// 页面加载完成后，追加这个容器
		$("body").append(container);
	  });
	  /* ... */
	})(jQuery);
	
下面是插件的逻辑部分。每当有一个新消息，我们就给container元素添加一个div。给消息添加一个drop效果，一段时间以后，淡出，并且将它删除——就像OS X里Growl的行为一样：

	$.growl = function(body){
	  // 创建这个Growl元素
	  var msg = $("<div />").addClass("msg");
	  msg.html(body);
	  // 将它追加至列表中
	  container.append(msg);
	  // 添加一个拖拽特效，然后将其删除
	  msg.show("drop", { 
		direction: "down", 
		distance: 50 
	  }, 300).
		delay(2000).
		fadeOut(300, function(){
		  $(this).remove();
		});
	  return msg;
	};

以上就是所需的全部JavaScript代码。咋看上去还是有些丑陋，我们可以用CSS3修饰一下。我们想让#container绝对定位在页面的右下角：

	#growl {
	  position: absolute;
	  bottom: 10px;
	  right: 20px;
	  overflow: hidden;
	}
	
接下来给消息元素添加一些样式。我很喜欢Growl的HUD主题，试着模拟一下。使用rgba让背景有一点点透明，然后添加一个嵌入状的box-shadow，让元素的一种高光的效果：

	#growl .msg {
	  width: 200px;
	  min-height: 30px;
	  padding: 10px;
	  margin-bottom: 10px;
	  border: 1px solid #171717;
	  color: #E4E4E4;
	  text-shadow: 0 -1px 1px #0A131A;
	  font-weight: bold;
	  font-size: 15px;
	  background: #141517;
	  background: -webkit-gradient(
		linear, left top, left bottom, 
		from(rgba(255, 255, 255, 0.3)), 
		color-stop(0.8, rgba(255, 255, 255, 0))), 
		rgba(0, 0, 0, 0.8);
	  -webkit-box-shadow: inset 0 1px 1px #8E8E8E;
	  -moz-box-shadow: inset 0 1px 1px #8E8E8E;
	  box-shadow: inset 0 1px 1px #8E8E8E;
	  -webkit-border-radius: 7px;
	  -moz-border-radius: 7px;
	  border-radius: 7px;
	}
	
上面就是全部所需的内容。可以看到创建jQuery插件是多么地简单。还有一些其他的例子，请在这里assets/appA/growl.html查看完全版源代码。
