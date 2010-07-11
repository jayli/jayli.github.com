YUI().namespace('Y.Slide');
YUI.add('slide',function(Y){
	Slide = function(){
		this.init.apply(this,arguments);
	};
	Y.mix(Slide,{
		init:function(id,config){
			var that = this;
			that.id = id;
			//接受参数
			that.buildParam(config);
			//构建事件中心
			that.buildEventCenter();
			//构造函数
			that.construct();
			//绑定事件
			that.bindEvent();

			//执行ready
			that.ready({
				index:0,
				navnode:that.tabs.item(0),
				pannelnode:that.pannels.item(0)
			});

			return this;
		},
		/**
		 * 事件中心
		 */
		buildEventCenter:function(){
			var that = this;
			var EventFactory = function(){
				this.publish("switch");
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
		construct:function(){
			var that = this;
			var con = that.con = Y.one('#'+that.id);
			that.tabs = con.queryAll('.'+that.navClass+' li');
			that.length = that.tabs.size();
			that.animcon = con.query('.'+that.contentClass);
			//that.pannels.setStyle('width',that.animcon.get('region').width+'px');
			//that.pannels.setStyle('height',that.animcon.get('region').height+'px');
			that.animwrap = null;
			if(that.effect == 'none'){
				that.pannels = con.queryAll('.'+that.contentClass+' div.'+that.pannelClass);
			}else if(that.effect == 'v-slide'){
				that.animwrap = Y.Node.create('<div style="position:absolute;"></div>');
				that.animwrap.set('innerHTML',that.animcon.get('innerHTML'));
				that.animcon.set('innerHTML','');
				that.animcon.appendChild(that.animwrap);
				that.pannels = con.queryAll('.'+that.contentClass+' div.'+that.pannelClass);
				//统一容器和item的宽高
				that.pannels.setStyle('width',that.animcon.get('region').width+'px');
				that.pannels.setStyle('height',that.animcon.get('region').height+'px');
				that.pannels.setStyle('float','none');
				that.pannels.setStyle('overflow','hidden');
				that.animwrap.setStyle('height',(that.length*that.animcon.get('region').height)+'px');
				that.animwrap.setStyle('overflow','hidden');
			}else if(that.effect == 'h-slide'){
				that.animwrap = Y.Node.create('<div style="position:absolute;"></div>');
				that.animwrap.set('innerHTML',that.animcon.get('innerHTML'));
				that.animcon.set('innerHTML','');
				that.animcon.appendChild(that.animwrap);
				that.pannels = con.queryAll('.'+that.contentClass+' div.'+that.pannelClass);
				//统一容器和item的宽高
				that.pannels.setStyle('width',that.animcon.get('region').width+'px');
				that.pannels.setStyle('height',that.animcon.get('region').height+'px');
				that.pannels.setStyle('float','left');
				that.pannels.setStyle('overflow','hidden');
				that.animwrap.setStyle('width',(that.length*that.animcon.get('region').width)+'px');
				that.animwrap.setStyle('overflow','hidden');
			}else if(that.effect == 'fade'){
				that.pannels = con.queryAll('.'+that.contentClass+' div.'+that.pannelClass);
				that.pannels.each(function(node,i){
					if(i == 0){
						node.removeClass('hidden');
					}else {
						node.addClass('hidden');
					}
				});
			}
			//是否自动播放
			if(that.autoSlide == true){
				that.play();
			}else {
				that.goto(0);
			}

			/*
			that.tabs.removeClass('selected');
			that.tabs.item(0).addClass('selected');
			*/
			return this;

		},

		bindEvent:function(){
			var that = this;
			if(that.eventype == 'click' || that.eventype == 'mouseover'){
				that.con.delegate(that.eventype,function(e){
					e.halt();
					that.goto(Number(that.tabs.indexOf(e.currentTarget)));
					if(that.autoSlide)that.stop().play();
				},'.'+that.navClass+' li');
			}
			if(that.hoverStop){
				that.con.delegate('mouseover',function(e){
					e.halt();
					if(that.autoSlide)that.stop();
				},'.'+that.contentClass+' div.'+that.pannelClass);
				that.con.delegate('mouseout',function(e){
					e.halt();
					if(that.autoSlide)that.play();
				},'.'+that.contentClass+' div.'+that.pannelClass);
			}
			return this;

		},
		buildParam:function(o){
			var that = this;
			//基本参数
			var o = (typeof o == 'undefined' || o == null)?{}:o;
			that.autoSlide = (typeof o.autoSlide == 'undefined' || o.autoSlide == null)?false:o.autoSlide;
			that.speed = (typeof o.speed == 'undefined' || o.speed == null)?0.5:o.speed;
			that.timeout = (typeof o.timeout == 'undefined' || o.timeout == null)?1000:o.timeout;
			that.effect = (typeof o.effect == 'undefined' || o.effect == null)?'none':o.effect;
			that.eventype = (typeof o.eventype == 'undefined' || o.eventype == null)?'click':o.eventype;
			that.easing = (typeof o.easing == 'undefined' || o.easing == null)?'easeBoth':o.easing;
			that.hoverStop = (typeof o.hoverStop== 'undefined' || o.hoverStop == null)?true:o.hoverStop;
			that.selectedClass = (typeof o.selectedClass == 'undefined' || o.selectedClass == null)?'selected':o.selectedClass;
			that.conClass = (typeof o.conClass == 'undefined' || o.conClass == null)?'t-slide':o.conClass;
			that.navClass = (typeof o.navClass == 'undefined' || o.navClass == null)?'tab-nav':o.navClass;
			that.contentClass = (typeof o.contentClass == 'undefined' || o.contentClass == null)?'tab-content':o.contentClass;
			that.pannelClass = (typeof o.pannelClass == 'undefined' || o.pannelClass == null)?'tab-pannel':o.pannelClass;
			that.before_switch = (typeof o.before_switch== 'undefined' || o.before_switch == null)?new Function:o.before_switch;
			that.ready = (typeof o.ready == 'undefined' || o.ready == null)?new Function:o.ready;
			that.id = that.id;
			//构造参数
			that.tabs = [];
			that.animcon = null;
			that.pannels = [];
			that.timer = null;
			//第一次载入的时候赋值为-1
			that.current_tab = -1;//0,1,2,3...
			return this;
			
		},
		//接口函数
		//上一个
		previous:function(){
			var that = this;
			var _index = that.current_tab+that.length-1;
			if(_index >= that.length){
				_index = _index % that.length;
			}
			that.goto(_index);
			return this;
		},
		//下一个
		next:function(){
			var that = this;
			var _index = that.current_tab+1;
			if(_index >= that.length){
				_index = _index % that.length;
			}
			that.goto(_index);
			return this;
		},
		//切换至index
		switch_to:function(index){
			var that = this;
			if(index >= that.length){
				index = index % that.length;
			}
			if(index == that.current_tab){
				return this;
			}
			if(that.effect == 'none'){
				that.pannels.addClass('hidden');
				that.pannels.item(index).removeClass('hidden');
			}else if(that.effect == 'v-slide'){
				if(that.current_tab == -1){
					that.current_tab = index;
					return this;//首次初始化
				}
				try{
					that.anim.stop();
				}catch(e){}
					
				that.anim = new Y.Anim({
					node:that.animwrap,
					to:{
						top:-1*index*that.animcon.get('region').height
					},
					easing:that.easing,
					duration:that.speed
				});
				if(that.autoSlide){
					that.stop();
				}
				that.anim.on('end',function(){
					if(that.autoSlide){
						that.play();
					}
				});
				that.anim.run();

			}else if(that.effect == 'h-slide'){
				if(that.current_tab == -1){
					that.current_tab = index;
					return this;//首次初始化
				}
				try{
					that.anim.stop();
				}catch(e){}
					
				that.anim = new Y.Anim({
					node:that.animwrap,
					to:{
						left:-1*index*that.animcon.get('region').width
					},
					easing:that.easing,
					duration:that.speed
				});
				if(that.autoSlide){
					that.stop();
				}
				that.anim.on('end',function(){
					if(that.autoSlide){
						that.play();
					}
				});
				that.anim.run();

			}else if(that.effect == 'fade'){
				if(that.current_tab == -1){
					that.current_tab = index;
					return this;//首次初始化
				}
				try{
					that.anim.stop();
				}catch(e){}
					
				that.anim = new Y.Anim({
					node:that.pannels.item(that.current_tab),
					to:{
						opacity:0
					},
					easing:that.easing,
					duration:that.speed
				});
				that.anim_2 = new Y.Anim({
					node:that.pannels.item(index),
					to:{
						opacity:1
					},
					easing:that.easing,
					duration:that.speed
				});
				var _curr = that.current_tab;
				that.anim.on('end',function(){
					that.pannels.item(_curr).addClass('hidden');
					that.pannels.item(index).setStyle('opacity',0);
					that.pannels.item(index).removeClass('hidden');
					that.anim_2.run();
				});
				if(that.autoSlide){
					that.stop();
				}
				that.anim_2.on('end',function(){
					if(that.autoSlide){
						that.play();
					}
				});
				that.anim.run();
			}
			that.tabs.removeClass(that.selectedClass);
			that.tabs.item(index).addClass(that.selectedClass);
			that.current_tab = index;
			that.EventCenter.fire('switch',{
				index:index,
				navnode:that.tabs.item(index),
				pannelnode:that.pannels.item(index)
			});
		},
		//去往任意一个,0,1,2,3...
		goto:function(index){
			var that = this;
			if(that.before_switch({
				index:index,
				navnode:that.tabs.item(index),
				pannelnode:that.pannels.item(index)
			}) == false){
				return;
			}
			that.switch_to(index);
		},
		//自动播放
		play:function(){
			var that = this;
			if(that.timer != null)clearTimeout(that.timer);
			that.timer = setTimeout(function(){
				that.next();
				that.timer = setTimeout(arguments.callee,Number(that.timeout));	
			},Number(that.timeout));
			return this;
		},
		//停止自动播放
		stop:function(){
			var that = this;
			clearTimeout(that.timer);
			that.timer = null;
			return this;
		}

	},0,null,4);

	Y.Slide = Slide;
	
},'',{requires:['node','anim']});
