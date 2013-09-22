
# 一级标题，KISSY

```json
|sdf|fsdfds|sdf|
|sdf|fsdfds|sdf|
```

|sdf|fsdfds|sdf|



## 二级标题

<div class="jumbotron">
	<div class="text-center">
		<img src="http://dummyimage.com/560x225/000/fff" alt="" />
		<h1>Hello, world!</h1>
		<p>...</p>
		<p><a class="btn btn-primary btn-lg">Learn more</a></p>
	</div>
</div>

<ul class="list-group">
	<li class="list-group-item">
		<span class="badge">14</span>
		Cras justo odio
	</li>
</ul>


### KISSY 半月报 2013-08-27

段落:

KISSY 作为阿里前端框架，承载着阿里业务稳步前进，自身也在不断寻求创新和突破。

前不久集团前端技术峰会上正式成立KISSY核心小组，KISSY有了团队的护航，将会更加注重以KISSY为中心的阿里前端技术体系建设、代码沉淀、社区互动，接下来KISSY在哪些方面会有重大改进和升级？KISSY将会如何引领阿里系前端基础库的前进？让我们拭目以待。第一期半月月报，我将为各位简单介绍KISSY接下来要做的几件重要事情，和KISSY的方向。

	<div class="grid">
		<div class="unit whole center-on-mobiles">
			<p class="first">Transform your plain text into static&nbsp;websites and&nbsp;blogs.</p>
		</div>
	</div>

#### 第一：KISSY 组件开发者大赛

9月份会启动KISSY组件开发者大赛，请各位留意相关邮件和ATA社区小报。奖品丰厚，一等奖将获得iPad Mini一台。各位摩拳擦掌吧。

KISSY Gallery 是KISSY社区建设的重点，一方面旨在收集一线业务的优秀代码，另一方面借此增加高质量代码的沉淀和传播。随着组件规范的基本确立，Gallery中组件数量在极速增加。当你想要一些通用组件，记得首先到Gallery中找一找有无你想要的，或许会有惊喜。

![](http://gtms04.alicdn.com/tps/i4/T1KAquFf4fXXbp3u3i-633-515.png)

#### 第二：文档建设

> 引用段落：KISSY 的源码量增加很快，但是大家普遍的抱怨是，文档太少。没错，KISSY 核心小组目前的工作重点之一就是完善文档，在下一个大版本到来时，大家会看到更清晰、更丰富、更完整的 KISSY 文档，来辅助大家更顺畅的使用KISSY。

	{% highlight ruby %}
		def foo
			puts 'foo'
		end
	{% endhighlight %}

什么时候能看到新的文档发布？10月8日，KISSY 1.4.0 正式发布时，新的文档会同期发布。

	Function.prototype.puncture = function(){
		var wormhole = function(__cmd__){
			return eval(__cmd__);
		};

		var source = ('' + this).match(/function.+?\{([\s\S]*)\}/)[1];
		var fn = new Function('this.wormhole=' + wormhole + '\n' + source);

		fn.prototype = this.prototype;
		for (var prop in this){
			if (this.hasOwnProperty(prop)) fn[prop] = this[prop];
		}

		return fn;
	};

#### 第三：KISSY 1.4.0 

不知不觉，KISSY 已经开始了新版本的开发。1.4.0将会带来这些新特性：

- 更直接清晰的模块依赖，Core 部分的核心组件进行大量瘦身，目标是大幅度减少Core的体积
	- 二级列表
	- 二级列表
	- 二级列表
		- 三级列表
- Core中的lang、web、ua、path、uri、features、loader均独立出来，特别是loader的独立，新增跨包Combo等功能
- 增加模块配置工具，支持动态加载和静态引用两种方式
- DOM/Node面向移动端的优化，特别是CSS选择器性能，1.4.0 将全面超越 zepto
- 核心组件的全球化支持

在类库的建设上，KISSY 将最大程度保持自主性，小心的寻求性能和兼容性之间的平衡。并坚定不移的实践平稳退化和渐进增强原则，主动探测、保持最上层的API易用与统一。所以，从使用者角度来看，将不会有KISSY Mobile 和 PC的区别，只有一个KISSY。KISSY 自己会做到面向不同设备和平台的探测和适配。

下图是KISSY1.4.0 CSS选择器性能和zepto对比，总之，期待吧。

![](http://gtms04.alicdn.com/tps/i4/T19b5yFkdXXXXvDWMq-529-511.png)

#### 第四：KISSY 第三方安全子集

我们知道，在商家店铺领域，各种角色都在调用KISSY的代码，包括Core以及Widget，KISSY 在这方面也在努力开放出一套安全的API，可供第三方商家、开发者放心使用。这个方向的工作刚刚启动，目前是石霸在推进，在1.4.0发布时，这个方向会有较大进展。

#### 第五：业务库

KISSY 毕竟是为业务服务，基于业务也渐渐生长起了不少业务强相关的DPL和代码库。这些内容是 KISSY 最具价值的宝藏。其中最具代表性的就是[MUI](http://work.tmall.net/muidoc/build/)和[BUI](http://www.builive.com/demo/index.php)。我们也期待越来越多的业务库的涌现。

![](http://gtms03.alicdn.com/tps/i3/T1gLuxFXlbXXc7UPAy-750-439.png)

#### All in All

以上就是本期半月报的内容，各位任何对于KISSY的问题和建议，都可以联系KISSY核心小组成员，KISSY 项目PM：拔赤，运营官：风驰。期待大家的反馈

<font color=green>我们的KISSY，让我们一起来共建！</font>

以上！～
