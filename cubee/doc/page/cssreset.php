<!-- {{ -->
<div class="tit">Reset.css</div>
<p class="author">最后更新日期：2009-12-30  by 乐渔(leyu@taobao.com)</p>
<h2><strong>Reset测试页</strong></h2>
<div class="demo">
	<a href="../src/css/demo/reset.html" class="button">Reset测试页</a>
</div>
<h2><strong>压缩版本</strong></h2>
<div class="demo"><p class="button">../build/css/reset.css</p></div>
<h2><strong>Reset说明</strong></h2>
<div class="dec">
	<ul>
		<li>基于YUI Reset，不做过多注释，请阅读下方源码即可明白。与淘宝杭州的Reset有区别，有兴趣的童鞋可以研究下。</li>
		<li>删除YUI Reset对strong、h(x)标签粗体处理</li>
		<li><strong>切勿使用 i, b 等HTML旧标签</strong>，因为本Reset已放弃对这些旧标签的reset了</li>
	</ul>
</div>


<h2><strong>未压缩版本</strong></h2>

		<pre class="css">
/* -------------------------------------------------
 * @reset.css
 * @Author : 乐渔 idd.chiang@gmail.com
 * @Modify : YUI2.x
 * @Purpose : undo some of the default styling of common (X)HTML browsers
 * -------------------------------------------------
 */

html
{
	color:#333;/*来自于"http://taobao-wd.ns1.name/wiki/doku.php?id=文字"对文字定义*/
	background:#fff;
}

body,div,dl,dt,dd,ul,ol,li,h1,h2,h3,h4,h5,h6,pre,code,form,fieldset,legend,input,button,textarea,p,blockquote,th,td
{
	margin:0;
	padding:0;
}

table
{
	border-collapse:collapse;
	border-spacing:0;
}

fieldset,img
{
	border:0; 
}

address,caption,cite,code,dfn,em,th,var,optgroup
{
	font-style:normal;
	font-weight:400;
}

li
{
	list-style:none;
}

caption
{
	text-align:left;
}

abbr,acronym
{
	border:0;
	font-variant:normal;
}

sup
{
	vertical-align:text-top;
}

sub
{
	vertical-align:text-bottom;
}

input,textarea,select,button,option /*字体继承*/
{
	font-family:inherit;
	font-size:inherit;
	font-weight:inherit;
}

h1,h2,h3,h4,h5,h6,input,textarea,select,button /*重置字体大小*/
{
	font-size:100%;
}

legend
{
	color:#000;
}

q:before,q:after
{
	content:'';
}
		</pre>
	</dd>
</dl>
<!-- }} -->
