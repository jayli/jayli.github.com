<div class="tit">Y.Checkall 简单全选控件</div>
<p class="author">最后更新日期：2010-04-20  by bachi@taobao.com 拔赤</p>
<h2><strong>DEMO</strong></h2>
<div class="demo">
	<a class="button" href="../src/checkall/demo/demo.html">DEMO</a>
</div>
<h2><strong>NOTE</strong></h2>
<ul class="dec">
	<li>基于YUI3</li>
	<li>支持全选反选</li>
	<li>在ie6,ie7,firefox2,firefox3.0/3.5/3.6,safari4.0,opera9.62,chrome3.0下测试通过</li>
</ul>
<h2><strong>USEAGE</strong></h2>
<div class="dec">
	<p>种子的引入</p>
	<p>引用方法如下</p>
	<pre class="brush: js;">
YUI({charset:'utf-8', modules:{
		'checkall': {
			fullpath: '../checkall.js',
			type: 'js',
			requires: ['node']
		}
}}).use('checkall', function(Y){
	//your code
});
	</pre>
	<p>新建一个Y.Checkall对象</p>
	<pre class="brush: js;">
//生成实例
var c = new Y.Checkall({
	node:[Y.one('#J_checkall_1'),Y.one('#J_checkall_2')],
	/*node:Y.one('#J_check_all_1')*/
	nodelist:Y.all('.checklist'),
	inverse:[Y.one('#J_inverse_1'),Y.one('#J_inverse_2')]
	/*inverse:Y.one('#J_check_all_1')*/
}).on('check',function(o){
	Y.log(Y.dump(o));
});
	</pre>
	<p>调用</p>
	<pre class="brush: js;">
c.invert();//反选
	</pre>
	<p>其中node和inverse参数可以传入数组，数组成员为YUI node，也可以直接传入一个YUI node</p>
</div><!--/dec-->
<h2><strong>API</strong></h2>
<dl class="dec">
	<!--构造器-->
	<dt>Y.Checkall构造器</dt>
	<dd>
		<dl>
			<dt>说明：</dt>	
			<dd>全选控件构造器</dd>
			<dt>使用：</dt>	
			<dd>new Y.Checkall(config);</dd>
			<dt>参数：</dt>	
			<dd>
				<p><b>config</b>:{object}配置项</p>
			</dd>
			<dt>配置：</dt>	
			<dd><p><b>node</b>:{string|array} 必填，全选checkbox的YUI node，类型可以为数组，也可以为一个YUI node</p>
				<p><b>nodelist</b>:{YUI nodelist} 必填  checkbox items</p>
				<p><b>inverse</b>:{string|array} 选填 反选按钮，参数可以为数组，也可以为一个YUI node</p>
			</dd>
		</dl>
	</dd>
	<!--实例方法-->
	<dt>Y.Checkall实例对象的方法和事件</dt>
	<dd>
		<dl>
			<dt>实例方法：</dt>
			<dd><p><b>invert</b>:反选</p></dd>
			<dt>事件类型：</dt>
			<dd>
				<p><b>check</b>:每次点击触发的切换事件，带回{
											checked:{array}(当前checked的节点数组，数组成员为YUI node)
											unchecked:{array}(当前unchecked的节点数组，数组成员为YUI node)}</p>
			</dd>
		</dl>
	</dd>
</dl>
