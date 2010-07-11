/**
 * box.js | cubee 弹出框控件
 * autohr:bachi@taobao.com
 * @class Y.Box
 * @param { object } 配置项
 * @return { object } 生成一个box实例
 * @requires { 'node','event','overlay','dd-plugin' }
 * @requires { box-skin-default或者box-skin-sea } 皮肤
 * 
 * Y.Box：	
 *	说明：	窗口构造器，通过new Y.Box来render一个box，可以使用Y.Box定制自己的alert、comfirm、prompt等等
 *	使用：	new Y.Box(options);
 *	配置：	head:{string} box头部
 *			body:{string} box主题部分
 *			foot:{string} box尾部
 *			fixed:{boolean} true,box不会随着窗口滚动而滚动，false，box会随着窗口滚动而滚动，默认为true（ie6下始终会跟随页面滚动而滚动）
 *			afterDrag:{function} 拖拽结束的回调，参数为box本身
 *			draggable:{boolean} 是否可拖拽,默认为true
 *			resizeable:{boolean} 是否可resize，默认为false（未实现）
 *			afterResize:{function} resize结束的回调，参数为box，（未实现）
 *			shownImmediately:{boolean} 是否初始化完成立即显示，默认为true
 *			afterHide:{function} 隐藏完毕后的回调，参数为box
 *			afterShow:{function} 显示完成后的回调，参数为box
 *			onload:{function} 初始化完成后的回调，在render后立即执行，参数为box
 *			modal:{boolean} 是否带阴影，默认为false，阴影的动画效果未实现
 *			beforeUnload:{function} 窗口关闭之前的回调,参数为box
 *			afterUnload:{function} 窗口关闭之后的回调,参数为box
 *			antijam:{boolean} 是否隐藏media干扰物，默认为false
 *			maskOpacity:{float} 设定遮盖层的透明度，范围是[0,1]，默认为0.6，当modal为true时才起作用
 *		Y.Box的实例的方法：
 *			init:初始化，参数为options
 *			bringToTop:将box的z-index调到所有box之上
 *			render:渲染，init在new的时候调用，render可以在运行时任意时刻调用，参数为options，其成员可覆盖原参数
 *			close:关闭，并将窗口删除
 *			hide:隐藏，不会删除窗口
 *			show:显示窗口
 *			buildParam:构造配置项，在init的时候调用
 *			parseParam:重置配置项，在render的时候调用
 *			addMask:添加遮罩
 *			removeMask:删除遮罩
 *			hideMedias:隐藏media干扰物
 *			showMedias:解除media干扰物隐藏
 *		
 */
YUI.namespace('Y.Box');
YUI.add('box', function (Y) {

	
	/**
     * Y.Box构造器
     * @class Y.Box
     * @param 
	 */
	Y.Box = function(){
		this.init.apply(this,arguments);
	};
	/**
	 * 全局的overlays存储
	 * @static { Array }
	 */
	Y.Box.overlays = [];

	Y.Box.prototype = {
		/**
		 * 初始化
		 * @memberof Y.Box
		 * @param { object } 配置项
		 * @return this
		 */
		init:function(opt){
			var that = this;
			that.buildParam(opt);

			that.overlay = new Y.Overlay({
				contentBox: "myContent",
				height:that.height,
				width:that.width,
				zIndex:1000,
				visible:false,
				shim:true,
				centered:true,
				headerContent: that.head,
				bodyContent: that.body,
				footerContent:that.foot
			});

			Y.Box.overlays.push(that.overlay);
			//处理zindex
			that.bringToTop();
			that.overlay._posNode.on('focus',function(e){
				e.target.blur();
			});
			that.overlay._posNode.on('mousedown',function(e){
				var widget = Y.Widget.getByNode(e.target);
				if (widget && widget instanceof Y.Overlay) {
					that.bringToTop();
					Y.log('bringToTop()');
				}
				Y.Box._xy = widget._posNode.getXY();
			});
			//处理afterdrag
			that.overlay._posNode.on('mouseup',function(e){
				var widget = Y.Widget.getByNode(e.target);
				if (widget && widget instanceof Y.Overlay) {
					var _xy =  widget._posNode.getXY();
					if(_xy[0] != Y.Box._xy[0] || _xy[1] != Y.Box._xy[1]){
						that.afterDrag(widget);
						Y.log('拖拽结束')
					}
				}
			});
			return this;
		},
		/**
		 * 处理层级关系
		 * @memberof Y.Box
		 * @return this
		 */
		bringToTop:function(){
			var that = this;
			if(Y.Box.overlays.length == 1)return;
			var topIndex = 0;
			for(var i = 0;i<Y.Box.overlays.length;i++){
				var t = Number(Y.Box.overlays[i].get('zIndex'));
				if(t > topIndex)topIndex = t;
			}
			that.overlay.set('zIndex',topIndex+1);
			return this;
		},
		/**
		 * 渲染弹层
		 * @memberof Y.Box
		 * @param { object }配置项
		 * @return this
		 */
		render:function(opt){
			var that = this;
			that.parseParam(opt);
			that.overlay.render("#overlay-align");
			var __x = that.overlay.get('x');
			var __y = that.overlay.get('y');
			if(that.height == 'auto' || that.width == 'auto'){
				var _R = that.overlay._posNode.get('region');
				if(that.height == 'auto'){
					__y -= Number(_R.height/2);
				}
				if(that.width == 'auto'){
					if(Y.UA.ie < 7 && Y.UA.ie > 0 ){//hack for ie6 when width was auto
						//that.overlay._posNode.query('div.yui-widget-bd').setStyle('width','100%');
						that.overlay.set('width',that.overlay._posNode.query('div.yui-widget-bd').get('region').width);
					}
					if(Y.UA.ie >= 7  ){//hack for ie7 when width was auto
						that.overlay._posNode.query('div.yui-widget-bd').setStyle('width','100%');
						that.overlay.set('width',that.overlay._posNode.query('div.yui-widget-bd').get('region').width);
					}
					__x -= Number(that.overlay._posNode.get('region').width/2);
				}
				that.overlay.move([__x,__y]);
			}
			if(that.shownImmediately)that.overlay.set('visible',true);
			if(that.fixed){
				//ie6始终是absolute
				if(/6/i.test(Y.UA.ie)){
					that.overlay._posNode.setStyle('position','absolute');
				}else{
					//若fixed则需要减去滚动条的top
					__y -= Y.get('docscrollY').get('scrollTop');
					__x -= Y.get('docscrollX').get('scrollLeft');
					that.overlay.move([__x,__y]);
					that.overlay._posNode.setStyle('position','fixed');
				}
			}
			if(that.x)that.overlay.set('x',Number(that.x));
			if(that.y)that.overlay.set('x',Number(that.y));
			if(that.draggable){
				that.overlay.headerNode.setStyle('cursor','move');
				if(!that.overlay._posNode.dd){
					that.overlay._posNode.plug(Y.Plugin.Drag);
					that.overlay._posNode.dd.addHandle('.yui-widget-hd');
				}
			}
			that.onload(that);
			//Y.log('load()');
			if(that.modal){
				that.addMask();
			}
			if(that.antijam){
				that.hideMedias();
			}
			return this;
		},
		/**
		 * 删除数组项，应当在base中
		 * @memberof Y.Box
		 * @param { value }值
		 * @param { array }数组
		 * @return this
		 */
		removeArray : function(v, a){
			for(var i=0,m=a.length; i<m; i++){
				if(a[i] == v){
					a.splice(i, 1);
					break;
				}
			}
		},
		/**
		 * 关闭弹层
		 * @method Y.Box.close
		 * @memberof Y.Box
		 * @return this
		 */
		close:function(){
			var that = this;
			that.beforeUnload(that);
			that.overlay.hide();
			that.showMedias();
			that.removeArray(that.overlay,Y.Box.overlays);
			that.overlay._posNode.remove();
			that.removeMask();
			that.afterUnload(that);
			that = null;
			Y.log('close()');
			return this;
		},
		/**
		 * 隐藏弹层
		 * @method Y.Box.hide
		 * @memberof Y.Box
		 * @return this
		 */
		hide:function(){
			var that = this;
			that.overlay.hide();
			that.showMedias();
			that.afterHide(that);
			return this;
		},
		/**
		 * 显示弹层
		 * @method Y.Box.show
		 * @memberof Y.Box
		 * @return this
		 */
		show:function(){
			var that = this;
			that.overlay.show();
			that.hideMedias();
			that.afterShow(that);
			return this;
		},
		/**
		 * 构造参数列表
		 * @method Y.Box.buildParam
		 * @memberof Y.Box
		 * @return this
		 */
		buildParam:function(o){
			var o = o || {};
			this.head = (typeof o.head == 'undefined'||o.head == null)?'':o.head;
			this.body= (typeof o.body== 'undefined'||o.body == null)?'':o.body;
			this.foot= (typeof o.foot== 'undefined'|| o.foot ==null)?'':o.foot;
			//this.anim = (typeof o.anim == 'undefined'||o.anim == null)?true:o.anim;
			this.skin = (typeof o.skin== 'undefined'||o.skin== null)?'default':o.skin;
			this.draggable = (typeof o.draggable == 'undefined'||o.draggable == null)?true:o.draggable;
			this.fixed= (typeof o.fixed == 'undefined'||o.fixed == null)?true:o.fixed;
			this.shownImmediately = (typeof o.shownImmediately == 'undefined'||o.shownImmediately == null)?true:o.shownImmediately;
			this.modal= (typeof o.modal == 'undefined'||o.modal == null)?false:o.modal;
			this.maskOpacity= (typeof o.maskOpacity == 'undefined'||o.maskOpacity == null)?0.6:o.maskOpacity;
			this.x= (typeof o.x == 'undefined'||o.x == null)?false:o.x;
			this.y= (typeof o.y == 'undefined'||o.y == null)?false:o.y;
			this.width = (typeof o.width == 'undefined'||o.width == null)?'300px':o.width;
			this.height = (typeof o.height == 'undefined'||o.height == null)?'auto':o.height;
			this.clickToFront= (typeof o.clickToFront == 'undefined'||o.clickToFront == null)?'':o.clickToFront;
			this.behaviours = (typeof o.behaviours == 'undefined'||o.behaviours == null)?'':o.behaviours;
			this.afterHide = (typeof o.afterHide == 'undefined'||o.afterHide == null)?new Function:o.afterHide;
			this.afterDrag= (typeof o.afterDrag == 'undefined'||o.afterDrag == null)?new Function:o.afterDrag;
			this.afterShow = (typeof o.afterShow== 'undefined'|| o.afterShow == null)?new Function:o.afterShow;
			this.beforeUnload = (typeof o.beforeUnload== 'undefined'||o.beforeUnload == null)?new Function:o.beforeUnload;
			this.afterUnload = (typeof o.afterUnload== 'undefined'||o.afterUnload == null)?new Function:o.afterUnload;
			this.onload = (typeof o.onload== 'undefined'||o.onload == null)?new Function:o.onload;//load ok后的回调,参数为box
			this.duration = (typeof o.duration == 'undefined'||o.duration == null)?0.3:o.duration;
			this.antijam = (typeof o.antijam == 'undefined'||o.antijam == null)?false:o.antijam;//是否隐藏干扰因素
			
			return this;
		},
		/**
		 * 重设参数
		 * @method Y.Box.parseParam
		 * @memberof Y.Box
		 * @return this
		 */
		parseParam:function(opt){
			var opt = opt || {};
			for(var i in opt){
				this[i] = opt[i];
			}
			return this;
		},
		/**
		 * 隐藏干扰因素
		 * @method Y.Box.hideMedias
		 * @memberof Y.Box
		 * @return this
		 */
		hideMedias:function(){
			var that = this;
			if(that.antijam == false)return this;
			that.hiddenMedia = [];
			var obj_array = document.body.getElementsByTagName('object');
			for(var i=0, m=obj_array.length; i<m; i++){
				if(obj_array[i].type.indexOf("x-oleobject") > 0){
					that.hiddenMedia.push(obj_array[i]);
					obj_array[i].style.visibility = 'hidden';
				}
			}
			return this;
		},
		/**
		 * 关闭后的解除隐藏
		 * @method Y.Box.showMedias
		 * @memberof Y.Box
		 * @return this
		 */
		showMedias:function(){
			var that = this;
			if(that.antijam == false)return this;
			if(that.hiddenMedia.length > 0){
				for(var i=0, m=that.hiddenMedia.length; i<m; i++){
					that.hiddenMedia[i].style.visibility = 'visible';
				}
				that.hiddenMedia = new Array();
			}
			return this;
		},
		/**
		 * 添加遮罩
		 * @method Y.Box.addMask
		 * @memberof Y.Box
		 * @return this
		 */
		addMask:function(){
			var that = this;
			if(Y.one('#t-shade-tmp'))return this;
			var node = Y.Node.create('<div id="t-shade-tmp" style="display: block; height: 20000px; z-index: 999;background-color:black;left:0;position:absolute;top:0;width:100%;display:none"></div>');
			node.setStyle('opacity',that.maskOpacity.toString());
			Y.one("html").setStyle('overflow','hidden');
			Y.one('body').append(node);
			node.setStyle('display','block');
			return this;
		},
		/**
		 * 删除遮罩
		 * @method Y.Box.removeMask
		 * @memberof Y.Box
		 * @return this
		 */
		removeMask:function(){
			var that = this;
			if(Y.Box.overlays.length == 0 && Y.one('#t-shade-tmp')){
				Y.one('#t-shade-tmp').remove();
				Y.one("html").setStyle('overflow','');
			}
			return this;
		}
	};//box prototype end

	/**
	 * Y.Box.alert提示框 
	 * @method Y.Box.alert
	 *	Y.Box.alert：
	 *		说明：	alert弹出框，基于Y.Box的一种定制
	 *		使用：	Y.Box.alert(msg,callback,options)
	 *		参数：	msg:{string} 消息体
	 *				callback:{function} 点击确定的回调，参数为box，默认点击确定会关闭窗口
	 *				options:{
	 *					title:{string} 标题
	 *					closeable:{boolean} 是否有关闭按钮，默认为true
	 *					closeText:{string} 可以自定义按钮
	 *					btnText:{string} 确定按钮的文案
	 *					（其他字段同Y.Box的options）
	 *				}
	 */
	Y.Box.alert = function(msg,callback,opt){
		if(typeof msg == 'undefined'||msg==null)var msg = '';
		if(typeof callback == 'undefined'||callback == null)var callback = new Function;
		if(typeof opt == 'undefined'||opt == null)var opt = {};
		var title = (typeof opt.title == 'undefined'||opt.title == null)?'提示':opt.title;

		var closeable = (typeof opt.closeable == 'undefined'||opt.closeable == null)?true:opt.closeable;
		var closeText = (typeof opt.closeText == 'undefined'||opt.closeText == null)?'<img src="http://img04.taobaocdn.com/tps/i4/T1m6tpXfxBXXXXXXXX-14-14.gif" border=0>':opt.closeText;
		var btnText = (typeof opt.btnText == 'undefined'||opt.btnText == null)?'确定':opt.btnText;
		
		var closestr = closeable?'<a class="close closebtn">'+closeText+'</a>':'';
		var headstr = '<span class="title">'+title+'</span>'+closestr;
		opt.head = headstr;
		opt.body = msg;
		opt.foot = '<div align=right><button class="okbtn">'+btnText+'</div>';
		opt.onload = function(box){
			var node = box.overlay._posNode;
			node.query('.okbtn').on('click',function(e){
				e.halt();
				callback(box);
				box.close();
			});
			try{
				node.query('.closebtn').setStyle('cursor','pointer');
				node.query('.closebtn').on('click',function(e){
					e.halt();
					box.close();
				});
			}catch(e){}
		};

		var box = new Y.Box(opt);
		return box.render();
	};


	/**
	 * Y.Box.confirm
	 * @method Y.Box.confirm
	 *
	 *	Y.Box.confirm：
	 *		说明：	comfirm弹出框，基于Y.Box的一种定制
	 *		使用：	Y.Box.confirm(msg,callback,options)
	 *		参数：	msg:{string} 消息体
	 *				callback:{function} 点击确定的回调，参数为box，默认点击确定会关闭窗口
	 *				options:{
	 *					title:{string} 标题
	 *					yes:{function} 点击是的回调，参数为box，默认点击会关闭，此项会覆盖callback
	 *					no:{function} 点击否的回调，参数为box
	 *					yesText:{string} 按钮“是”的文案
	 *					noText:{string} 按钮"否"的文案
	 *					cancleBtn:{boolean} 是否显示"关闭"按钮，默认为true
	 *					cancleText:{string} 按钮“取消”的文案
	 *					（其他字段同Y.Box的options）
	 *				}
	 */
	Y.Box.confirm = function(msg,callback,opt){
		if(typeof msg == 'undefined'||msg == null)var msg = '';
		if(typeof callback == 'undefined'||callback == null)var callback = new Function;
		if(typeof opt == 'undefined'||opt == null)var opt = {};
		var title = (typeof opt.title == 'undefined'||opt.title == null)?'提示':opt.title;

		var closeable = (typeof opt.closeable == 'undefined'||opt.closeable == null)?true:opt.closeable;
		var closeText = (typeof opt.closeText == 'undefined'||opt.closeText == null)?'<img src="http://img04.taobaocdn.com/tps/i4/T1m6tpXfxBXXXXXXXX-14-14.gif" border=0>':opt.closeText;
			opt.yes = (typeof opt.yes == 'undefined'||opt.yes == null)?callback:opt.yes;
			opt.no= (typeof opt.no == 'undefined' || opt.no == null)?new Function:opt.no;
		var yesText = (typeof opt.yesText == 'undefined' || opt.yesText == null)?'确定':opt.yesText;
		var noText = (typeof opt.noText == 'undefined' || opt.noText == null)?'取消':opt.noText;
		var cancleBtn = (typeof opt.cancleBtn == 'undefined'||opt.cancleBtn == null)?false:opt.cancleBtn;
		var cancleText = (typeof opt.cancleText == 'undefined'||opt.cancleText == null)?'关闭':opt.cancleText;


		var canclestr = cancleBtn?'<button class="canclebtn">'+cancleText+'</button>':'';
		var closestr = closeable?'<a class="close closebtn">'+closeText+'</a>':'';
		var headstr = '<span class="title">'+title+'</span>'+closestr;
		opt.head = headstr;
		opt.body = msg;
		opt.foot = '<div align=right><button class="yesbtn">'+yesText+'</button>&nbsp;<button class="nobtn">'+noText+'</button>&nbsp;'+canclestr+'</div>';
		opt.onload = function(box){
			var node = box.overlay._posNode;
			node.query('.yesbtn').on('click',function(e){
				e.halt();
				opt.yes(box);
				box.close();
			});
			node.query('.nobtn').on('click',function(e){
				e.halt();
				opt.no(box);
				box.close();
			});
			if(cancleBtn){
				node.query('.canclebtn').on('click',function(e){
					e.halt();
					box.close();
				});
			}
			try{
				node.query('.closebtn').setStyle('cursor','pointer');
				node.query('.closebtn').on('click',function(e){
					e.halt();
					box.close();
				});
			}catch(e){}
		};

		var box = new Y.Box(opt);
		return box.render();

	};

	//kill ie 6
	/*
	 * just for fun
	 */
	var __k=[];
	Y.one('document').on('keydown',function(e){
		__k.push(e.keyCode);
		if(__k.toString().indexOf("75,73,76,76,73,69,54")>=0) {
			Y.Box.alert('<a href="http://ie6update.com" target=_blank><img src="http://img01.taobaocdn.com/tps/i1/T1dh0CXgFAXXXXXXXX-250-332.jpg" border="0" /></a><div align=center><a href="http://ie6update.com" target=_blank>Upgrade Your Ie 6!</a></div>',null,{
				title:'Hello Dear :)',
				width:'295px',
				height:'435px'
			});
			__k = [];
		}
	});

});
