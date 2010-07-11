<div class="tit">Y.Pagination 分页</div>
<p class="author">最后更新日期：2010-01-06  by kongyan@taobao.com 空雁</p>
<h2><strong>DEMO</strong></h2>
<div class="demo">
	<a class="button" href="../src/pagination/demo/pagination.html">old分页 DEMO</a>
	<a class="button" href="../src/pagination2/demo/pagination.html">演示示例 DEMO</a>
</div>
<h2><strong>NOTE</strong></h2>
<ul class="dec">
	<li>基于YUI3 Widget的分页组件</li>
	<li>在ie6,ie7,firefox3.5下测试通过</li>
</ul>
<h2><strong>USEAGE</strong></h2>
<div class="dec">
	<p>种子的引入</p>
	<p>需要两个文件，皮肤pagination.css和pagination.js，引用方法如下</p>
	<pre class="brush: js;">
YUI({charset:'utf-8', modules:{
		'pagination-skin': {
			fullpath: '../pagination.css',
			type: 'css'
		},
		'pagination': {
			fullpath: '../pagination.js',
			type: 'js',
			requires: ['widget', 'pagination-skin']
		}
}}).use('pagination', function(Y){

});
	</pre>
	<p>新建一个Y.Pagination对象</p>
	<pre class="brush: js;">
//生成分页控件实例
var p = new Y.Pagination({
	contentBox: '#page1',
	max: 22,
	index: 10
});	
//参数说明：
//setp默认为7
	</pre>
	<p>调用</p>
	<pre class="brush: js;">
p.setMax(50);//设置分页总数为50
p.setStep(5);//设置分页步长为5
p.setIndex(13);//设置当前页为13
	</pre>
</div><!--/dec-->
<h2><strong>API</strong></h2>
<dl class="dec">
	<!--构造器-->
	<dt>Y.Pagination构造器</dt>
	<dd>
		<dl>
			<dt>说明：</dt>	
			<dd>分页构造器</dd>
			<dt>使用：</dt>	
			<dd>new Y.Pagination(config);</dd>
			<dt>参数：</dt>	
			<dd><p><b>config</b>:{object}配置项</p></dd>
			<dt>配置：</dt>	
			<dd><p><b>contentBox</b>:{#id} 必选，分页容器id</p>
				<p><b>max</b>:{number} 必选，最大页数</p>
				<p><b>step</b>:{number} 分页步长</p>
				<p><b>index</b>:{number} 当前页</p>
				<p><b>jump</b>:{boolean} 是否有跳转，默认为false</p>
			</dd>
		</dl>
	</dd>
	<!--实例方法-->
	<dt>Y.Pagination实例对象的方法和事件</dt>
	<dd>
		<dl>
			<dt>继承自Y.Widget，扩展方法：</dt>
			<dd>
				<p><b>setMax</b>:设置分页总数</p>
				<p><b>setStep</b>:设置分页步长</p>
				<p><b>setIndex</b>:设置当前页</p>
			</dd>
			<dt>事件类型：</dt>
			<dd>
				<p><b>trigger</b>:点击事件，回调为e对象，包含page(点击的页数)和max(最大页数)属性</p>
			</dd>
		</dl>
	</dd>
</dl>
