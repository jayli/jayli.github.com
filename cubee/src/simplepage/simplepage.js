/**
 * simplepage.js | simplepage 分页控件，包含list items和分页的页码，页码无逻辑
 * autohr:lijing00333@163.com 拔赤
 * @class Y.Spage
 * @param { yui3-node } nodelist:yui3的nodelist
 * @param { string } pageid:页码容器的id,页码为a，选中后默认添加classname 'selected'
 * @param { object } 配置项
 * @return { object } 生成一个Spage实例
 * @requires { 'node' }
 * 
 * Y.Spage：	
 *	说明：	简单分页构造器
 *	使用：	new Y.Spage(nodelist,id,options);
 *	参数:	nodelist:{yui3-nodelist}yui3的nodelist
 *	参数:	id:{string}容器id
 *	配置：	selected_class {string} 选中的a的className
 *			step:每页的步长
 *			index:当前显示第几页
 *			
 *		
 */

YUI.namespace('Y.Spage');
YUI.add('spage',function(Y){
	Y.Spage = function(){
		this.init.apply(this,arguments);
	};
	Y.Spage.prototype = {
		/**
		 * 构造器
		 */
		init:function(nodelist,pageid,config){
			var that = this;
			that.buildParam(config);
			that.nodelist = nodelist;
			that.pageid = pageid;

			that.size = that.nodelist.size();
			that.pages = Math.ceil(that.size / that.step);
			that.buildEventCenter();
			that.buildHTML();
			that.bindEvent();
			that.render({index:1});
			return this;
		},
		/**
		 * 事件中心
		 */
		buildEventCenter:function(){
			var that = this;
			var EventFactory = function(){
				this.publish("pagechange");
			};
			Y.augment(EventFactory, Y.Event.Target);
			that.EventCenter = new EventFactory();
			return this;
		},
		/**
		 * 绑定函数 
		 */
		on:function(type,foo){
			var that = this;
			that.EventCenter.subscribe(type,foo);
			return this;
		},
		/**
		 * 渲染 
		 */
		render:function(o){
			var that = this;
			var o = o || {};
			that.parseParam(o);
			if(that.index > that.pages)that.index = that.pages;
			that.showPage(that.index);
			return this;
		},
		/**
		 * 构建参数
		 */
		buildParam:function(o){
			var that = this;
			if(typeof o == 'undefined' || o == null){
				var o = {};
			}
			that.selected_class= (typeof o.selected_class == 'undefined' || o.selected_class == null)?'selected':o.selected_class;
			that.step = (typeof o.step == 'undefined' || o.step == null)?'10':o.step;
			that.index = (typeof o.index == 'undefined' || o.index == null)?1:o.index;
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
				that[i] = o[i];
			}
			return this;
		},
		showPage:function(index){
			var that = this;
			var as = Y.all('#'+that.pageid+' a');
			as.removeClass(that.selected_class);
			as.item(Number(index) - 1).addClass(that.selected_class);
				
			var rear = (Number(index) - 1) * that.step + 1;
			var top = (rear + that.step - 1 > that.size)?that.size:(rear + that.step - 1);
			that.nodelist.addClass('hidden');
			for(var i = rear;i<=top;i++){
				that.nodelist.item(i - 1).removeClass('hidden');
			}
			that.EventCenter.fire('pagechange',{
				rear:rear,
				top:top,
				index:index,
				step:that.step
			});

		},
		bindEvent:function(){
			var that = this;
			that.pagecon = Y.one('#'+that.pageid);
			that.pagecon.delegate('click',function(e){
				e.halt();	
				var pageNo = Number(e.target.get('innerHTML'));
				that.render({index:pageNo});
				//that.showPage(pageNo);
			},'a');
			return this;
		},

		/**
		 * 生成页码
		 */
		buildHTML:function(){
			var that = this;
			that.pagecon = Y.one('#'+that.pageid);
			for(var i = 0;i< that.pages;i++){
				that.pagecon.append(Y.Node.create('<a href="javascript:void(0);">'+Number(i+1)+'</a>'));
			}
		
		}


	};
});
