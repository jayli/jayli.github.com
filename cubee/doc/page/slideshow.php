<div class="tit">Y.Slideshow 幻灯</div>
<p class="author">最后更新日期：2009-12-28  by zhuoqun@taobao.com 卓群</p>
<h2><strong>DEMO</strong></h2>
<div class="demo">
	<a class="button" href="../src/slideshow/demo/slideshow.html">演示示例 DEMO</a>
</div>
<h2><strong>NOTE</strong></h2>
<ul class="dec">
	<li>基于YUI3</li>
	<li>可以根据需求自定义样式和内容</li>
	<li>可以设置是否自动轮播以及轮播速度</li>
	<li>可以设置停播方式，悬停或点击</li>
	<li>默认幻灯切换效果是fade</li>
</ul>
<h2><strong>USEAGE</strong></h2>
<div class="dec">
	<p>需要先搭HTML架子，class="selected" 表示当前选中的slide 。如下：</p>
	<pre class="brush: html;">
	  <div id="demo1">
            <ul class="c-slideshow-nav">
                <li class="selected">...</li>
                <li>...</li>
                <li>...</li>
                <li>...</li>
                <li>...</li>
            </ul>
            <div class="c-slideshow-content">
                <div>...</div>
                <div>...</div>
                <div>...</div>
                <div>...</div>
                <div>...</div>
            </div>
          </div>
	</pre>
	<p>种子的引入</p>
	<p>需要一个文件，slideshow.js，引用方法如下</p>
	<pre class="brush: js;">
	modules:{
		'slideshow':{
			fullpath:'slideshow.js',
			requires:['node', 'anim-base']
		}
	}
	</pre>
	<p>新建一个Y.Slideshow对象</p>
	<pre class="brush: js;">
	var slideshow = new Y.Slideshow('demo',{
		clickEnable:false, 
		autoPlay:true
	});
	</pre>
</div><!--/dec-->
<h2><strong>API</strong></h2>
<dl class="dec">
	<!--构造器-->
	<dt>Y.Slideshow构造器</dt>
	<dd>
		<dl>
			<dt>说明：</dt>	
			<dd>Slideshow 构造器</dd>
			<dt>使用：</dt>	
			<dd>new Y.Slideshow(id,options);</dd>
			<dt>参数：</dt>	
			<dd><p><b>id</b>:{string} 容器的id</p>
				<p><b>options</b>:{object} 配置项</p></dd>
			<dt>配置：</dt>	
			<dd><p><b>clickEnable</b>:{boolean} 交互方式是否为点击，默认是悬停</p>
				<p><b>autoPlay</b>:{boolean} 是否自动轮播，默认为 true</p>
				<p><b>speed</b>:{int} 轮播的速度，单位是毫秒。默认值为 2000</p>
			</dd>
		</dl>
	</dd>
</dl>
