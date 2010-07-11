YUI.namespace('Y.Pagination');
YUI.add('pagination',function(Y){
	/**
	 * Class Y.Pagination 
	 * 分页控件
	 * @param
	 * @return
	 */
	Y.Pagination = function(){
		this.init.apply(this,arguments);
	};
	Y.augment(Y.Pagination,Y.Plugin.Host);
	Y.mix(Y.Pagination, {
		/**
		 * 默认分页步长
		 */
		STEP:7,
		
		init:function(node,o){
			var that = this;
			that.node = node;
			that.buildParam(o);
			that.buildEvent();
			that.render();
			return this;
		},
		buildParam:function(o){
			var that = this;
			if(typeof o == 'undefined' || o == null){
				var o = {};
			}
			that.index = (typeof o.index == 'undefined' || o.index == null)?1:Number(o.index);
			that.max = (typeof o.max == 'undefined' || o.max == null)?0:Number(o.max);
			that.page = (typeof o.page == 'undefined' || o.page == null)?new Function:o.page;
			that.showArrow = (typeof o.showArrow == 'undefined' || o.showArrow == null)?true:o.showArrow;
			that.STEP = (typeof o.step == 'undefined' || o.step == null)?that.STEP:o.step;
			return this;
		},
		parseParam:function(o){
			var that = this;
			if(typeof o == 'undefined' || o == null){
				var o = {};
			}
			for(var i in o){
				that[i] = o[i];
			}
			return this;
		},
		buildEvent:function(){
			var that = this;
			var EventFactory = function(){
				this.publish("trigger");
			};
			Y.augment(EventFactory, Y.Event.Target);
			that.EventCenter = new EventFactory();
			/*
			that.on = function(type,foo){
			};
			*/

			return this;
		},
		on:function(type,foo){
			var that = this;
			that.EventCenter.subscribe(type, foo);
			return this;
		},
		render:function(o){
			var that = this;
			that.parseParam(o);
			if(that.max == 0){
				node.set('innerHTML','');
				return this;
			}
			var _step = that.STEP;
			if(that.max < that.STEP)_step = that.max;
			if(that.index > that.max)that.index = that.max;
			var a = [];
			var h = Math.floor(_step/2);
			var str = [];//要显示的串
			var _t = '';//前驱
			var t_ = '';//后继
			if(that.index > h && that.index < (that.max - h)){//中部
				var k = that.index - h;
				for(var i = k;i<Number(k+Number(_step));i++){
					a.push(i)
				}
				if(Number(that.index) - h > 1){
					_t = '...';
				}
				if((Number(that.index) + h) < that.max){
					t_ = '...';
				}
			}else if(Number(that.index) <= h){//头部
				for(var i = 1;i<=_step;i++){
					a.push(i);
				}
				if(Number(that.max) > _step){
					t_ = '...';
				}
			}else{//尾部
				for(var i = ((Number(that.max) - _step) + 1);i<=Number(that.max);i++){
					if(i > 0)a.push(i);
				}
				if(Number(that.max) > _step){
					_t = '...';
				}
			}
			if(that.showArrow){
				var display = '';
			}else{
				var display = 'none';
			}
			that.renderUI([
				'<span class="t-p-ctrl">',
					'<a href="javascript:void(0);" style="display:'+display+'" class="J_first">&lt;&lt;</a> <a href="javascript:void(0);" class="J_previous">&lt;</a>',
				'</span>',
				'<span class="t-p-frame" style="width:auto;"><span class="t-p-framebelt" style="width:auto;">',
				'<span style="padding:0px;">'+_t+'</span>',
				that.genbeltstring(a),
				'<span style="padding:0px;">'+t_+'</span>',
				'</span></span>',
				'<span class="t-p-ctrl">',
					'<a href="javascript:void(0);" class="J_next">&gt;</a> <a href="javascript:void(0);" style="display:'+display+'" class="J_last">&gt;&gt;</a>',
				'</span>'].join('')
			);
			return this;

		},
		renderUI:function(str){
			var that = this;
			that.node.set('innerHTML','');
			that.node.set('innerHTML',str);
			that.addEvent();
			return this;

		},
		genbeltstring:function(a){
			var that = this;
			var str = '';
			var currp = '';
			for(var i = 0 ;i<a.length;i++){
				if(that.index == a[i])currp = ' class="current"';
				else currp = '';
				str += ('<a href="javascript:void(0);" '+currp+'>'+a[i]+'</a>');
			}
			return str;
		},
		/**
		 * 设置跳转页
		 */
		setpos:function(i){
			var that = this;
			that.render({index:i});
			return this;
		},
		/**
		 * 设置最大页
		 */
		setmax:function(max){
			var that = this;
			that.render({max:max});
			return this;
		},
		addEvent:function(){
			var that = this;
			if(typeof that.EV != 'undefined'){
				that.EV.detach();
				//that.cEV.detachAll();
			}
			that.EV = that.node.on('click',function(e){
				if(e.target.get('tagName') != 'A')return;
				e.halt();
				e.target.blur();
				var _cur = Number(e.target.get('innerHTML'));
				var _max = that.max;
				var _setpos = that.setpos;
				if(e.target.hasClass('J_first')) {
					if(that.index != 1){
						that.EventCenter.fire('trigger',1);
						that.render({index:1});
					}
				}
				else if(e.target.hasClass('J_previous')) {
					if(that.index > 1){
						that.EventCenter.fire('trigger',that.index - 1);
						that.render({index:that.index-1});
					}
				}
				else if(e.target.hasClass('J_next')) {
					if(that.index < that.max){
						that.EventCenter.fire('trigger',that.index + 1);
						that.render({index:that.index +1});
					}
				}
				else if(e.target.hasClass('J_last')) {
					if(that.index != that.max){
						that.EventCenter.fire('trigger',that.max);
						that.render({index:that.max});
					}
				}else {
					that.EventCenter.fire('trigger',_cur);
					that.render({index:_cur});
				}
			});
			return this;
		}
	},0,null,4);

	//Plugin
	//requires anim,plugin
	YUI.namespace('Y.Plugin.PF');
	Y.Plugin.PF = function(){
		this.init.apply(this,arguments);
	};
	Y.Plugin.PF.prototype = {
		init:function(o){
			var that = this;
			var host = that.host = o.host;
			that.old = {};
			that.old.renderUI = that.host.renderUI;
			that.host.renderUI = function(str){
				var that = host;
				var anim1 = new Y.Anim({
					node:that.node,
					from:{
						opacity:1
					},
					to:{
						opacity:0
					},
					duration:0.5
				});
				anim1.on('end',function(){
					that.node.set('innerHTML',str);
					anim2.run();
				});
				var anim2 = new Y.Anim({
					node:that.node,
					from:{
						opacity:0
					},
					to:{
						opacity:1
					},
					duration:0.5
				});
				anim2.on('end',function(){
					that.addEvent();
				});
				anim1.run();
				return that;
			};
		},
		destroy:function(){
			var that = this;
			that.host.renderUI = that.old.renderUI;
			return this;
		}
	};
	Y.Plugin.PF.NS = 'fx';
	//Plugin end

},'3.0.0',{requires:['anim','node','plugin']});
