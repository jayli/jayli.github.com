<div class="tit">Y.Box 弹出框</div>
<p class="author">最后更新日期：2009-12-10  by lijing00333@163.com 拔赤</p>
<h2><strong>DEMO</strong></h2>
<div class="demo">
	<a class="button" href="../src/box/demo/demo-box.html">演示示例 DEMO</a>
</div>
<h2><strong>NOTE</strong></h2>
<ul class="dec">
	<li>基于YUI3-overlay</li>
	<li>可以通过扩展Y.Box来实现自定义弹框</li>
	<li>弹框默认宽度是300px，默认高度是auto，高度可以随着内容增多而变化，宽度不会变化</li>
	<li>弹框宽度设为auto的时候，在ie6下表现和其他A级浏览器不尽一致，因此不建议使用宽度auto配置</li>
	<li>皮肤需要在加载的时候作为box的子模块引入进来</li>
	<li>可以层叠多个弹框</li>
	<li>safari,opera下弹层默认无法遮盖media控件，chrome下弹层默认不完全遮盖media控件,可以通过配置antijam为 true来隐藏media控件</li>
	<li>在ie6，ie7，firefox2,firefox3,opera9,safari4,chrome中测试通过</li>
</ul>
<h2><strong>USEAGE</strong></h2>
<div class="dec">
	<p>种子的引入</p>
	<p>需要两个文件，皮肤skin.css和box.js，引用方法如下</p>
<pre class="brush: js;">
modules:{
	'box-skin-default':{//默认皮肤
		fullpath:'../skin/default.css',
		type:'css'
	},
	'box-skin-sea':{//另外一套皮肤
		fullpath:'../skin/sea.css',
		type:'css'
	},
	'box':{
		fullpath:'../box.js',
		requires:['box-skin-sea','node','overlay','dd-plugin']
	}
}
</pre>
	<p>新建一个Y.Box对象</p>
	<pre class="brush: js;">
var box = new Y.Box({
	head:'<span class="title">the title</span><a class="close">[x]</a>',
	body:'body',
	foot:'foot'
}).render();
	</pre>
	<p>创建一个Y.Box.alert,带入回调并进行配置：标题、可拖拽、显示回调、加载的回调等等</p>
	<pre class="brush: js;">
var box = Y.Box.alert('哈哈哈',function(box){
	alert('点击ok');
	Y.log('点击ok');
},{
	title:'title',
	draggable:true,
	afterDrag:function(box){
		Y.log('拖拽over');
	},
	afterShow:function(box){
		Y.log('显示over');
	},
	afterHide:function(box){
		Y.log('隐藏over');
	},
	onload:function(box){
		Y.log('初始化over');
	}
	
});
	</pre>
	<p>创建一个Y.Box.confirm，带入回调函数并进行配置：标题，“否”的回调，拖拽的回调，显示和隐藏的回调等等</p>
	<pre class="brush: js;">
var box = Y.Box.confirm('confirm',function(box){
	alert('点击yes');
	Y.log('点击yes');
},{
	anim:false,
	title:'confirm title',
	no:function(box){
		alert('点击no');
		Y.log('点击no');	
	},
	cancleBtn:true,
	cancleTxt:'cancle',
	draggable:true,
	afterDrag:function(box){
		Y.log('拖拽confirm over');
	},
	afterShow:function(box){
		Y.log('显示comfirm over');
	},
	afterHide:function(box){
		Y.log('隐藏comfirm over');
	},
	onload:function(box){
		Y.log('初始化comfirm over');
	}
});
	</pre>
	<p>更多实例代码参照<a href="#">demo</a></p>
</div><!--/dec-->
<h2><strong>API</strong></h2>
<dl class="dec">
	<!--构造器-->
	<dt>Y.Box</dt>
	<dd>
		<dl>
			<dt>说明：</dt>	
			<dd>窗口构造器，通过new Y.Box来render一个box，可以使用Y.Box定制自己的alert、comfirm、prompt等等</dd>
			<dt>使用：</dt>	
			<dd>new Y.Box(options);</dd>
			<dt>配置：</dt>		
			<dd><p><b>head</b>:{string} box头部</p>
				<p><b>body</b>:{string} box主题部分</p>
				<p><b>foot</b>:{string} box尾部</p>
				<p><b>fixed</b>:{boolean} true,box不会随着窗口滚动而滚动，false，box会随着窗口滚动而滚动，默认为true（ie6下始终会跟随页面滚动而滚动）</p>
				<p><b>afterDrag</b>:{function} 拖拽结束的回调，参数为box本身</p>
				<p><b>draggable</b>:{boolean} 是否可拖拽,默认为true</p>
				<p><b>resizeable</b>:{boolean} 是否可resize，默认为false（未实现）</p>
				<p><b>afterResize</b>:{function} resize结束的回调，参数为box，（未实现）</p>
				<p><b>shownImmediately</b>:{boolean} 是否初始化完成立即显示，默认为true</p>	  
				<p><b>afterHide</b>:{function} 隐藏完毕后的回调，参数为box</p>
				<p><b>afterShow</b>:{function} 显示完成后的回调，参数为box</p>
				<p><b>onload</b>:{function} 初始化完成后的回调，在render后立即执行，参数为box</p>
				<p><b>modal</b>:{boolean} 是否带阴影，默认为false，阴影的动画效果未实现</p>
				<p><b>beforeUnload</b>:{function} 窗口关闭之前的回调,参数为box</p>
				<p><b>afterUnload</b>:{function} 窗口关闭之后的回调,参数为box		</p>
				<p><b>antijam</b>:{boolean} 是否隐藏media干扰物，默认为false</p>
				<p><b>maskOpacity</b>:{float} 设定遮盖层的透明度，范围是[0,1]，默认为0.6，当modal为true时才起作用</p></dd>
		</dl>
		
	</dd>
	<!--实例方法-->
	<dt>Y.Box实例对象的方法</dt>
	<dd>
		<dl>
			<dt>方法：</dt>
			<dd>
				<p><b>init</b>:初始化，参数为options</p>
				<p><b>bringToTop</b>:将box的z-index调到所有box之上</p>
				<p><b>render</b>:渲染，init在new的时候调用，render可以在运行时任意时刻调用，参数为options，其成员可覆盖原参数</p>
				<p><b>close</b>:关闭，并将窗口删除</p>
				<p><b>hide</b>:隐藏，不会删除窗口</p>
				<p><b>show</b>:显示窗口</p>
				<p><b>buildParam</b>:构造配置项，在init的时候调用</p>
				<p><b>parseParam</b>:重置配置项，在render的时候调用</p>
				<p><b>addMask</b>:添加遮罩</p>
				<p><b>removeMask</b>:删除遮罩</p>
				<p><b>hideMedias</b>:隐藏media干扰物</p>
				<p><b>showMedias</b>:解除media干扰物隐藏</p>

			</dd>
		</dl>
	</dd>
	<!--Y.Box.alert-->
	<dt>Y.Box.alert</dt>
	<dd>
		<dl>
			<dt>说明：</dt>	
			<dd>alert弹出框，基于Y.Box的一种定制</dd>
			<dt>使用：</dt>	
			<dd>Y.Box.alert(msg,callback,options)</dd>
			<dt>参数：</dt>		
			<dd>
				<p><b>msg</b>:{string} 消息体</p>
				<p><b>callback</b>:{function} 点击确定的回调，参数为box，默认点击确定会关闭窗口</p>
				<p><b>options</b>:{object} 配置项</p>
			</dd>
			<dt>配置：</dt>		
			<dd>
				<p><b>title</b>:{string} 标题</p>
				<p><b>closeable</b>:{boolean} 是否有关闭按钮，默认为true</p>
				<p><b>closeText</b>:{string} 可以自定义按钮</p>
				<p><b>btnText</b>:{string} 确定按钮的文案</p>
				<p>（其他字段同Y.Box的 options）</p>
		</dl>
		
	</dd>
	<!--Y.Box.confirm-->
	<dt>Y.Box.confirm</dt>
	<dd>
		<dl>
			<dt>说明：</dt>	
			<dd>comfirm弹出框，基于Y.Box的一种定制</dd>
			<dt>使用：</dt>	
			<dd>Y.Box.confirm(msg,callback,options)</dd>
			<dt>参数：</dt>		
			<dd>
				<p><b>msg</b>:{string} 消息体</p>
				<p><b>callback</b>:{function} 点击确定的回调，参数为box，默认点击确定会关闭窗口</p>
				<p><b>options</b>:{object} 配置项</p>
			</dd>
			<dt>配置：</dt>		
			<dd>
				<p><b>title</b>:{string} 标题</p>
				<p><b>yes</b>:{function} 点击是的回调，参数为box，默认点击会关闭，此项会覆盖callback</p>
				<p><b>no</b>:{function} 点击否的回调，参数为box</p>
				<p><b>yesText</b>:{string} 按钮“是”的文案</p>
				<p><b>noText</b>:{string} 按钮"否"的文案</p>
				<p><b>cancleBtn</b>:{boolean} 是否显示"关闭"按钮，默认为true</p>
				<p><b>cancleText</b>:{string} 按钮“取消”的文案</p>
				<p>（其他字段同Y.Box的 options）</p>
		</dl>
		
	</dd>
</dl>
