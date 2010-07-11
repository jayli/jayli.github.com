<div class="tit">Y.Floatip 浮动提示</div>
<p class="author">最后更新日期：2010-04-02  by bachi@taobao.com 拔赤</p>
<h2><strong>DEMO</strong></h2>
<div class="demo">
	<a class="button" href="../src/floatip/demo/demo.html">DEMO</a>
</div>
<h2><strong>NOTE</strong></h2>
<ul class="dec">
	<li>基于YUI3</li>
	<li>可以针对nodelist一次初始化，float tip样式需自己定义</li>
	<li>floatip只需要初始化，并不需要中途修改，不对外提供接口</li>
	<li>适用于类似a标签title属性的小提示的简单修饰</li>
	<li>在ie6,ie7,firefox2,firefox3.0/3.5/3.6,safari4.0,opera9.62,chrome3.0下测试通过</li>
	<li>更多信息请参照：http://developer.yahoo.com/yui/3/examples/widget/widget-tooltip.html</li>
</ul>
<h2><strong>USEAGE</strong></h2>
<div class="dec">
	<p>种子的引入</p>
	<p>引用方法如下</p>
	<pre class="brush: js;">
YUI({charset:'utf-8', modules:{
		'floatip': {
			fullpath: '../floatip.js',
			type: 'js',
			requires: ['node']
		}
}}).use('floatip', function(Y){
	//your code
});
	</pre>
	<p>新建一个Y.Floatip对象</p>
	<pre class="brush: js;">
//生成实例
new Y.Floatip(Y.all('.floatip'),{
	floatip_class:'float-tip'
});
	</pre>
</div><!--/dec-->
<h2><strong>API</strong></h2>
<dl class="dec">
	<!--构造器-->
	<dt>Y.Floatip构造器</dt>
	<dd>
		<dl>
			<dt>说明：</dt>	
			<dd>分页列表构造器</dd>
			<dt>使用：</dt>	
			<dd>new Y.Floatip(node,config);</dd>
			<dt>参数：</dt>	
			<dd>
				<p><b>node</b>:{yui3-node}yui3 node对象</p>
				<p><b>config</b>:{object}配置项</p>
			</dd>
			<dt>配置：</dt>	
			<dd><p><b>float_class</b>:{string} 可选，float tip的classname，默认为'float-tip'</p>
				<p><b>right</b>:{number} 距离触点右上角的右边距</p>
				<p><b>top</b>:{number} 距离触点右上角的右边距</p>
				<p><b>stay</b>:{number} tip停留的毫秒数，默认为300</p>
			</dd>
		</dl>
	</dd>
</dl>
