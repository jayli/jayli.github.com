<style>
p img {
	float:none;
}
</style>
# 附录B CSS扩展

正如Less（http://lesscss.org/）的作者Alexis Sellier所说：“Less是一种建立在CSS的语法之上的动态样式表语言”。Less是CSS的一个超集，它扩展出了变量、混合、操作符和嵌套规则。

Less的伟大就在于它确实能减少需要书写的CSS代码的数量——特别是遇到CSS3一些具有厂商特殊性的规则。然后将Less文件编译为纯CSS即可。

换言之，原来需要这样写的代码：

	.panel {
	   background: #CCC;
	   background: -webkit-gradient(linear, left top, left bottom, from(#FFF), to(#CCC));
	   background: -moz-linear-gradient(top, #FFF, #CCC);
	}

现在可以这样写：

	.panel {
		.vbg-gradient(#FFF, #CCC);
	}

## 变量

如果你正在重复使用一些颜色和规则属性，使用Less的变量可以合并到一个地方，需要时全局改动即可而不用查找替换了！

设置变量很简单：

	@panel-color: #CCC;
	
然后，即可在样式规则中使用：

	header {
	  color: @panel-color;
	}

## 混合

Less的混合行为和C的宏有很多相似之处。主要是定义了一个混合后，它可以接受可选的参数，像这样：

	.vbg-gradient(@fc: #FFF, @tc: #CCC) {
	  background: @fc;
	  background: -webkit-gradient(linear, left top, left bottom, from(@fc), to(@tc));
	  background: -moz-linear-gradient(top, @fc, @tc);
	  background: linear-gradient(top, @fc, @tc);
	}

上面的例子接受两个参数，fc和tc，并且默认值分别为#FFF和#CCC。然后插到类的内容里面。回想一下变量的定义和使用，但这里只对整个类有效。

CSS3还没有完成标准化，因此浏览器厂商通常指定它们自己的前缀，如-webkit和-moz。某方面来说这是好事，因为我们马上可以开始使用这些特性；但这语法却显得很累赘，定义样式时为不同的浏览器你需要书写两倍或三倍的数量。

你可能猜到了，Less的确能够削减需要书写的数量——只要将厂商特殊性的样式变为一个混合。

下马还有一些可能有用的混合例子：

	/* 圆角 */
	.border-radius(@r: 3px) {
	  -moz-border-radius: @r;
	  -webkit-border-radius: @r;
	  border-radius: @r;
	}
	/* 阴影 */
	.box-shadow (@h: 0px, @v: 0px, @b: 4px, @c: #333) {
	  -moz-box-shadow: @h @v @b @c;
	  -webkit-box-shadow: @h @v @b @c;
	  box-shadow: @h @v @b @c;
	}
	
## 嵌套规则

获取元素时不用再指定很长的选择器名字了，转而代之使用嵌套选择器。完整的选择器会在后台生成，但嵌套规则使得样式表更加干净和易读：

	button {
	  .border-radius(3px);
	  .box-shadow(0, 1px, 1px, #FFF);
	  .vbg-gradient(#F9F9F9, #E3E3E3);
	  :active {
		.vbg-gradient(#E3E3E3, #F9F9F9);
	  }
	}
	
提醒一点，我不建议使用超过两层的嵌套，因为如果不注意很可能会被滥用，结果你的样式表将变成有史以来最糟糕的东西。

## 包含其他样式表

如果你正在计划拆分样式表，那我强烈建议你使用@import在当前文件中包含其他样式表。Less将获取这些文件并合并插入，这样避免客户端发起单独的HTTP请求从而改善性能。

这个案例也经常和混合一起使用。假设有一个CSS3混合文件；可以这样导入：

	@import "utils";
	
## 颜色

Less有一个很新的特性还没有文档记载，但却很有用，值得在此说明。Less可以使用各种函数来操作颜色：

	background: saturate(#319, 10%);
	background: desaturate(#319, 10%);
	background: darken(#319, 10%);
	background: lighten(#319, 10%)
	
很多设计基于相同的颜色，但它们会使用不同的色调。和变量组合起来，可以很快得到各种品牌主题。

## 如何使用Less？

把Less代码编译成CSS有很多中方法。

### 命令行

安装Less gem，然后效用lessc命令：

	gem install less
	lessc style.less

### Rack

如果你正在使用基于Rack的框架，如Rails3，有一个更简单的方案：rack-less gem。只要你的文件中包含相应的gem即可：

	gem "rack-less"
	
然后，将中间层注入到application.rb：

	require "rack/less"
	config.middleware.use "Rack::Less"

所有在/app/stylesheets目录下的Less样式表都会被自动编译。甚至通过production.rb配置文件设置rack-less以后，可以缓存和压缩编译的结果：

	Rack::Less.configure do |config|
	  config.cache     = true
	  config.compress  = :yui
	end
	
### JavaScript

Ruby库的发展看上去已经慢下来了，但所幸的是有一个更新的选择：Less.js（http://github.com/cloudhead/less.js）是JavaScript版本的Less。你可以在页面中指定Less样式表，然后包含less.js，它将自动编译这些Less样式表：

	<link rel="stylesheet/less" href="main.less" type="text/css">
	<script src="less.js" type="text/javascript"></script>
	
Less.js比Ruby版的要快40倍。尽管如此，你可能还是想预编译Less样式表以避免客户端的性能问题。如果你安装了Node.js，可以用命令行来编译：

	node bin/lessc style.less
	
### Less.app

Max OS X 应用程序（http://incident57.com/less/）让Less更好用了。它背后使用了Less.js，可以指定“监控”某些文件夹——也就是说当Less样式表保存时会自动被编译成CSS格式。见图B-1。

![](http://img01.taobaocdn.com/tps/i1/T1a65BXapOXXXXXXXX-716-405.png)

图B-1,用Less.app自动编译Less文件
