/**
 * floatip.js | floatip 浮动提示widget
 * autohr:lijing00333@163.com 拔赤
 * @class Y.Floatip
 * @param { yui3-node } node或者nodelist
 * @param { object } 配置项
 * @return { object } 生成一个Floatip实例
 * @requires { 'node' }
 * 
 * Y.Floatip：	
 *	说明：	简单浮动提示
 *	使用：	new Y.Floatip(node,options);
 *	参数:	node:{yui3-node}yui3的node
 *	配置：	float_class {string} 浮动层的classname
 *			right:距离触点右上角的右边距
 *			top:距离触点右上角的上边距
 *			stay:mouseout多少毫秒后消失
 * Tip:msg需要在node的rel属性中指定
 *			
 *		
 */
YUI.namespace('Y.Floatip');
YUI.add('floatip',function(Y){
	var FloatTip = function(){
		this.init.apply(this,arguments);
	};

	FloatTip.prototype  = {
		/**
		 * 构造器
		 */
		init:function(node,config){
			var that = this;
			that.buildParam(config);
			var tips_trigger = that.tips_trigger = node;
			var tip = that.tip = Y.Node.create('<div class="'+that.float_class+' hidden"></div>');
			that.showing = false;
			Y.one('body').append(tip);
			that.bindEvent();
			return this;
		},
		/**
		 * 绑定事件
		 */
		bindEvent:function(){
			var that = this;
			var tips_trigger = that.tips_trigger;
			var tip = that.tip;
			tips_trigger.on('mouseover',function(e){
				e.halt();
				that.showing = true;
				that.show(e.target);
			});
			tips_trigger.on('mouseout',function(e){
				e.halt();
				that.showing = false;
				setTimeout(function(){
					if(that.showing == false){
						that.hide();
					}
				},that.stay);
			});
			tip.on('mouseover',function(e){
				e.halt();
				that.showing = true;
			});
			tip.on('mouseout',function(e){
				e.halt();
				that.showing = false;
				setTimeout(function(){
					if(that.showing == false){
						that.hide();
					}
				},that.stay);
			});

			return this;
		},
		/**
		 * 构建参数
		 */
		buildParam:function(o){
			var o = o || {};
			this.float_class = (typeof o.float_class == 'undefined'||o.float_class == null)?'float-tip':o.float_class;
			this.right = (typeof o.right == 'undefined'||o.right == null)?4:o.right;
			this.top = (typeof o.top == 'undefined'||o.top == null)?0:o.top;
			this.stay = (typeof o.stay == 'undefined'||o.stay == null)?300:o.stay;
			return this;

		},
		show:function(trigger){
			var that = this;
			that.tip.removeClass('hidden');
			var txt = trigger.getAttribute('rel');
			var _x = trigger.getXY()[0]+ trigger.get('region').width + that.right;
			var _y = trigger.getXY()[1] + that.top;
			that.tip.setStyle('left',_x.toString()+'px');
			that.tip.setStyle('top',_y.toString()+'px');
			that.tip.set('innerHTML',txt);
		},
		hide:function(){
			var that = this;
			that.tip.addClass('hidden');
		}
	};
	Y.Floatip = FloatTip;



},'',{requires:['node']});
