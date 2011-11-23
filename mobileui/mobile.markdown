<style>
p img {
	float:none;
}
</style>
# 自适应屏幕的移动终端UI设计和实现

<div style="width:425px" id="__ss_8864452"> <strong style="display:block;margin:12px 0 4px"><a href="http://www.slideshare.net/lijing00333/mobile-ui-design-and-developer" title="Mobile UI design and Developer" target="_blank">Mobile UI design and Developer</a></strong> <iframe src="http://www.slideshare.net/slideshow/embed_code/8864452" width="425" height="355" frameborder="0" marginwidth="0" marginheight="0" scrolling="no"></iframe> <div style="padding:5px 0 12px"> View more <a href="http://www.slideshare.net/" target="_blank">presentations</a> from <a href="http://www.slideshare.net/lijing00333" target="_blank">jay li</a> </div> </div>

随着移动终端的普及，我们已经能明显感觉到这场革命给我们的生活带来的影响。针对移动设备的开发也早就开始流行起来，传统的移动设备应用开发往往不可移植，在iphone上作的软件在android上也要重新编码实现。而Web良好的平台兼容性的优势就体现了出来。但由于各种移动设备的屏幕分辨率的不同，设计师还是要针对各种分辨率设计UI，因此也要有多套前端实现，成本依然很好，于是就有人提出了“自适应屏幕的UI设计”，也就是说让设计同时兼顾到各种分辨率，在代码上作一些渐进增强的处理，做到一套代码适用于多套终端，减少了开发和维护的成本。

除了分辨率的因素之外，实现过程还需考虑另一个重要的参数：DPI，即每英寸的像素个数。因为尽管设备的尺寸固定，但由于分辨率和DPI的不同，从而在设计时的尺寸考量也不同。如图所示这两个尺寸看起来不一样，但在设备上的实际尺寸是一样的：

![](http://img03.taobaocdn.com/tps/i3/T1neaCXkdeXXXXXXXX-652-573.png)

现在主流设备的分辨率和DPI的参数如下：

![](http://img02.taobaocdn.com/tps/i2/T1vWmCXXNFXXXXXXXX-473-267.png)

在Web领域中，jQuery在移动设备兼容方面作了不少探索性工作，其中jQuery Mobile框架也带给人眼前一亮的感觉。它就做到了比较好的设备屏幕的自适应。不仅仅是jQuery Mobile框架，还有很多网站都应当做到设备的自适应性，比如下面这套wordpress的皮肤

![](http://img02.taobaocdn.com/tps/i2/T1iuGCXeXbXXXXXXXX-605-405.png)

[这篇文章](http://www.alistapart.com/articles/responsive-web-design)可以算是自适应UI的实现方面的鼻祖，第一次比较系统的阐述了自适应UI实现需要注意的方面。

在html编码时，在载入样式的时候是可以指定所适用的设备的，比如这段代码就指定了样式所应用的设备类型：

	<!—显示器样式-->
	<link rel="stylesheet" 
		type="text/css" 
		href="core.css" 
		media="screen" /> 

	<!—打印机样式-->
	<link rel="stylesheet" 
		type="text/css" 
		href="print.css" 
		media="print" />

也可以直接指定设备的参数：

	<!—显示器样式 & 显示器最大宽度480px-->

	<link rel="stylesheet" 
		type="text/css”
		media="screen and (max-device-width:480px)" 
		href="shetland.css" />

或者直接在CSS样式中添加设备参数的控制：

	/* 显示器最大宽度480px */
	@media screen and (max-device-width: 480px) { 
		.column {
			float: none; 
		} 
	}

对于那些不支持样式的设备识别功能的设备，比如IE中，也可以使用条件注释来实现：

	<!--[if IE 6]>
		<link href=“ie6.css” />
	<![endif]-->
	…
	<!--[if lt IE 9]> 
		<script src=“html5shim.js"></script> 
	<![endif]-->

代码实现的基本原理就是这样，但对于设计师来讲这是一个不小的挑战，要颠覆之前基于像素的设计，而要基于百分比进行设计，之前的设计稿是静态的，现在的设计稿则是动态的，有很多变化中的样式也需要设计师考虑，难度大大增加了。这里我给出了一些设计原则，算是抛砖引玉吧：

- 等比缩放：对于有较少设计元素的页面，在不同的分辨率下最好能等比缩放
- 栅格模式：栅格原理在移动终端UI设计中同样适用，比如这个框架http://lessframework.com
- 功能减法：从大屏幕到小屏幕过渡时，一些次要的功能模块就应该去掉，保持在小屏幕中显示最关键的内容
- 修饰减法：不同的屏幕，视觉元素和功能所占的比例有区别，比如PC终端可以更多的进行视觉表现，而移动终端则要减少视觉元素，突出功能性需求
- 流式布局：流式布局是一种基于百分比进行布局的方法，这种布局方式更多情况下适用于文字较多的页面。
- 纯语义化：由于要做到不同设备的适应，因此一套代码更应当作良好规划，也就是说要做到充分的语义化开发。

这些方面更多的是设计原则，还有其他实现方面要考虑的原则，这些原则包括：

- 手持设备优先
- 语义化标签
- @media检测
- @media & JavaScript渐进增强
- 正文自适应
- 图片尺寸压缩
- Webkit vs Opera Mini

由于篇幅关系，这些内容会在下期讲解。
