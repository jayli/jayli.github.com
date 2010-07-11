YUI.namespace('Y.Postip');
YUI.add('Postip',function(Y){
	Postip = function(){
		this.init.apply(this,arguments);
	};
	Y.mix(Postip,{
		init:function(id,config){
			var that = this;
			that.id = id;
			that.config = config;
			that.con = (typeof that.id == 'object') ? that.id : Y.one('#'+that.id);
			//that.con = Y.one('#'+that.id);
			that.isShow = false;
			//渲染弹出框
			that.render();
			//构造弹出框
			that.buildTip();
			//绑定事件
			that.bindEvent();
			return this;
		},
		buildTip:function(){
			var that = this;
			if(that.oTip)return;
			if(typeof that.Tip == 'undifined' || that.Tip == null){
				var tip = Y.Node.create('<div class="J-tip" style="visibility:hidden;position:absolute;z-index:1000;top:0"><div class="J-tipbox '+that.oTipclass+'">'+that.content+'</div></div>');
				Y.one('body').appendChild(tip);
				that.oTip = tip;
			}else if(typeof that.Tip == 'object'){
				that.oTip = that.Tip;
			}
			//IE6以下隐藏干扰层
			if(/6/i.test(Y.UA.ie)){
				that.mark = Y.Node.create('<iframe frameborder="0" src="javascript:false" style="background:transparent;position:absolute;border:none;top:0;left:0;padding:0;margin:0;z-index:-1;filter:alpha(opacity=0);"></iframe>');
				that.mark.setStyles({
					'width':that.oTip.get('region').width,
					'height':that.oTip.get('region').height
				});
				that.oTip.appendChild(that.mark);
			}
			return this;
		},
		buildParam:function(o){
			var that = this;
			//基本参数
			var o = (typeof o == 'undefined' || o == null)?{}:o;

			//鼠标事件类型
			that.eventype = (typeof o.eventype=='undifined' || o.eventype==null)?'mouseover':o.eventype;
			that.mouseout = (typeof o.mouseout=='undifined' || o.mouseout==null)?true:false;
			//设置Tip对齐方式
			that.pos = (typeof o.pos == 'undefined' || o.pos == null)?{}:o;
			if(o.pos){
				//如果为数值时即为自定义位置
				that.pos.hAlign = (typeof o.pos.h=='undifined' || o.pos.h==null)?'left':o.pos.h;
				that.pos.vAlign = (typeof o.pos.v=='undifined' || o.pos.v==null)?'bottom':o.pos.v;
			}
			that.oTipclass = (typeof o.classname=='undifined' || o.classname==null)?'postip':o.classname;

			that.content = o.content;
			that.Tip = o.otip;
			return this;
		},
		//渲染HTML生成或找到弹出框
		render:function(o){
			var that = this;
			that.parseParam(o);
			//如果是点击事件鼠标变成手势
			if(that.eventype == 'click'){
				that.con.setStyle('cursor','pointer');
			}
			return this;
		},
		/**
		* 过滤参数列表
		*/
		parseParam:function(o){
			var that = this;
			if(typeof o == 'undefined' || o == null){
				var o = {};
			}
			for(var i in o){
				that.config[i] = o[i];
			}
			that.buildParam(that.config);
			return this;
		}, 
		//注册事件
		bindEvent:function(){
			var that = this; 
			that.con.on(that.eventype,function(e){
				var el = e.target;
				that.posTip(el);
				if(typeof that.content == 'undefined' || that.content  == null){
						//debugger;
					if(el.getAttribute('rel')){
						that.oTip.one('.J-tipbox').set('innerHTML',el.getAttribute('rel'));
					}
				}
				that.isShow = true;
				if(that.isShow == true)that.show();
			});
			that.oTip.on('mouseover',function(e){
				e.halt();
				that.isShow = true;
				that.show();
			});
			if(that.mouseout){
				that.con.on('mouseout',function(e){
				e.halt();
				that.isShow = false;
				setTimeout(function(){
					if(that.isShow == false)that.hide();
				},300)
				});
				that.oTip.on('mouseout',function(e){
					e.halt();
					that.isShow = false;
					setTimeout(function(){
						if(that.isShow == false)that.hide();
					},200)
				});
			}
			
			return this;
		},
		//定位Tip
		posTip:function(o){
			var	that = this
			var _left,_top;	  
			_left = that.getLeft(that.pos.hAlign,o,that.oTip);
			_top = that.getTop(that.pos.vAlign,o,that.oTip);						
			that.oTip.setStyles({
				'left':_left+'px',
				'top':_top+'px'
			});
			//IE6下隐藏干扰物并定位iframe
			
			return this;
		},
		//得到弹出框相对左边距
		getLeft:function(a,o,e){
			var that = this,
				cget = o.get('region'),
				eget = e.get('region');
			//如果为数值
			if(!isNaN(parseInt(Number(a)))){
				return cget[0] + Number(a);
			}else{
				switch(a){
					case 'oleft': 
						return cget[0] - eget.width;
					case 'oright':
						return cget[0] + cget.width;
					case 'center':
						return cget[0] + (cget.width - eget.width)/2;
					case 'right':
						return cget[0] + cget.width - eget.width;
					default:
						return cget[0];				
				}
			};
			return this;
		},
		//得到弹出框相对顶边距
		getTop:function(a,o,e){
			var that = this,
				cget = o.get('region'),
				eget = e.get('region');
			if(!isNaN(parseInt(Number(a)))){
				return cget[1] + Number(a);
			}else{
				switch(a){
					case 'otop': 
						return cget[1] - eget.height;
					case 'obottom':
						return cget[1] + cget.height;
					case 'middle':
						return cget[1] + (cget.height - eget.height)/2;
					case 'bottom':
						return cget[1] + cget.height - eget.height;
					default:
						return cget[1];				
				}
			}
			return this;
		},
		//控制弹出框显示
		show:function(){
			var that = this;
			if(that.oTip.getStyle('visibility') == 'visible')return;
			that.oTip.setStyle('visibility','visible');
			return this;
		},
		//控制弹出框隐藏
		hide:function(){
			var that = this;
			if(that.oTip.getStyle('visibility') == 'visible'){
				that.oTip.setStyle('visibility','hidden');	
			};
			return this;
		}
		
	},0,null,4);

	Y.Postip = Postip;
	
},'',{requires:['node']});
