<style>
p img {
	float:none;
}
</style>
# 附录C CSS3参考

在CSS2.1之下要产出优美的用户接口比较棘手，因为这通常需要牵扯到很多额外的包装、图片和JavaScript等。CSS3试图解决这些问题，它提供了很多有用的属性和选择器来帮助你创建神奇的用户接口。

在设计Web应用程序时，我常常跳过Photoshop，而直接投向CSS3和HTML5的怀抱。鉴于这些强大的技术，再设计静态的PSD原型感觉有点多余了。客户也更欣赏这种方式，因为他们能够和产品的HTML原型进行交互，用户体验方面得到了更好的感受。

与此同时我也听到你的哭喊：“旧版本的浏览器怎么办呢？”当然使用CSS3的黄金时间还没有到来吗？好吧，问题的答案就是优雅降级。旧版本的浏览器会忽略CSS3样式，回退到标准的样式。例如，在Chrome中，用户将看到应用程序全部的光晕、渐变等等所有的效果，但在IE7中，它就不会那么漂亮，只是提供所有的基本功能。

对于IE6，我主张一同放弃支持吧！Fackbook、Amazon和Google都开始放弃支持，少量的IE6用户不用那么努力支持也是可行的。Web在发展，旧的技术应该被抛弃。

主流浏览器有IE、Firefox、Chrome和Safari。Chrome和Safari有相同的渲染引擎叫WebKit，但它们的JavaScript引擎是不一样的。两个浏览器之间只有一些细微的差别——它们使用不同的图形库——在Chrome中的修复会推进到WebKit，反之亦然。

在本书撰写之时微软发布了IE9。希望不要用太长的时间它能被大众所接纳，因为对比以前的版本它有一个很大的进步，甚至包含了对CSS3的很多支持。

作为一名前端工程师，当下是一个难以置信的兴奋的时刻，你应该考虑立即使用这些新的技术。

## 前缀

浏览器厂商以前就一直在实现CSS3，但它还未成为真正的标准。为此，当有一些CSS3样式语法还在波动时，它们提供了浏览器特殊性的前缀。例如，CSS3渐变样式在Firefox和Safari中不同的。Firefox使用-moz-linear-gradient，而Safari（WebKit）使用-webkit-gradient，这两种语法都使用厂商类型的前缀。
可以使用不同的前缀如下：

- Chrome: -webkit-
- Safari: -webkit-
- Firefox: -moz-
- IE: -ms-
- Opera: -o-
	
因此，应该先用有厂商前缀的指定样式，紧接着使用无前缀的。这可以保证当浏览器移除了前缀，使用标准CSS3规范时，你写的样式仍然有效：

	#prefix-example {
	  -moz-box-shadow: 0 3px 5px #FFF;
	  -webkit-box-shadow: 0 3px 5px #FFF;
	  box-shadow: 0 3px 5px #FFF;
	}
	
## 颜色

CSS3提供了几种指定颜色的新方法，包括Alpha透明度。创建透明颜色的老方法一般是使用1px x 1px的背景图片，但现在你可以将它抛在难脑后了。

rgb的风格可以指定颜色的红、绿和蓝字段——三原色——而不是传统的十六进制数值。使用Safari Web Inspector很容在两种方法之间转换——只要在Style选项中点击一个颜色即可。

下面的例子等同于十六进制的#FFF——也就是白色：

	#rgb-example {
	  //     rgb(red, green, blue);
	  color: rgb(255, 255, 255);
	}
	
也可以使用hsl风格，它代表了色度、饱和度和亮度。

HSL有三个值：

色度

颜色齿轮的度数；0（或360）代表红色，120代表绿色，240代表蓝色。之间的数值代表了不同的颜色。

饱和度

百分比数值；100%完全显示该颜色。

亮度

百分比数值；0%代表暗（黑色），100%代表亮（白色），50%就是平均值。
	
为rgb或hsl增加Alpha透明度也很简单——只要使用rgba或hsla即可。Alpha透明度是一个0（透明）到1（不透明）的数值。

	#alpha-example {
	  background: hsla(324, 100%, 50%, .5);
	  border: 1em solid rgba(0, 0, 0, .3);
	  color: rgba(255, 255, 255, .8);      
	}

浏览器支持情况：

- Firefox: 全部支持
- Chrome: 全部支持
- Opera: 全部支持
- Safari: 全部支持
- IE: 全部支持
- Opera: 全部支持
	
## 圆角

在CSS2.1中做圆角是件吃力的工作，常常需要很多额外的标签、多张图片，甚至要用到JavaScript。

现在就简单多了——只需要应用border-radius样式即可。如同padding和margin样式用法，可以对不同的角分别指定不同的角半径，或者两个值来指定水平和垂直的角半径，或者一个值来指定所有的角半径。如果指定的半径值足够大，甚至能够创建出一个圆形：

	border-radius: 20px;
	// 水平，垂直
	border-radius: 20px 20px;
	// 左上，右上，右下，左下
	border-radius: 20px 20px 20px 20px;
	
浏览器支持情况：

- Firefox: 全部支持
- Chrome: 全部支持
- Safari: 使用-webkit-
- IE >= 9.0: 全部支持
- Opera: 全部支持
	
## 下拉阴影

在CSS3之前，很多人不曾被下拉阴影困扰过，因为它非常难做。因此，CSS3提供了box-shadow样式，使用它实现起来就轻而易举了。但是也不要用过火了，那样只会让人看上去很扎眼；下拉阴影同时也非常消耗性能。

box-shadow接受一些选项：水平偏移量、垂直偏移量、模糊半径、可选的延伸距离和颜色。如果提供inset选项，该阴影会在元素内部绘制；否则，默认情况是在元素外部绘制的。并且可以指定多个阴影，只要使用逗号分隔即可，如下代码所示：

	// 水平偏移量,垂直偏移量，模糊直径,颜色
	box-shadow: 10px 5px 15px #000;
	// 内阴影
	box-shadow: 10px 5px 15px #000 inset;
	// 水平偏移量，垂直偏移量，模糊直径，延展距离，颜色
	box-shadow: 10px 5px 15px 15px #000;
	// 多阴影
	box-shadow: 0 1px 1px #FFF inset, 5px 5px 10px #000;
	
设计师通常在他们的作品中指定一个光源，它让界面看起来更加有型和生动。使用box-shadow就很容易做到——只要指定1px白色嵌入阴影即可。这个例子中，光源处于页面的上方；为了保持样式的一致性，代码如下：

	#shadow-example {
	  -moz-box-shadow: 0 1px 1px #FFF inset;
	  -webkit-box-shadow: 0 1px 1px #FFF inset;
	  box-shadow: 0 1px 1px #FFF inset;
	}
	
浏览器支持情况：

- Firefox: 全部支持
- Chrome: 使用-webkit-
- Safari: 使用-webkit-
- IE >= 9.0: 全部支持
- Opera: 全部支持
	
## 文本阴影

在CSS3之前，实现文本阴影的唯一方法就是用图片替换——一种邪恶解决方案。CSS3使用text-shadow样式为文本增加阴影。只要传入水平偏移量、垂直偏移量、可选的模糊半径和颜色即可：

	// 水平偏移量，垂直偏移量，颜色
	text-shadow: 1px 1px #FFF;
	// 水平偏移量，垂直偏移量，模糊直径，颜色
	text-shadow: 1px 1px .3em rgba(255, 255, 255, .8);
	
文本阴影和box-shadow不一样，因为前者并没有延伸距离或嵌入阴影。但还是可以通过设置文本阴影的位置为inset或outset来欺骗用户的眼睛。如果阴影的垂直偏移量为负值，并且在文本之上，那么它看起来是嵌入的。相应的，如果阴影在文本之下，它看起来是外折的。

浏览器支持情况：

- Firefox: 全部支持
- Chrome: 全部支持
- Safari: 全部支持
- IE: 不支持
- Opera: 全部支持
	
## 渐变

以前，渐变是通过背景图片的重复平铺来实现的。这意味着它们必须有固定的宽度或高度，为此需要打开图片编辑器来修改。

CSS3增加了线性和径向性渐变的支持，这是它最有用的特性之一。还有一些CSS函数你可以调用来生成渐变，可以在任何需要用到颜色的地方来使用这些函数。

对于线性渐变，只要给linear-gradient函数传递一个你希望颜色值列表即可：

	linear-gradient(#CCC, #DDD, white)

默认情况下，渐变是垂直方向的；但也可以传递一个位置参数来改变方向：

	// 水平渐变
	linear-gradient(left, #CCC, #DDD, #FFF);
	// 或者给定一个倾斜角度
	linear-gradient(-45deg , #CCC , #FFF)
	
如果需要更多地控制渐变开始过渡的位置，可以使用颜色停止值。只要与颜色值一起指定一个百分比或像素值即可：

	linear-gradient(white , #DDD 20% , black)

还可以从透明色开始过渡或过渡到透明色：

	radial-gradient( rgba(255, 255, 255, .8) , transparent )

Safari当前还有一个明显的语法上的不同。不过，它马上也将皈依标准，但现在用法如下：

	// -webkit-gradient(<type>, <point> [, <radius>]?, <point> [, <radius>]? 
	//[, <stop>]*);
	-webkit-gradient(linear, left top, left bottom, 
	from(#FFF), color-stop(10%, #DDD), to(#CCC));
	
虽然大多数主流浏览支持CSS渐变标准，但都使用厂商前缀语法格式：

- Firefox: 使用-moz-
- Chrome: 使用-webkit-
- Safari: 以其他实现方式
- IE >= 10: 使用-ms-
- Opera >= 11.1: 使用-o-
	
所以，一个能跨浏览器工作的渐变样式看上去是这样的：

	#gradient-example {
	  /* Fallback */
	  background: #FFF;
	  /* Chrome < 10, Safari < 5.1 */
	  background: -webkit-gradient(linear, left top, left bottom, from(#FFF), to(#CCC));
	  /* Chrome >= 10, Safari >= 5.1 */
	  background: -webkit-linear-gradient(#FFF, #CCC);
	  /* Firefox >= 3.6 */
	  background: -moz-linear-gradient(#FFF, #CCC);
	  /* Opera >= 11.1 */
	  background: -o-linear-gradient(#FFF, #CCC);
	  /* IE >= 10 */
	  background: -ms-linear-gradient(#FFF, #CCC);
	  /* The standard */
	  background: linear-gradient(#FFF, #CCC);
	}
	
哎，上面这样真是难以一口气写下来！所幸的是，类似Less和Sass这样的项目为你减轻了痛苦，本章后续会详细阐述。

## 多重背景

就像在CSS3中能够指定多个阴影一样，也可以指定多重背景。以前，想要设置多张背景图片，就需要创建很多个元素——也就是说，需要过多额外的标签。CSS3提供以逗号分隔的背景样式，最大限度的较少了标签使用总量：

	background: url(snowflakes.png) top repeat-x,
	  url(chimney.png) bottom no-repeat,
	  -moz-linear-gradient(white, #CCC),
	  #CCC;

浏览器支持情况：

- Firefox: 全部支持
- Chrome: 全部支持
- Safari: 全部支持
- IE >= 9.0: 全部支持
- Opera: 全部支持
	
## 选取器

CSS3提供一系列新的目标元素选择器：

:first-child

选择器选中的第一个元素

:last-child

选择器选中的最后一个元素
	
:only-child

选中的元素是其父元素的唯一子元素

:target

选中当前URL的hash中的目标元素

:checked

选中复选框已被勾选的元素
	
下面列出来的选择器是我想详细阐述的。

### nth-child选择器
使用:nth-child可以修改第n个子元素的样式。例如，下面的选择器选中第3n个子元素：

	#example:nth-child( 3n ) { /* ... */ }

这就可以用来选中偶数或奇数的子元素：

	/* 偶数子节点 */
	#example:nth-child( 2n )   { /* ... */ }
	#example:nth-child( even ) { /* ... */ }
	/* 奇数子节点 */
	#example:nth-child( 2n+1 ) { /* ... */ }
	#example:nth-child( odd )  { /* ... */ }
	
还可以使用反向选择器：

	 /* 最后一个子节点 */
	 #example:nth-last-child( 1 )
	 
事实上，:first-child等同于:nth-child(1)，:last-child等同于:nth-last-child(1)。

### 直接后代选择器

使用大于号`“>”`可以限制选择器只选中直接后代子元素：

	/* 找到直系子节点中的元素 */
	#example > div { }

### 否定选择器

使用:not否定选择器，给它传递一个简单的选择器即可。当前，它还不支持复杂的选择器，如p:not(h1 + p)这样：

	/* 找到直系子孙节点，但不能包含名为“current”的class */
	#example > *:not(.current) {
	  display: none
	}

浏览器支持情况：

- Firefox: 全部支持
- Chrome: 全部支持
- Safari: 全部支持
- IE >= 9.0: 全部支持
- Opera: 全部支持
	
## 过渡

CSS3增加了过渡支持，当样式变化时可以创建简单的动画。需要传递一个持续时间、对应的属性和可选的动画类型等等。持续时间单位可以是秒（s）或毫秒（ms）：

	/* 缓动，属性，动画类型（可选） */
	transition: 1.5s opacity ease-out
	/* 多个动画 */
	transition: 2s opacity , .5s height ease-in
	transition: .5s height , .5s .5s width

第一个例子中，当opacity变化时（就是说，一个样式以内联的方式应用其上时），原来的样式值和新值之间用动画过渡。

定时器函数有好几种，如下：

- linear
- ease-in
- ease-out
- ease-in-out
	
或者，可以使用三次方贝塞尔曲线自定义一个定时器，用它来描述动画的速率，如下是一个弹跳动画：

	#transition-example {
	  position: absolute;
	  /* cubic-bezier(x1, y1, x2, y2) */
	  transition: 5s left cubic-bezier(0.0, 0.35, .5, 1.3);
	}
	
在Safari和Chrome中，一旦过渡完成，在目标元素上还会发送一个WebKitTransitionEvent事件。在Firefox中，事件名为transitionend。不幸的是，对于使用CSS3还有几个忠告：对播放的控制能力很有限，不是所有的样式值都支持过渡。对于简单的动画来说过渡非常有用，甚至有些浏览器（如Safari）有硬件加速的支持：

	#transition-example {
	  width: 50px;
	  height: 50px;
	  background: red;
	  -webkit-transition: 2s background ease-in-out;
	  -moz-transition: 2s background ease-in-out;
	  -o-transition: 2s background ease-in-out;
	  transition: 2s background ease-in-out;
	}
	#transition-example:hover {
	  background: blue;
	}
	
由于某种理由，对于渐变的过渡只能在仅仅Alpha透明度变化时起作用。同样，有些值也不能过渡，如height:0到height:auto。

浏览器支持情况：

- Firefox: 使用-moz-
- Chrome: 使用-webkit-
- Safari: 使用-webkit-
- IE >= 10.0: 使用-ms-
- Opera: 使用-o-
	
## 图片边框

使用border-image可以为一个元素的边框应用图片。第一个参数指定图片的URL；下面几个描述图片是如何切片使用的；最后的部分指定伸缩属性值，它们描述了对于边部和中部的切片的比例关系和铺设方式。伸缩属性值可用就3种：round、repeat和stretch：

	border-image: url(border.png) 14 14 14 14 round round;
	border-image: url(border.png) 14 14 14 14 stretch stretch;

浏览器支持情况：

- Firefox: 使用-moz-
- Chrome: 使用-webkit-
- Safari: 使用-webkit-
- IE: 不支持
- Opera: 使用-o-
	
## 盒子尺寸

有没有碰到过希望设置一个元素的宽度为100%，但是它仍然有padding或margin的应用？使用床头的盒模型，CSS计算百分比时使用了父元素的宽度，然后在加上margin和padding。换言之，100%宽度的元素加上其padding、margin和border总是会溢出的。

因此，通过设置box-sizing为border-box——而不是原来的默认值content-box——你可以改变其测量尺寸的方式，将边框、外边距、内边距和内容都考虑进去了：

	.border-box {
	  -webkit-box-sizing: border-box;
	  -moz-box-sizing: border-box;
	  box-sizing: border-box;
	}

在主流的浏览器中已经得到了极大地支持，如果计划不用支持IE8以前的版本，那么使用这个属性是安全的。

## 变形

CSS3提供了基本的2D变形，它使元素平移、旋转、比例缩放和倾斜。例如，将一个元素逆时针旋转30度：

	transform: rotate( -30deg );
	
将一个元素环绕x和y轴倾斜指定的角度：

	transform: skew( 30deg , -10deg );

使用translateX或translateY可以将一个元素的位置沿x或y轴平移：

	translateX(30px);
	translateY(50opx);

使用scale可以将一个元素的尺寸放大或缩小。默认情况下元素的scale值为1：

	transform: scale(1.2);

多个变形连着书写可以一起使用：

	transform: rotate(30deg) skewX(30deg);
	
浏览器支持情况：

- Firefox: 使用-moz-
- Chrome: 使用-webkit-
- Safari: 使用-webkit-
- IE >= 9: 使用-ms-
- Opera: 使用-o-

## 灵活的盒模型

CSS3引入了灵活的盒模型的概念，这是一种显示内容的全新的方式。因为它将一些在GUI框架（如Adobe Flex）中的已经应用了一段时间的新特性引入到CSS中了，所以这个确实有用。传统上，如果要使一个列表水平排列，那么就要用浮动。灵活的盒模型可以做到更多效果和功能。看一下如下代码：

	.hbox {
	  display: -webkit-box;
	  -webkit-box-orient: horizontal;
	  -webkit-box-align: stretch;
	  -webkit-box-pack: left;
	  display: -moz-box;
	  -moz-box-orient: horizontal;
	  -moz-box-align: stretch;
	  -moz-box-pack: left;
	}
	.vbox {
	  display: -webkit-box;
	  -webkit-box-orient: vertical;
	  -webkit-box-align: stretch;
	  display: -moz-box;
	  -moz-box-orient: vertical;
	  -moz-box-align: stretch;
	}
	
上面设置了display为-webkit-box或者-moz-box，然后设置子元素布局的方向。默认情况下，所有子元素都将自动扩充为父元素一样的大小。但通过设置box-flex属性却可以修改此默认行为。

如果设置box-flex为0，就制定了该元素不允许扩充，相反如果设置为1或者更大的数值该元素将会自动扩充可利用的内容空间。例如，一个侧边栏也许应该设置flex为0，而一个主内容区也许应该设置flex为1：

	#sidebar {
	  -webkit-box-flex: 0;
	  -moz-box-flex: 0;
	  box-flex: 0;
	  width: 200px;
	}
	#content {
	  -webkit-box-flex: 1;
	  -moz-box-flex: 1;
	  box-flex: 1;
	}

浏览器支持情况：

- Firefox: 使用-moz-
- Chrome: 使用-webkit-
- Safari: 使用-webkit-
- IE >= 10: 使用-ms-
- Opera: 不支持

## 字体

@font-face让我们能够在网页上使用自定义字体来显示文本。从而不再依赖于用户安装的几种有限的系统字体了。

它所支持的字体格式有TrueType和OpenType。字体遵循一些域名策略限制——字体文件和页面必须来自同一个域名。

按照如下方法使用@font-face，命名font-family并制定字体文件的URL路径即可：

	@font-face {
	  font-family: "Bitstream Vera Serif Bold";
	  src: url("/fonts/VeraSeBd.ttf");
	}

然后，就像使用其他字体一样使用它即可：

	#font-example {
	  font-family: "Bitstream Vera Serif Bold";
	}

字体文件将异步下载，一旦完成才会应用。这就意味着用户首先看到是一种系统默认字体，直到自定义的字体下载完成。因此，最好同时制定一种本地可用的字体作为后备方案。

浏览器支持情况：

- Firefox: 全部支持
- Chrome: 全部支持
- Safari: 全部支持
- IE >= 9: 全部支持
- Opera: 全部支持
	
## 优雅降级

如果正确地书写CSS，那么你的应用程序将能够优雅降级。在不支持CSS3的浏览器中能够实现功能——只是没那么的漂亮。

优雅降级的关键是就是浏览器将忽略那些不能理解的设置，如CSS属性、值和选择器等等。CSS属性通常是一个覆盖另一个，故在同一个规则中定义两次后，第一个属性将给第二个覆盖。首先应该将符合CSS 2.1规范的属性放在前面，如下如果支持rgba，它将覆盖前面的白色：

	#example-gd {
	  background: white;
	  background: rgba(255, 255, 255, .75);
	}

如何处理厂商前缀？可以应用同样的规则。只要给每个浏览器包含前缀即可——它们各自会应用能够理解的那个规则。并且在最后应该使用不带前缀版本，因为浏览器的CSS3支持标准化以后，取消了前缀，也能够应用上该样式：

	#example-gd {
	  background: #FFF; 
	  background: -webkit-gradient(linear, left top, left bottom, from(#FFF), to(#CCC));
	  background: -webkit-linear-gradient(#FFF, #CCC);
	  background: -moz-linear-gradient(#FFF, #CCC);
	  background: linear-gradient(#FFF, #CCC);
	}
	
### Modernizr

Modernizr（http://www.modernizr.com/）用于检测各种CSS3属性的支持情况，这样在样式表中能确定特定的浏览器行为：

	.multiplebgs div p {
	  /* 支持多重背景的浏览器的样式*/
	}
	.no-multiplebgs div p {
	  /*优雅降级适应那些不支持多重背景的浏览器 */
	}

Modernizr检测支持的特性有：

- @font-face
- rgba()
- hsla()
- border-image:
- border-radius:
- box-shadow:
- text-shadow:
- 多重背景
- 灵活的盒模型
- CSS 动画
- CSS 渐变
- CSS 2D 变形
- CSS 过渡

查看它全部的功能列表或者下载Modernizr，可以访问其项目网站（http://www.modernizr.com/）。

使用Modernizr非常简单——只要引用该JavaScript文件，并且在<html>标签上添加样式class为no-js即可：

	<script src="/javascripts/modernizr.js"></script>
	<html class="no-js">

Modernizr然后会自动给<html>标签添加一些样式class，可以用在你的选择器中来应用针对特定浏览器行为的样式：

	/* 不支持当灵活的盒子模型时降级使用传统布局 */
	.no-flexbox #content {
	  float: left;
	}
	
### Google Chrome Frame

Google Chrome Frame （GCF）是一个IE扩展，它用来让IE的渲染引擎切换到Google Chrome的渲染引擎Chromium（http://www.chromium.org/）。 

一旦安装了扩展，就可以使用页面头部的一个meta标签来开启GCF：

	<meta http-equiv="X-UA-Compatible" content="chrome=1">

或者，在服务器响应头中添加该设置：

	X-UA-Compatible: chrome=1

为页面开启GCF渲染所需要的所有情况都在这里了。但是，GCF还有一些更多的特性，例如当用户运行IE（并且没有安装）时自动提示用户来安装。提示可以在页面中以浮动层形式展现，在GCF安装完毕后能自动刷新页面而不需要重启浏览器。

第一步，引入GCF的JavaScript文件：

	<script src="http://ajax.googleapis.com/ajax/libs/chrome-frame/1/CFInstall.min.js" 

然后，在页面的load事件处理句柄中或在页面底部来调用CFInstall：

	<script>
	  jQuery(function(){
		CFInstall.check({
		  mode: "overlay",
		});
	  });
	</script>
	
CFInstall需要几个参数：

mode

可以是inline、overlay或popup

destination

安装后的目标地址，通常是当前页面

node

包含安装提示的元素的ID

一旦GCF已经安装，浏览器的User-Agent头信息会被添加上“chromeframe”字符串。GCF非常聪明，它使用IE的网络协议栈来操作URL请求。这就保证了在使用GCF时，请求有相同的cookie、history和SSL状态等，基本上保留了用户已有的会话状态（session）。

更多的信息，请查看相关文档指南（http://goo.gl/L5lI）。

## 创建布局

现在拿出我们所有学过的知识，应用一下，来创建一个简单的布局，命名为Holla。

首先，创建基本的页面标签。一个头部和两栏——一个固定宽度的侧边栏和一个主内容容器：

	<body>
	  <header id="title">
		<h1>Holla</h1>
	  </header>
	  <div id="content">
		<div class="sidebar"></div>
		<div class="main"></div>
	  </div>
	</body>

然后，添加基本的reset和body样式：

	body, html {
	  margin: 0;
	  padding: 0;
	}
	body {
	  font-family: Helvetica, Arial, "MS Trebuchet", sans-serif;
	  font-size: 16px;
	  color: #363636;
	  background: #D2D2D2;
	  line-height: 1.2em;
	}

接下来是h标签样式：

	h1, h2 {
	  font-weight: bold;
	  text-shadow: 0 1px 1px #ffffff;
	}
	h1 {
	  font-size: 21pt;
	  color: #404040;
	}
	h2 {
	  font-size: 24pt;
	  color: #404040;
	  margin: 1em 0 0.7em 0;
	}
	h3 {
	  font-size: 15px;
	  color: #404040;
	  text-shadow: 0 1px 1px #ffffff;
	}

现在，为布局定义头部样式。我们使用了CSS3背景渐变，但如果不被支持，其默认的后备颜色是一个十六进制数值：

	#title {
	  border-bottom: 1px solid #535353;
	  overflow: hidden;
	  height: 50px;
	  line-height: 50px;
	  background: #575859;
	  background: -webkit-gradient(linear, left top, left bottom, 
	  from(#575859), to(#272425));
	  background: -webkit-linear-gradient(top, #575859, #272425);
	  background: -moz-linear-gradient(top, #575859, #272425);
	  background: linear-gradient(top, #575859, #272425);
	}
	#title h1 {
	  color: #ffffff;
	  text-shadow: 0 1px 1px #000000;
	  margin: 0 10px;
	}
	
最后，如果在浏览器中查看，应用程序的头部是深色的，如图C-1所示。

![](http://img02.taobaocdn.com/tps/i2/T1ym5BXoxtXXXXXXXX-677-432.png)

图C-1,目前为止的CSS应用程序，显示了一个背景渐变的头部

创建一个#content的div，它将是应用程序的主要部分。我们希望它在页面中x和y方向都填充满，故将其绝对定位。它的直接子元素水平排列，所以它的显示方式设置为灵活盒子类型：

	#content {
	  overflow: hidden;
	  /* 
		正文的div将会覆盖整个页面
		但会留出头部区域
	  */
	  position: absolute;
	  left: 0;
	  right: 0;
	  top: 50px;
	  bottom: 0;
	  /* The children are horizontally aligned */
	  display: -webkit-box;
	  -webkit-box-orient: horizontal;
	  -webkit-box-align: stretch;
	  -webkit-box-pack: left;
	  display: -moz-box;
	  -moz-box-orient: horizontal;
	  -moz-box-align: stretch;
	  -moz-box-pack: left;
	}

接下来，创建左边的一栏，命名为.sidebar。它有固定的宽度，所以设置其box-flex为0：

	#content .sidebar {
	  background: #EDEDED;
	  width: 200px;
	  /* It's got a fixed width, we don't want it to expand */
	  -webkit-box-flex: 0;
	  -moz-box-flex: 0;
	  box-flex: 0;
	}

在.sidebar内部创建一个菜单项目的列表。每个菜单用一个h3间隔，叫做菜单头。如你所见，这里用到很到CSS3，应用厂商前缀，它们各自都独立的。如果使用Less的混合可以更简洁：

	#content .sidebar ul {
	  margin: 0;
	  padding: 0;
	  list-style: none;
	}
	#content .sidebar ul li {
	  display: block;
	  padding: 10px 10px 7px 20px;
	  border-bottom: 1px solid #cdcdcc;
	  cursor: pointer;
	  -moz-box-shadow: 0 1px 1px #fcfcfc;
	  -webkit-box-shadow: 0 1px 1px #fcfcfc;
	  box-shadow: 0 1px 1px #fcfcfc;
	}
	#content .sidebar ul li.active {
	  color: #ffffff;
	  text-shadow: 0 1px 1px #46677f;
	  -webkit-box-shadow: none;
	  -moz-box-shadow: none;
	  background: #7bb5db;
	  background: -webkit-gradient(linear, left top, left bottom, 
	  from(#7bb5db), to(#4775b8));
	  background: -webkit-linear-gradient(top, #7bb5db, #4775b8);
	  background: -moz-linear-gradient(top, #7bb5db, #4775b8);
	  background: linear-gradient(top, #7bb5db, #4775b8);
	}

在HTML中标签中添加一些示例菜单：

	<div class="sidebar">
	  <h3>Channels</h3>
	  <ul>
		<li class="active">Developers</li>
		<li>Sales</li>
		<li>Marketing</li>
		<li>Ops</li>
	  </ul>
	</div>

还剩下给.main这个div添加一些CSS，它在页面右侧拉伸填充满：

	#content .main {
	  -moz-box-shadow: inset 0 1px 3px #7f7f7f;
	  -webkit-box-shadow: inset 0 1px 3px #7f7f7f;
	  box-shadow: inset 0 1px 3px #7f7f7f;
	  /* 我们希望.main可以尽可能的伸展开 */
	  -webkit-box-flex: 1;
	  -moz-box-flex: 1;
	  box-flex: 1;
	}
	
请再查看一下浏览器；如图C-2所示，到目前为止我们得到了一个应用程序的基本布局，它还可以进一步扩展。

![](http://img02.taobaocdn.com/tps/i2/T1VkKBXkBJXXXXXXXX-673-429.png)

图C-2,应用程序的基本布局

前面提到过，由于我们不得不使用厂商前缀，CSS3的语法很冗长，但使用Less的混合可以让代码更干净。例如：

	#content .sidebar h3 {
	  .vbg-gradient(#FFF, #DEDFE0);  
	  .box-shadow(0, -5px, 10px, #E4E4E4);
	}

更多信息请查看附录B，并阅读Holla的样式表，它是一个很好的样例。







