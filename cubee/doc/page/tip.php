<div class="tit">Y.Tip 信息提示</div>
<p class="author">最后更新日期：2009-12-10  by 乐渔(leyu@taobao.com)</p>
<h2><strong>DEMO</strong></h2>
<div class="demo">
	<a class="button" href="../src/tip/demo/tip.html">演示示例 DEMO</a>
</div>
<h2><strong>NOTE</strong></h2>
<ul class="dec">
	<li>Y.Tip 信息提示包含16x16图标12号字以及24x24图标14号字两种规格，通过配置bigtip实现两种Style</li>
	<li>通过配置Tip的status来改变信息提示类型，例如‘error’，‘ok’，‘question’等</li>
	<li>可设置隐藏时是否使用动画</li>
	<li>可设置隐藏时是否使用动画</li>
	<li>因为使用的是淘宝杭州现有的规范，换行目前不能超过三行。请严格控制字数</li>
	<li>在ie6，ie7，firefox2,firefox3,opera9,safari4,chrome中测试通过</li>
</ul>
<h2><strong>USEAGE</strong></h2>
<div class="dec">
	<p>创建一个Y.Tip简单实例</p>
	<pre class="brush: js;">
var example1 = Y.Tip('#demo1','error','错误信息');
	</pre>
	<p>创建一个可设置隐藏时间、隐藏后执行Function的例子</p>
	<pre class="brush: js;">
var example2 = new Y.Tip('#demo2','attention','提示信息<br/>可以换行',{
	bigtip:true, //大提示
	noborder:true,	//无边框
	autohide:true,	//自动隐藏
	anim:true,	 //隐藏动画
	delay:4000,	 //等待隐藏时间
	onfinish:function(e){	 //回调
		...
	}
});
	</pre>
</div><!--/dec-->
<h2><strong>API</strong></h2>
<dl class="dec">
	<!--构造器-->
	<dt>Y.Tip</dt>
	<dd>
		<dl>
			<dt>说明：</dt>	
			<dd>信息提示、简单易用，适用于各种状态提示。</dd>
			<dt>使用：</dt>	
			<dd><p><b>Y.Tip(id,status,msg,{config});</b></p></dd>
			<dt>参数：</dt>		
			<dd><p><b>id</b>:{string} 消息提示的容器</p>
				<p><b>status</b>:{string} 此项为空时默认为tips，使用预设的类型 error、alert、attention、tips、ok、question、notice(s)、help(s)、small-help(s)、stop(s) <em style="color:red">*注意：(s)只有小提示才具有</em>
				<p><b>msg</b>:{string} 消息主体</p>
			</dd>
			<dt>配置：</dt>		
			<dd>
				<p><b>bigtip</b>:{boolean} 默认是小提示;true:24x24图标大提示</p>
				<p><b>anim</b>:{boolean} 默认有动画效果;</p>
				<p><b>delay</b>:{number} 默认是3秒</p>
				<p><b>autohide</b>:{boolean} 默认不隐藏；true:自动隐藏</p>
				<p><b>noborder</b>:{boolean} 默认有边框；true:无边框</p>
				<p><b>onfinish</b>:{function} 提示隐藏后的回调</p>
			</dd>
		</dl>
		
	</dd>
	
</dl>
