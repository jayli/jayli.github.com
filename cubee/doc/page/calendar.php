<div class="tit">Y.Calendar 日历</div>
<p class="author">最后更新日期：2009-12-28  by lijing00333@163.com 拔赤</p>
<h2><strong>DEMO</strong></h2>
<div class="demo">
	<a class="button" href="../src/calendar/demo/calendar.html">基于YUI3-DEMO</a>
	<a class="button" href="../src/calendar/demo/calendar-yui2.html">基于YUI2-DEMO</a>
	<a class="button" href="../src/calendar/demo/prototype.html">html原型 DEMO</a>
</div>
<h2><strong>NOTE</strong></h2>
<ul class="dec">
	<li>基于YUI3/YUI2</li>
	<li>支持基本的事件：单选、范围选择、弹出、嵌入等等</li>
	<li>根据ID建议，将选择时间的功能去掉了</li>
	<li>理论上，可以日历中的子日历可以有生成无数个，但超过3个的情况需要自定义css：增加class为“multi-2”的样式。</li>
	<li>日历阴影用css3来定义，在opera和ie下日历无阴影</li>
	<li>在chrome中，日期不支持诸如new Date('2009/12/35')的天溢出，在调试浏览器的时候应当注意</li>
	<li>在ie6,ie7,firefox2,firefox3.0/3.5/3.6,safari4.0,opera9.62,chrome3.0下测试通过</li>
</ul>
<h2><strong>USEAGE</strong></h2>
<div class="dec">
	<p>种子的引入</p>
	<p>需要两个文件，皮肤skin/default.css和calendar.js，引用方法如下</p>
	<pre class="brush: js;">
modules:{
	'calendar-skin-default':{//默认皮肤
		fullpath:'skin/default.css',
		type:'css'
	},
	'calendar':{
		fullpath:'calendar.js',
		requires:['calendar-skin-default','node']
	}
}
	</pre>
	<p>新建一个Y.Calendar对象</p>
	<pre class="brush: js;">
var calendar = new Y.Calendar('J_multipage_1',{
	multi_page:2,
	selected:new Date('2009/12/28')
});
	</pre>
	<p>创建一个Y.Calendar,带入配置项并绑定回调</p>
	<pre class="brush: js;">
var calendar = new Y.Calendar('J_calendar').on('select',function(d){
	//your code
});
	</pre>
	<p>更多实例代码参照<a href="#">demo</a></p>
</div><!--/dec-->
<h2><strong>API</strong></h2>
<dl class="dec">
	<!--构造器-->
	<dt>Y.Calendar构造器</dt>
	<dd>
		<dl>
			<dt>说明：</dt>	
			<dd>日历构造器</dd>
			<dt>使用：</dt>	
			<dd>new Y.Calendar(id,options);</dd>
			<dt>参数：</dt>	
			<dd><p><b>id</b>:{string} 空容器的id、或者触点的id</p>
				<p><b>options</b>:{object} 配置项</p></dd>
			<dt>配置：</dt>	
			<dd><p><b>selected</b>:{date} 默认选中哪天</p>
				<p><b>mindate</b>:{date} 可选的最小日期</p>
				<p><b>maxdate</b>:{date} 可选最大日期</p>
				<p><b>popup</b>:{boolean} 是否弹出，默认为false</p>
				<p><b>closeable</b>:{boolean} 弹出的时候，是否单选就关闭,默认为false</p>
				<p><b>range</b>:{start:date,end:date} 默认选中范围</p>
				<p><b>range_select</b>:{boolean} 是否支持范围选择</p>
				<p><b>date</b>:{date} 默认显示该日期所在的月份，默认为当天</p>
				<p><b>navigator</b>:{boolean} 是否可以选择跳转的月份，默认为true</p>
				<p><b>withtime</b>:{boolean} 是否可选择时间，默认为false</p>
			</dd>
		</dl>
	</dd>
	<!--实例方法-->
	<dt>Y.Calendar实例对象的方法和事件</dt>
	<dd>
		<dl>
			<dt>方法：</dt>
			<dd>
				<p><b>init</b>:初始化，参数为options</p>
				<p><b>render</b>:渲染</p>
				<p><b>show</b>:显示</p>
				<p><b>hide</b>:隐藏</p>
			</dd>
			<dt>事件类型：</dt>
			<dd>
				<p><b>switch</b>:月份的切换，回调为切换后的日期</p>
				<p><b>select</b>:单选</p>
				<p><b>rangeselect</b>:范围选择</p>
				<p><b>timeselect</b>:时间选择</p>
				<p><b>show</b>:显示</p>
				<p><b>hide</b>:隐藏</p>
			</dd>
		</dl>
	</dd>
</dl>
