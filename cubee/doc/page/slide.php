<div class="tit">Y.Slide Tab + Slide</div>
<p class="author">最后更新日期：2010-01-26  by lijing00333@163.com 拔赤</p>
<h2><strong>DEMO</strong></h2>
<div class="demo">
	<a class="button" href="../src/slide/demo/tab.html">典型的TAB结构 DEMO</a>
</div>
<h2><strong>NOTE</strong></h2>
<ul class="dec">
	<li>基于YUI3</li>
	<li>tab,slide,carousel本质上是一个东西，都是tab标签+内容切换,不同的仅是切换方式、自动播放、标签个数等</li>
	<li>Y.Slide伴随典型的tab结构，可通过css配置样式，但基本结构应当固定</li>
	<li>Y.Slide的适用范围：幻灯、静态页签的切换、自动轮播等，适用范围仍有限制</li>
	<li>开发者需要根据实际情况做适当扩展，扩展程度自由掌握</li>
	<li>在ie6，ie7，firefox2,firefox3,opera9,safari4,chrome中测试通过</li>
</ul>
<h2><strong>HTML CODE</strong></h2>
<div class="dec">
	<p>典型的html结构</p>
	<pre class="brush: html;">
<div id="J_tab_3" class="t-slide-2 mt20">
  <ul class="tab-nav clearfix">
    <li class="selected"><a href="#">1</a></li>
    <li><a href="">2</a></li>
    <li><a href="">3</a></li>
	<li><a href="">4</a></li>
  </ul>
  <div class="tab-content">
	<div class="tab-pannel"><p><img src="img/s1.jpg" /></p></div>
    <div class="tab-pannel hidden"><p><img src="img/s2.jpg" /></p></div>
    <div class="tab-pannel hidden"><p><img src="img/s3.jpg" /></p></div>
	<div class="tab-pannel hidden"><p><img src="img/s4.jpg" /></p></div>
  </div>
</div>
	</pre>
<ul class="dec">
	<li>#J_tab_3，必须指定</li>
	<li>ul.tab-nav,控制导航,必须指定</li>
	<li>ul.tab-nav li.selected,控制tab页签,必须指定</li>
	<li>div.tab-content，内容容器，必须指定</li>
	<li>div.tab-content div.tab-pannel，内容面板，必须指定</li>
</ul>
<p>基本原型结构如下：标注部分为必要部分</p>
<p><img src="assets/images/tab_html_code.gif" /></p>
<p>样式的定制</p>
<p>如果是图片轮播，div.tab-content需要指定宽高，超出部分隐藏掉，div.tab-pannel的宽高都为100%即可，这里需要指定div.tab-content的position:relative。</p>
<p>普通tab点击切换（无特效），内容部分高度不定，若带滚动切换效果，则需要制定div.tab-content尺寸</p>
<p>基本结构包含导航和内容两部分，“向前”、“向后”的按钮切换由开发者添加,只需保证基本原型html的完整即可</p>
<p>控制样式的class name可以配置，需要在js中启动的时候做相应配置，在不配置的情况下，Y.Slide以典型html结构做为默认配置进行渲染</p>

</div>
<h2><strong>USEAGE</strong></h2>
<div class="dec">
	<p>种子的引入</p>
	<p>需要slide.js，引用方法如下</p>
	<pre class="brush: js;">
modules:{
	'slide-skin':{//不提供默认皮肤，开发者自行绑定
		fullpath:'../skin.css',
		type:'css'
	},
	'slide':{
		fullpath:'../slide.js',
		requires:['slide-skin','node','anim']
	}
}
	</pre>
	<p>新建一个Y.Slide对象</p>
	<pre class="brush: js;">
new Y.Slide('J_tab_1',{
	autoSlide:false,
	eventype:'click'
});
	</pre>
</div><!--/dec-->
<h2><strong>EXAMPLES</strong></h2>
<div class="dec">
<p>基本的tab切换</p>
</div>
<div class="demo">
	<a class="button" href="../src/slide/demo/tab.html">tab DEMO</a>
	<a class="button" href="../src/slide/demo/slide.html">slide DEMO</a>
</div>
<div class="dec">
	<pre class="brush: js;">
new Y.Slide('J_tab_1',{
	eventype:'click',//tab上的触发事件
	effect:'v-slide',//切换效果
	autoSlide:true,//自动播放
	timeout:2000,//切换时间间隔
	speed:0.5,//切换速度，越小越快
	hoverStop:true//鼠标经过内容是否停止播放
});
	</pre>
</div>
<div class="dec">
<p>视频频道的slide，(无特效,点击切换)\(渐隐渐显,mouseover切换)\(垂直切换)\(水平切换)</p>
</div>
<div class="demo">
	<a class="button" href="../src/slide/demo/tb-slide-none.html">none-effect DEMO</a>
	<a class="button" href="../src/slide/demo/tb-slide-fade.html">fade-effect DEMO</a>
	<a class="button" href="../src/slide/demo/tb-slide-v-scroll.html">v-slide DEMO</a>
	<a class="button" href="../src/slide/demo/tb-slide-scroll.html">h-slide DEMO</a>
</div>
<div class="dec">
<p>娱乐首页的slide(垂直滚动)\频道区块的slide模块</p>
</div>
<div class="demo">
	<a class="button" href="../src/slide/demo/le.taobao.com.html">le.taobao.com DEMO</a>
	<a class="button" href="../src/slide/demo/mojo-slide.html">mojo DEMO</a>
</div>
<h2><strong>API</strong></h2>
<dl class="dec">
	<!--构造器-->
	<dt>Y.Slide</dt>
	<dd>
		<dl>
			<dt>说明：</dt>	
			<dd>Y.Slide构造器</dd>
			<dt>使用：</dt>	
			<dd>new Y.Slide(id,options);</dd>
			<dt>配置：</dt>		
			<dd><p><b>autoSlide</b>:{boolean} 是否自动播放，默认为false</p>
				<p><b>speed</b>:{float} 切换特效的速度，默认为0.5</p>
				<p><b>timeout</b>:{Number} 切换时间间隔,默认为1000毫秒</p>
				<p><b>effect</b>:{string} 特效类型，默认为'none'，取值：'none',无特效,'fade',渐隐,'h-slide',水平切换,'v-slide',垂直切换</p>
				<p><b>eventype</b>:{string} 触发tab切换的事件类型，默认为'click',取值：'click',点击，'mouseover',鼠标滑过</p>
				<p><b>easing</b>:{string} 切换面板的特效风格，默认为'easeBoth',参考<a href="http://developer.yahoo.com/yui/3/api/Easing.html" target=_blank>YUI doc</a></p>
				<p><b>hoverStop</b>:{boolean} 鼠标悬停面板上是否停止播放，默认为true</p>
				<p><b>selectedClass</b>:{string} tab选中时的class name，默认为'selected'</p>
				<p><b>conClass</b>:{string} 容器的class name，默认为't-slide'，目前没有用</p>
				<p><b>navClass</b>:{string} tab容器的class name，默认为'tab-nav'</p>
				<p><b>contentClass</b>:{string} tab内容容器的class name,默认为tab-content</p>
				<p><b>pannelClass</b>:{string} tab面板的class name，默认为tab-pannel</p>
				<p><b>id</b>:{string} hook</p>
				<p><b>before_switch</b>:{function} 切换之前执行的动作，参数同switch事件的参数，返回true，继续执行，返回false，停止执行</p>
				<p><b>ready</b>:{function} 初始化完成后的回调，参数同switch事件的参数，当前index为0</p>
				</dd>
		</dl>
		
	</dd>
	<!--实例方法-->
	<dt>Y.Slide实例对象的方法</dt>
	<dd>
		<dl>
			<dt>方法：</dt>
			<dd>
				<p><b>init</b>:初始化，参数为options</p>
				<p><b>previous</b>:滚动到上一个</p>
				<p><b>next</b>:滚动到下一个</p>
				<p><b>goto</b>:跳转到指定的tab，参数为index:0,1,2,3..，执行before_switch</p>
				<p><b>switch_to</b>:跳转到指定的tab，参数为index:0,1,2,3...，和goto的不同是，不执行执行before_switch</p>
				<p><b>play</b>:开始播放</p>
				<p><b>stop</b>:停止播放</p>
			</dd>
		</dl>
	</dd>
	<!--事件-->
	<dt>Y.Slide的事件</dt>
	<dd>
		<dl>
			<dt>事件：</dt>
			<dd>
				<p><b>switch</b>:切换时发生，不执行before_switch 回调参数为{index:index,navnode:navnode,pannelnode:pannelnode}</p>
			</dd>
		</dl>
	</dd>
</dl>
