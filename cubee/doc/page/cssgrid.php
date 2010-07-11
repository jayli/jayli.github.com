<!-- {{ -->
<div class="tit">Grid.css</div>
<p class="author">最后更新日期：2009-12-29  by 乐渔(leyu@taobao.com)</p>
<h2><strong>使用说明+示例</strong></h2>
<div class="demo">
	<a href="../src/css/demo/grid.html" class="button">使用说明-示例</a><a href="http://taobao-wd.ns1.name/wiki/doku.php?id=栅格" class="button">数字化产品栅格</a>
</div>
<h2><strong>压缩版本</strong></h2>
<div class="demo"><p class="button">../build/css/grid.css</p></div>

<h2><strong>USEAGE</strong></h2>
<div class="dec">
	<p>两栏布局：</p>
	<pre class="html">
<div class="grid-*2">
	<div class="g-main">
		<div class="g-wrap">内容</div>
	</div>
	<div class="g-side">边栏</div>
</div>
	</pre>
	<p>三栏布局：</p>
	<pre class="html">
<div class="grid-*3">
	<div class="g-aside">宽边栏</div>
	<div class="g-main">
		<div class="g-wrap">内容</div>
	</div>
	<div class="g-side">边栏</div>
</div>
	</pre>
	<p>自定义两栏布局：</p>
	<pre class="html">
<div class="grid-c* demo1">
	<div class="g-main">
		<div class="g-wrap">内容</div>
	</div>
	<div class="g-side">边栏</div>
</div>
	</pre>
</div>

<h2><strong>Grid命名标准</strong></h2>
<div class="dec">
	<p>Grid按照(40xN)-10公式的栅格布局，#doc的宽度为950px，#doc-w的宽度为100%，N=24 使用1280的分辨率来校准栅格</p>
	<p>命名：grid-*中'r'和'l'分别代表最窄栏（即190px宽的栏）所处的位置，c代表（custom），将宽度放出自定义设置，其中的'r'和'l'代表边栏的位置在左或右。</p>
</div>
<h2><strong>未压缩版本</strong></h2>

<dl>
	<dt></dt>
	<dd>
		<pre class="html">
/* -------------------------------------------------
 * @Grid.css
 * @Author:乐渔(idd.chiang@gmail.com)
 * @依照taobaoUED-Beijing栅格化布局，在此布局基础上
 *  可以扩展出自定义两栏布局
 * @依赖Reset.css
 * -------------------------------------------------
 */

/* 默认为950px宽居中文档 */
#doc{
	width:950px;
	margin:0 auto;
}

/* doc-w为满屏文档用着备用
 * 主要内容区为100% 
 */
#doc-w,.g-main{
	width:100%;
}

/* 边栏主要有190和170宽两种 */
.g-side{
	width:190px;
}
.g-aside{
	width:270px;
}

/* 设置左浮动的模块 */
.g-side,.grid-r2 .g-main,.grid-l2 .g-side,.grid-r3 .g-aside,.grid-rc .g-main,.grid-r3 .g-main{
	float:left;
}
/* 设置右浮动的模块 */
.g-main,.g-aside,.grid-r2 .g-side,.grid-r3 .g-side,.grid-rc .g-side{
	float:right;
}

/* 用溢出边距使边栏与内容在同一行上 */
.grid-r2 .g-main,.grid-rc .g-main{
	margin-right:-100%;
}
.grid-l2 .g-main,.grid-lc .g-main{
	margin-left:-100%;
}

/* 设置内容区域与边栏之间的间距，使用边距的溢差来模拟出10px的间距 */
.grid-r2 .g-wrap{
	margin-right:200px;
}
.grid-l2 .g-wrap{
	margin-left:200px;
}
.grid-r3 .g-main{
	margin:0 -190px 0 -270px;
}
.grid-r3 .g-wrap{
	margin:0 200px 0 280px;
}
.grid-l3 .g-main{
	margin: 0 -270px 0 -190px;
}
.grid-l3 .g-wrap{
	margin: 0 280px 0 200px;
}

/* 清除每个Grid的浮动并设置Grid之间间距 */
.grid,.grid-l2,.grid-r2,.grid-l3,.grid-r3,.grid-lc,.grid-rc{
	margin-bottom:10px;
	position:relative;
	*display:inline-block;/*IE6、7清除浮动 也可以使用zoom:1*/
}
.grid:after,.grid-l2:after,.grid-r2:after,.grid-l3:after,.grid-r3:after,.grid-lc:after,.grid-rc:after{
	clear:both;
	content:' ';
	display:block;
	font-size:0;
	line-height:0;
	visibility:hidden;
	width:0;
	height:0;
}

		</pre>
	</dd>
</dl>
<!-- }} -->
