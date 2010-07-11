<div class="tit">Y.DateCascade 级联日期选择控件</div>
<p class="author">最后更新日期：2010-05-20  by idd.chiang@gmail.com 乐渔</p>
<h2><strong>DEMO</strong></h2>
<div class="demo">
	<a class="button" href="../src/datecascade/demo/index.html">演示示例 DEMO</a>
</div>
<h2><strong>NOTE</strong></h2>
<ul class="dec">
	<li>可以通过扩展Y.DateCascade来实现时间级联选择</li>
	<li>初始化文本输入框后，级联日期菜单将改变获取的日期回填至初始化文本输入框</li>
	<li>获取初始日期优先级：1.文本输入框value 2.参数配置中 defaultDate 值设定 3.中途修改时间 render</li>
	<li>可设置日期范围，形如 2010/5/21 or 2010-5-21格式</li>
</ul>
<h2><strong>USEAGE</strong></h2>
<div class="dec">
	<p>种子的引入</p>
	<p>需要引入datecascade.js，引用方法如下</p>
	<pre class="brush: js;">
modules:{
	'datecascade':{
		fullpath:'../datecascade.js?',
		type:'js',
		requires:['node']
	}
}
	</pre>
	<p>新建一个Y.DateCascade对象</p>
	<pre class="brush: js;">
var Demo1 = new Y.DateCascade(id,config);

//id 为初始化输入框时的id或dom Object
//id 可以是Object：Y.one('.J_demo1') 或 idname：'id'
	</pre>
</div><!--/dec-->
<h2><strong>API</strong></h2>
<dl class="dec">
	<!--构造器-->
	<dt>Y.DateCascade</dt>
	<dd>
		<dl>
			<dt>说明：</dt>	
			<dd>日期级联选择构造器，通过new Y.DateCascade来render一个包含年月日期的三组下拉菜单</dd>
			<dt>使用：</dt>	
			<dd>new Y.DateCascade(options);</dd>
			<dt>配置：</dt>		
			<dd><p><b>defalutDate</b>:{string} 初始日期，如为空时下拉菜单不会有选中</p>
				<p><b>dateStart</b>:{string} 可选择开始日期，默认为 1930/1/1</p>
				<p><b>dateEnd</b>:{string}可设置结束日期，默认为客户端获取的今日</p>
		</dl>
		
	</dd>
	<!--实例方法-->
	<dt>Y.DateCascade 实例对象的方法</dt>
	<dd>
		<dl>
			<dt>方法：</dt>
			<dd>
				<p><b>init</b>:初始化，参数为options</p>
				<p><b>buildParam</b>:构造配置项，在init的时候调用</p>
				<p><b>render</b>:渲染，init在new的时候调用，render可以在运行时任意时刻调用，参数为options，其成员可覆盖原参数</p>
				<p><b>buildSelector</b>:初始化时渲染组件HTML</p>
				<p><b>parseParam</b>:重置配置项，在render的时候调用</p>
				<p><b>bindEvent</b>:注册事件</p>
				<p><b>_selectedDate</b>:返回选择日期，年月日任意一项不能为空</p>
				<p><b>makeYear</b>:创建年下拉菜单项</p>
				<p><b>makeMonth</b>:创建月下拉菜单项</p>
				<p><b>makeDate</b>:创建日下拉菜单项</p>
				<p><b>createMonth</b>:获得月份上下限</p>
				<p><b>createDate</b>:获得日期上下天数</p>
				<p><b>updateDate</b>:给文本框写入已选择日期</p>
				<p><b>_Fn</b>:内部依赖常用方法：如：<b>isLeapYear</b>(是否闰年)  <b>insertAfter</b>(节点后插入)</p>
			</dd>
		</dl>
	</dd>
</dl>
