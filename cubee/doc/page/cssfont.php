<!-- {{ -->
<div class="tit">Font.css</div>
<p class="author">最后更新日期：2009-12-29  by 乐渔(leyu@taobao.com)</p>
<h2><strong>使用说明+示例</strong></h2>
<div class="demo">
	<a href="../src/css/demo/font.html" class="button">字形字号实例</a><a href="http://taobao-wd.ns1.name/wiki/doku.php?id=文字" class="button">数字化产品文字指南</a>
</div>
<h2><strong>引用地址<sup>BETA</sup></strong></h2>
<div class="demo"><p class="button">../build/css/font.css</p></div>

<h2><strong>Font.css用途</strong></h2>
<div class="dec">
	<p>目的是定义一套快捷使用的文字颜色、字号、字形的快捷样式</p>
	<ul>
		<li><strong>希望不断积累更多的快捷使用颜色字号</strong></li>
	</ul>
</div>
<h2><strong>未压缩版本</strong></h2>

<dl>
	<dt></dt>
	<dd>
		<pre class="brush: css;">
/* -------------------------------------------------
 * @Font.css
 * @Author:乐渔(idd.chiang@gmail.com)
 * @设计来源：http://taobao-wd.ns1.name/wiki/doku.php?id=文字
 * @依赖Reset.css 建议数字产品Reset使用时将font与reset合并使用
 * -------------------------------------------------
 */
body{
	font:normal 12px/1.5 'Tahoma','simsun';
}

/* 淘宝建议链接色 */
a{
	color:#0041d9;
	text-decoration:none
}
a:hover{
	color:#f60;
	text-decoration:underline;
}
a:visited{
	color:#2b5fd9;
}

/* 字号 */
.f14{
	font-size:14px;
}
.f14{
	font-size:16px;
}

/* 字体颜色 */
.pop,.orange,a.orange,.orange a,.orange a:hover{
	color:#f60;	/*橙色*/
}
.url,.blue,a.blue,.blue a,.blue a:hover{
	color:#f60;	/*链接蓝色*/
}
.gray,a.gray,.gray a,.gray a:hover{
	color:#666;	/*摘要灰色*/
}

/* 其他快捷字号以及字体颜色期待加入 */

		</pre>
	</dd>
</dl>
<!-- }} -->
