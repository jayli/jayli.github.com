<div class="tit">Y.Postip 相对提示</div>
<p class="author">最后更新日期：2010-04-11  by idd.chiang@gmail.com 乐渔</p>
<h2><strong>DEMO</strong></h2>
<div class="demo">
	<a class="button" href="../src/postip/demo/index.html">演示示例 DEMO</a>
	<a class="button" href="../src/floatip/demo/demo.html">简单提示 DEMO</a>
</div>
<h2><strong>NOTE</strong></h2>
<ul class="dec">
	<li>可以通过扩展Y.Postip来实现自定义相对提示层</li>
	<li>相对提示层是相对于触发层的25个固定定位和相对于触发层top、left的自定义数值,如下图：<br/><img src="../src/postip/demo/img/aligntemp.png"/></li>
	<li>相对提示层的默认z-index为1000，可以设置触发层的z-index级别来得到想要的效果，如例中第三种方式。</li>
	<li>每新建一个Y.Postip对象会生成一个相对提示层，放出相对提示层的样式可设置，丰富表现</li>
	<li>IE6下设置了iframe遮盖Select</li>
	<li>相对提示层的内容可设置text或html，同样也可以指定相对提示层为已存在Dom对象，如例中第四种方式。</li>
	<li>新建内容如果为空将会从触发层的 rel 中取值。如例中第二第三种方式。</li>
	<li>目前在ie下发现对get('region')的值解释有bug，导致相对提示层有偏移，试验过可以通过对触发层的csshack得到对其</li>
	<li>简单提示可参照<a href="?floatip">Y.Floatip</a></li>
</ul>
<h2><strong>USEAGE</strong></h2>
<div class="dec">
	<p>种子的引入</p>
	<p>需要引入postip.js，引用方法如下</p>
	<pre class="brush: js;">
modules:{
	'postip':{
		fullpath:'../postip.js',
		requires:['node']
	}
}
	</pre>
	<p>新建一个Y.Postip对象</p>
	<pre class="brush: js;">
var Demo = new Y.Postip('demo1',{pos:{h:'30',v:'-30'},content:'<div class="sb"><p>Tips<a href="#">Close</a></p></div>',eventype:'click'});
	</pre>
	<p>更多实例代码参照<a href="#">demo</a></p>
</div><!--/dec-->
<h2><strong>API</strong></h2>
<dl class="dec">
	<!--构造器-->
	<dt>Y.Postip</dt>
	<dd>
		<dl>
			<dt>说明：</dt>	
			<dd>相对提示构造器，通过new Y.Postip来render一个tip，可以使用Y.Postip定制tip出现方式、tip内容、tip定位等</dd>
			<dt>使用：</dt>	
			<dd>new Y.Postip(options);</dd>
			<dt>配置：</dt>		
			<dd><p><b>pos.h</b>:{string} 相对提示的水平对齐方式，默认 left，{oleft,left,center,right,oright,正负数值可选}</p>
				<p><b>pos.v</b>:{string} 相对提示的垂直对齐方式，默认 top，{otop,top,middle,bottom,obottom,正负数值可选}</p>
				<p><b>eventype</b>:{string} 触发相对提示层的鼠标事件，默认为<b>mouseover</b>，可选<b>click</b></p>
				<p><b>mouseout</b>:{boolean} 鼠标离开相对弹出层或触发层时，相对弹出层是否消失，默认true</p>
				<p><b>classname</b>:{string} 相对弹出层样式设置，默认为 .postip</p>
				<p><b>content</b>:{string} 相对弹出层内容设置，如未填或为空时，内容为触发层rel值，可以是innerHTML</p>
				<p><b>otip</b>:{object} 默认js会构建一个tip，指定otip对象后，tip为otip对象</p>


		</dl>
		
	</dd>
	<!--实例方法-->
	<dt>Y.Postip实例对象的方法</dt>
	<dd>
		<dl>
			<dt>方法：</dt>
			<dd>
				<p><b>init</b>:初始化，参数为options</p>
				<p><b>buildParam</b>:构造配置项，在init的时候调用</p>
				<p><b>render</b>:渲染，init在new的时候调用，render可以在运行时任意时刻调用，参数为options，其成员可覆盖原参数</p>
				<p><b>parseParam</b>:重置配置项，在render的时候调用</p>
				<p><b>bindEvent</b>:注册事件</p>
				<p><b>posTip</b>:重新定位相对弹出层，参数为触发对象</p>
				<p><b>show</b>:显示相对提示层</p>
				<p><b>hide</b>:隐藏相对提示层</p>
				<p><b>getLeft</b>:获得相对提示层相对于触发层的左边距，参数为(pos.h,触发层,相对提示层)</p>
				<p><b>getTop</b>:获得相对提示层相对于触发层的顶边距，参数为(pos.v,触发层,相对提示层)</p>

			</dd>
		</dl>
	</dd>
</dl>
