<div class="tit">Y.Spage 简单分页列表控件</div>
<p class="author">最后更新日期：2010-04-02  by bachi@taobao.com 拔赤</p>
<h2><strong>DEMO</strong></h2>
<div class="demo">
	<a class="button" href="../src/simplepage/demo/demo.html">DEMO</a>
</div>
<h2><strong>NOTE</strong></h2>
<ul class="dec">
	<li>基于YUI3</li>
	<li>js实现列表项的分页逻辑</li>
	<li>提供简单的分页的页签，页码为自动生成</li>
	<li>适用与小容器中数据量不大的datalist分页，对于庞大数据量的情况请配合<a href="?pagination">Y.pagination</a>使用</li>
	<li>在ie6,ie7,firefox2,firefox3.0/3.5/3.6,safari4.0,opera9.62,chrome3.0下测试通过</li>
</ul>
<h2><strong>USEAGE</strong></h2>
<div class="dec">
	<p>种子的引入</p>
	<p>引用方法如下</p>
	<pre class="brush: js;">
YUI({charset:'utf-8', modules:{
		'spage': {
			fullpath: '../simplepage.js',
			type: 'js',
			requires: ['node']
		}
}}).use('spage', function(Y){
	//your code
});
	</pre>
	<p>新建一个Y.Spage对象</p>
	<pre class="brush: js;">
//生成实例
var p = new Y.Spage(Y.all('#Hook .item'),'Page',{
	step:4,
	index:2,
	selected_class:'on'
}).on('pagechange',function(o){
	Y.log(Y.dump(o));
});	
//参数说明：
//setp默认为10
	</pre>
	<p>调用</p>
	<pre class="brush: js;">
p.render({index:5});//显示第五页
	</pre>
</div><!--/dec-->
<h2><strong>API</strong></h2>
<dl class="dec">
	<!--构造器-->
	<dt>Y.Spage构造器</dt>
	<dd>
		<dl>
			<dt>说明：</dt>	
			<dd>分页列表构造器</dd>
			<dt>使用：</dt>	
			<dd>new Y.Spage(nodelist,id,config);</dd>
			<dt>参数：</dt>	
			<dd>
				<p><b>nodelist</b>:{yui3-nodelist}yui3 nodelist对象</p>
				<p><b>id</b>:{string}显示页签的容器id</p>
				<p><b>config</b>:{object}配置项</p>
			</dd>
			<dt>配置：</dt>	
			<dd><p><b>selected_class</b>:{string} 可选，选中的a的className，默认为'selected'</p>
				<p><b>step</b>:{number} 每页item个数</p>
				<p><b>index</b>:{number} 当前页</p>
			</dd>
		</dl>
	</dd>
	<!--实例方法-->
	<dt>Y.Spage实例对象的方法和事件</dt>
	<dd>
		<dl>
			<dt>实例方法：</dt>
			<dd><p><b>render</b>:重新设置分页</p></dd>
			<dt>事件类型：</dt>
			<dd>
				<p><b>pagechange</b>:切换页码事件，带回{
											rear:rear,
											top:top,
											index:index,
											step:that.step}</p>
			</dd>
		</dl>
	</dd>
</dl>
