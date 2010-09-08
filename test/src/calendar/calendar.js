

/*
	yyyy-mm-dd
	YY-mm-dd
	YY年mm月dd日
*/

KISSY.add('calendar',function(S){

	S.namespace('S.Calendar');

	S.Calendar = function(){
		this.init.apply(this,arguments);
	};
	S.mix(S.Calendar.prototype,{
		init:function(id,config){
			var that = this;
			that.id = that.C_Id = id;
			that.buildParam(config);
			//形成con
			/*
				that.con，日历的容器
				that.id   传进来的id
				that.C_Id 永远代表日历容器的ID
			*/
			if(!that.popup){
				that.con = S.one('#'+id);
			} else {
				var trigger = S.one('#'+id);
				that.trigger = trigger;
				that.C_Id = 'C_'+Math.random().toString().replace(/.\./i,'');
				//that.con = Y.Node.create('<div id="'+that.C_Id+'"></div>');
				that.con = S.Node('<div id="'+that.C_Id+'"></div>');
				S.one('body').append(that.con);
				that.con.css({
					'top':'0px',
					'position':'absolute',
					'background':'white',
					'visibility':'hidden'
				});
			}
			that.buildEventCenter();
			that.render();
			that.buildEvent();
			return this;
		},
		/**
		 * 日历的事件中心
		 */
		buildEventCenter:function(){
			var that = this;
			var EventFactory = function(){
				/*
				this.publish("select");
				this.publish("switch");
				this.publish("rangeselect");
				this.publish("timeselect");
				this.publish("selectcomplete");
				this.publish("hide");//later
				this.publish("show");//later
				*/
			};
			S.augment(EventFactory, S.EventTarget);

			//Y.augment(EventFactory, Y.Event.Target);
			that.EventCenter = new EventFactory();
			return this;
		},
		/**
		 * 绑定函数 
		 */
		on:function(type,foo){
			var that = this;
			that.EventCenter.on(type,foo);
			return this;
		},
		render:function(o){
			var that = this;
			var o = o || {};
			that.parseParam(o);
			that.ca = [];

			that.con.addClass('c-call clearfix multi-'+that.multi_page);
			that.con.html('');

			for(var i = 0,_oym = [that.year,that.month]; i<that.multi_page;i++){
				if(i == 0){
					var _prev = true;
				}else{
					var _prev = false;
					_oym = that.computeNextMonth(_oym);
				}
				if(i == (that.multi_page - 1)){
					var _next = true;
				}else {
					var _next = false;	
				}
				that.ca.push(new that.Call({
					year:_oym[0],
					month:_oym[1],
					prev_arrow:_prev,
					next_arrow:_next,
					withtime:that.withtime
				},that));

					
				that.ca[i].render();
			}
			return this;

		},
		/**
		 * 计算d天的前几天或者后几天，返回date
		 */
		showdate:function(n,d){
			var uom = new Date(d-0+n*86400000);
			uom = uom.getFullYear() + "/" + (uom.getMonth()+1) + "/" + uom.getDate();
			return new Date(uom);
		},
		/**
		 * 创建日历外框的事件
		 */
		buildEvent:function(){
			var that = this;
			if(!that.popup)return this;
			//点击空白
			//flush event
			for(var i = 0;i<that.EV.length;i++){
				if(typeof that.EV[i] != 'undefined'){
					that.EV[i].detach();
				}
			}
			//TODO 为什么S.one('document')得不到document？
			that.EV[0] = S.one('body').on('click',function(e){
				//TODO 为什么e.target是裸的DOM节点?
				e.target = S.Node(e.target);
				//点击到日历上
				if(e.target.attr('id') == that.C_Id)return;
				if((e.target.hasClass('next')||e.target.hasClass('prev'))
					&& e.target[0].tagName == 'A')	return;
				//点击在trigger上
				if(e.target.attr('id') == that.id)return;
				//TODO node如何向上查找节点
				//var f = e.target.parent('#'+that.C_Id);
				if(!S.DOM.contains(S.one('#'+that.C_Id),e.target)){
				//if(typeof f == 'undefined' || f == null){
					that.hide();
				}
			});
			//点击触点
			/*
				Y.one('#'+that.id) = that.trigger
			*/
			for(var i = 0;i<that.action.length;i++){
				
				that.EV[1] = S.one('#'+that.id).on(that.action[i],function(e){
					//e.halt();
					//TODO event
					//e.stopPropagation();
					e.target = S.Node(e.target);
					e.preventDefault();
					//如果focus和click同时存在的hack
					S.log(e.type);
					var a = that.action;
					if(that.inArray('click',a) && that.inArray('focus',a)){//同时含有
						if(e.type == 'focus'){
							that.toggle();
						}
					}else if(that.inArray('click',a) && !that.inArray('focus',a)){//只有click
						if(e.type == 'click'){
							that.toggle();
						}
					}else if(!that.inArray('click',a) && that.inArray('focus',a)){//只有focus
						setTimeout(function(){//为了跳过document.onclick事件
							that.toggle();
						},170);
					}else {
						that.toggle();
					}
						
				});

			}
			return this;
		},
		toggle:function(){
			var that = this;
			if(that.con.css('visibility') == 'hidden'){
				that.show();
			}else{
				that.hide();
			}
		},

		inArray : function(v, a){
			var o = false;
			for(var i=0,m=a.length; i<m; i++){
				if(a[i] == v){
					o = true;
					break;
				}
			}
			return o;
		},

		/**
		 * 显示 
		 */
		show:function(){
			var that = this;
			that.con.css('visibility','');
			//var _x = that.trigger.getXY()[0];
			var _x = that.trigger.offset().left;
			//var _y = that.trigger.getXY()[1]+that.trigger.get('region').height;
			var height = that.trigger[0].offsetHeight || that.trigger.height();
			var _y = that.trigger.offset().top+height;
			that.con.css('left',_x.toString()+'px');
			that.con.css('top',_y.toString()+'px');
			return this;
		},
		/**
		 * 隐藏 
		 */
		hide:function(){
			var that = this;
			that.con.css('visibility','hidden');
			return this;
		},
		/**
		 * 创建参数列表
		 */
		buildParam:function(o){
			var that = this;
			if(typeof o == 'undefined' || o == null){
				var o = {};
			}
			that.date = (typeof o.date == 'undefined' || o.date == null)?new Date():o.date;
			that.selected = (typeof o.selected == 'undefined' || o.selected == null)?that.date:o.selected;
			that.start_day = (typeof o.start_day == 'undefined' || o.start_day == null)?(7-7):(7-o.start_day)%7;//1,2,3,4,5,6,7
			that.multi_page = (typeof o.multi_page == 'undefined' || o.multi_page == null)?1:o.multi_page;
			that.closeable = (typeof o.closeable == 'undefined' || o.closeable == null)?false:o.closeable;
			that.range_select = (typeof o.range_select == 'undefined' || o.range_select == null)?false:o.range_select;
			that.mindate = (typeof o.mindate == 'undefined' || o.mindate == null)?false:o.mindate;
			that.maxdate = (typeof o.maxdate == 'undefined' || o.maxdate == null)?false:o.maxdate;
			that.multi_select = (typeof o.multi_select== 'undefined' || o.multi_select == null)?false:o.multi_select;
			that.navigator = (typeof o.navigator == 'undefined' || o.navigator == null)?true:o.navigator;
			that.arrow_left = (typeof o.arrow_left == 'undefined' || o.arrow_left == null)?false:o.arrow_left;
			that.arrow_right = (typeof o.arrow_right == 'undefined' || o.arrow_right == null)?false:o.arrow_right;
			that.popup = (typeof o.popup == 'undefined' || o.popup== null)?false:o.popup;
			that.withtime = (typeof o.withtime == 'undefined' || o.withtime == null)?false:o.withtime;
			that.action = (typeof o.action == 'undefined' || o.action == null)?['click']:o.action;
			if(typeof o.range != 'undefined' && o.range != null){
				var s = that.showdate(1,new Date(o.range.start.getFullYear()+'/'+(o.range.start.getMonth()+1)+'/'+(o.range.start.getDate())));
				var e = that.showdate(1,new Date(o.range.end.getFullYear()+'/'+(o.range.end.getMonth()+1)+'/'+(o.range.end.getDate())));
				that.range = {
					start:s,
					end:e
				};
				//alert(Y.dump(that.range));
			}else {
				that.range = {
					start:null,
					end:null
				};
			}
			that.EV = [];
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
			that.handleDate();
			return this;
		},
		/**
		 * 得到某月有多少天,需要给定年来判断闰年
		 */
		getNumOfDays:function(year,month){
			return 32-new Date(year,month-1,32).getDate();
		},

		/**
		 * 模板函数，应当在base中 
		 */
		templetShow : function(templet, data){
			var that = this;
			if(data instanceof Array){
				var str_in = '';
				for(var i = 0;i<data.length;i++){
					str_in += that.templetShow(templet,data[i]);
				}
				templet = str_in;
			}else{
				var value_s = templet.match(/{\$(.*?)}/g);
				if(data !== undefined && value_s != null){
					for(var i=0, m=value_s.length; i<m; i++){
						var par = value_s[i].replace(/({\$)|}/g, '');
						value = (data[par] !== undefined) ? data[par] : '';
						templet = templet.replace(value_s[i], value);
					}
				}
			}
			return templet;
		},
		/**
		 * 处理日期
		 */
		handleDate:function(){
			var that = this;
			var date = that.date;
			that.weekday= date.getDay() + 1;//星期几 //指定日期是星期几
			that.day = date.getDate();//几号
			that.month = date.getMonth();//月份
			that.year = date.getFullYear();//年份
			return this;
		},
		//get标题
		getHeadStr:function(year,month){
			return year.toString() + '年' + (Number(month)+1).toString() + '月';
		},
		//月加
		monthAdd:function(){
			var that = this;
			if(that.month == 11){
				that.year++;
				that.month = 0;
			}else{
				that.month++;
			}
			that.date = new Date(that.year.toString()+'/'+(that.month+1).toString()+'/'+that.day.toString());
			return this;
		},
		//月减
		monthMinus:function(){
			var that = this;
			if(that.month == 0){
				that.year-- ;
				that.month = 11;
			}else{
				that.month--;
			}
			that.date = new Date(that.year.toString()+'/'+(that.month+1).toString()+'/'+that.day.toString());
			return this;
		},
		//裸算下一个月的年月,[2009,11],年:fullYear，月:从0开始计数
		computeNextMonth:function(a){
			var that = this;
			var _year = a[0];
			var _month = a[1];
			if(_month == 11){
				_year++;
				_month = 0;
			}else{
				_month++;
			}
			return [_year,_month];
		},
		//处理箭头
		handleArrow:function(){

		},
		//得到范围
		getRange:function(){

		},
		//得到当前选中
		getSelect:function(){

		},
		//处理日期的偏移量
		handleOffset:function(){
			var that = this;
				data= ['日','一','二','三','四','五','六'],
				temp = '<span>{$day}</span>',
				offset = that.start_day,
				day_html = '',
				a = [];
			for(var i = 0;i<7;i++){
				a[i] = {
					day:data[(i-offset+7)%7]
				};
			}
			day_html = that.templetShow(temp,a);


			return {
				
				day_html:day_html

			};


		},
		//处理起始日期,d:Date类型
		handleRange : function(d){
			var that = this;
			if((that.range.start == null && that.range.end == null )||(that.range.start != null && that.range.end != null)){
				that.range.start = d;
				that.range.end = null;
				that.render();
			}else if(that.range.start != null && that.range.end == null){
				that.range.end = d;
				if(that.range.start.getTime() > that.range.end.getTime()){
					var __t = that.range.start;
					that.range.start = that.range.end;
					that.range.end = __t;
				}
				that.EventCenter.fire('rangeselect',that.range);
				that.render();
			}
			return this;
		},
		//constructor 
		/**
		 * TimeSelector只支持选择，不支持初始化
		 */
		TimeSelector:function(ft,fathor){
			//属性------------------
			this.fathor = fathor;
			//this.fcon = ft.ancestor('.c-box');//cc容器
			this.fcon = ft.parent('.c-box');
			this.popupannel = this.fcon.one('.selectime');//点选时间的弹出层
			//this.popupannel = S.query('.selectime',this.fcon);
			if(typeof fathor._time == 'undefined'){//确保初始值和当前时间一致
				fathor._time = new Date();
			}
			this.time = fathor._time;
			this.status = 's';//当前选择的状态，'h','m','s'依次判断更新哪个值
			this.ctime = S.Node('<div class="c-time">时间：<span class="h">h</span>:<span class="m">m</span>:<span class="s">s</span><!--{{arrow--><div class="cta"><button class="u"></button><button class="d"></button></div><!--arrow}}--></div>');
			this.button = S.Node('<button class="ct-ok">确定</button>');
			//小时
			this.h_a = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
			//分钟
			this.m_a = ['00','10','20','30','40','50'];
			//秒
			this.s_a = ['00','10','20','30','40','50'];
					

			//接口----------------
			/**
			 * 创建相应的容器html，值均包含在a中
			 * 参数：要拼装的数组
			 * 返回：拼好的innerHTML,结尾还要带一个关闭的a
			 * 
			 */
			this.parseSubHtml = function(a){
				var in_str = '';
				for(var i = 0;i<a.length;i++){
					in_str += '<a href="javascript:void(0);" class="item">'+a[i]+'</a>';
				}
				in_str += '<a href="javascript:void(0);" class="x">x</a>';
				return in_str;
			};
			/**
			 * 显示selectime容器
			 * 参数，构造好的innerHTML
			 */
			this.showPopup= function(instr){
				var that = this;
				this.popupannel.html(instr);
				this.popupannel.removeClass('hidden');
				var status = that.status;
				var _con = that.ctime;
				that.ctime.all('span').removeClass('on');
				switch(status){
					case 'h':
						that.ctime.all('.h').addClass('on');
						break;
					case 'm':
						that.ctime.all('.m').addClass('on');
						break;
					case 's':
						that.ctime.all('.s').addClass('on');
						break;
				}
			};
			/**
			 * 隐藏selectime容器
			 */
			this.hidePopup= function(){
				this.popupannel.addClass('hidden');
			};
			/**
			 * 不对其做更多的上下文假设，仅仅根据time显示出来
			 */
			this.render = function(){
				var that = this;
				var h = that.get('h');
				var m = that.get('m');
				var s = that.get('s');
				that.fathor._time = that.time;
				that.ctime.all('.h').html(h);
				that.ctime.all('.m').html(m);
				that.ctime.all('.s').html(s);
				return that;
			};
			//这里的set和get都只是对time的操作，并不对上下文做过多假设
			/**
			 * set(status,v)
			 * h:2,'2'
			 */
			this.set = function(status,v){
				var that = this;
				var v = Number(v);
				switch(status){
					case 'h':
						that.time.setHours(v);
						break;
					case 'm':
						that.time.setMinutes(v);
						break;
					case 's':
						that.time.setSeconds(v);
						break;
				}
				that.render();
			};
			/**
			 * get(status)
			 */
			this.get = function(status){
				var that = this;
				var time = that.time;
				switch(status){
					case 'h':
						return time.getHours();
						break;
					case 'm':
						return time.getMinutes();
						break;
					case 's':
						return time.getSeconds();
						break;
				}
			};

			/**
			 * add()
			 * 状态值代表的变量增1
			 */
			this.add = function(){
				var that = this;
				var status = that.status;
				var v = that.get(status);
				v++;
				that.set(status,v);
			};
			/**
			 * minus()
			 * 状态值代表的变量增1
			 */
			this.minus= function(){
				var that = this;
				var status = that.status;
				var v = that.get(status);
				v--;
				that.set(status,v);
			};
			

			
			//构造---------
			this.init = function(){
				var that = this;
				ft.html('').append(that.ctime);
				ft.append(that.button);
				that.render();
				that.popupannel.on('click',function(e){
					var el = S.Node(e.target);
					if(el.hasClass('x')){//关闭
						that.hidePopup();
						return;
					}else if(el.hasClass('item')){//点选一个值
						var v = Number(el.html());
						that.set(that.status,v);
						that.hidePopup();
						return;
					}
				});
				//确定的动作
				that.button.on('click',function(e){
					//初始化读取父框的date
					var d = typeof that.fathor.dt_date == 'undefined'?that.fathor.date:that.fathor.dt_date;
					d.setHours(that.get('h'));
					d.setMinutes(that.get('m'));
					d.setSeconds(that.get('s'));
					that.fathor.EventCenter.fire('timeselect',{
						date:d	
					});
					if(that.fathor.popup && that.fathor.closeable){
						that.fathor.hide();
					}
				});
				//ctime上的键盘事件，上下键，左右键的监听
				//改成基于KISSY后没反应
				//TODO 考虑是否去掉,
				that.ctime.on('keyup',function(e){
					S.log(e.keyCode);
					if(e.keyCode == 38 || e.keyCode == 37){//up or left
						//e.halt();
						e.preventDefault();
						//e.stopPropagation();
						that.add();
					}
					if(e.keyCode == 40 || e.keyCode == 39){//down or right
						//e.stopPropagation();
						e.preventDefault();
						that.minus();
					}
				});
				//上的箭头动作
				that.ctime.one('.u').on('click',function(e){
					that.hidePopup();
					that.add();
				});
				//下的箭头动作
				that.ctime.one('.d').on('click',function(e){
					that.hidePopup();
					that.minus();
				});
				//弹出选择小时
				that.ctime.one('.h').on('click',function(e){
					var in_str = that.parseSubHtml(that.h_a);
					that.status = 'h';
					that.showPopup(in_str);
				});
				//弹出选择分钟
				that.ctime.one('.m').on('click',function(e){
					var in_str = that.parseSubHtml(that.m_a);
					that.status = 'm';
					that.showPopup(in_str);
				});
				//弹出选择秒
				that.ctime.one('.s').on('click',function(e){
					var in_str = that.parseSubHtml(that.s_a);
					that.status = 's';
					that.showPopup(in_str);
				});
				


			};
			this.init();


		},
		//constructor
		/**
		 * 子日历构造器
		 * @constructor Y.Calendar.prototype.Call
		 * @param {object} config ,参数列表，需要指定子日历所需的年月
		 * @param {object} fathor,指向Y.Calendar实例的指针，需要共享父框的参数
		 * @return 子日历的实例
		 */
		Call:function(config,fathor){
			//属性
			this.fathor = fathor;
			this.month = Number(config.month);
			this.year = Number(config.year);
			this.prev_arrow = config.prev_arrow;
			this.next_arrow = config.next_arrow;
			this.node = null;
			this.timmer = null;//时间选择的实例
			this.id = '';
			this.EV = [];
			this.html = [
				'<div class="c-box" id="{$id}">',
					'<div class="c-hd">', 
						'<a href="javascript:void(0);" class="prev {$prev}"><</a>',
						'<a href="javascript:void(0);" class="title">{$title}</a>',
						'<a href="javascript:void(0);" class="next {$next}">></a>',
					'</div>',
					'<div class="c-bd">',
						'<div class="whd">',
						/*
							'<span>日</span>',
							'<span>一</span>',
							'<span>二</span>',
							'<span>三</span>',
							'<span>四</span>',
							'<span>五</span>',
							'<span>六</span>',
						*/
							fathor.handleOffset().day_html,
						'</div>',
						'<div class="dbd clearfix">',
							'{$ds}',
							/*
							<a href="" class="null">1</a>
							<a href="" class="disabled">3</a>
							<a href="" class="selected">1</a>
							<a href="" class="today">1</a>
							<a href="">1</a>
						*/
						'</div>',
					'</div>',
					'<div class="setime hidden">',
					'</div>',
					'<div class="c-ft {$showtime}">',
						'<div class="c-time">',
							'时间：00:00 	&hearts;',
						'</div>',
					'</div>',
					'<div class="selectime hidden"><!--用以存放点选时间的一些关键值-->',
					'</div>',
				'</div><!--#c-box-->'
			].join("");
			this.nav_html = [
					'<p>',
					'月',
						'<select value="{$the_month}">',
							'<option class="m1" value="1">01</option>',
							'<option class="m2" value="2">02</option>',
							'<option class="m3" value="3">03</option>',
							'<option class="m4" value="4">04</option>',
							'<option class="m5" value="5">05</option>',
							'<option class="m6" value="6">06</option>',
							'<option class="m7" value="7">07</option>',
							'<option class="m8" value="8">08</option>',
							'<option class="m9" value="9">09</option>',
							'<option class="m10" value="10">10</option>',
							'<option class="m11" value="11">11</option>',
							'<option class="m12" value="12">12</option>',
						'</select>',
					'</p>',
					'<p>',
					'年',
						'<input type="text" value="{$the_year}" onfocus="this.select()"></input>',
					'</p>',
					'<p>',
						'<button class="ok">确定</button><button class="cancel">取消</button>',
					'</p>'
			].join("");


			//方法
			//常用的数据格式的验证
			this.Verify = function(){

				var isDay = function(n){
					if(typeof n != 'number'){
						return false;
					}
					if(n < 1 || n > 31){
						return false;
					}
					return true;

				};
				var isYear = function(n){
					if(typeof n != 'number'){
						return false;
					}
					if(n < 100 || n > 10000){
						return false;
					}
					return true;
				};
				var isMonth = function(n){
					if(typeof n != 'number'){
						return false;
					}
					if(n < 1 || n > 12){
						return false;
					}
					return true;

				};

				return {
					isDay:isDay,
					isYear:isYear,
					isMonth:isMonth

				};


			};

			/**
			 * 渲染子日历的UI
			 */
			this.renderUI = function(){
				var cc = this;
				cc.HTML = '';
				var _o = {};
				_o.prev = '';
				_o.next = '';
				_o.title = '';
				_o.ds = '';
				if(!cc.prev_arrow){
					_o.prev = 'hidden';
				}
				if(!cc.next_arrow){
					_o.next = 'hidden';
				}
				if(!cc.fathor.showtime){
					_o.showtime = 'hidden';
				}
				_o.id = cc.id = 'cc-'+Math.random().toString().replace(/.\./i,'');
				_o.title = cc.fathor.getHeadStr(cc.year,cc.month);
				cc.createDS();
				_o.ds = cc.ds;
				//TODO append之后可以得到cc.fathor.con.html()，但在UI上并没有渲染
				cc.fathor.con.append(cc.fathor.templetShow(cc.html,_o));
				//document.getElementById(cc.fathor.C_Id).innerHTML += cc.fathor.templetShow(cc.html,_o);
				//在popup的时候，这里的cc.node没有得到
				cc.node = S.one('#'+cc.id);
				if(cc.fathor.withtime){
					var ft = cc.node.one('.c-ft');
					ft.removeClass('hidden');
					cc.timmer = new cc.fathor.TimeSelector(ft,cc.fathor);
				}
				return this;
			};
			/**
			 * 创建子日历的事件
			 */
			this.buildEvent = function(){
				var cc = this;
				var con = S.one('#'+cc.id);
				//flush event
				for(var i = 0;i<cc.EV.length;i++){
					if(typeof cc.EV[i] != 'undefined'){
						cc.EV[i].detach();
					}
				}

				cc.EV[0] = con.one('div.dbd').on('click',function(e){
					e.preventDefault();
					e.target = S.Node(e.target);
					if(e.target.hasClass('null'))return;
					if(e.target.hasClass('disabled'))return;
					var selectedd = Number(e.target.html());
					var d = new Date();
					d.setDate(selectedd);
					d.setMonth(cc.month);
					d.setYear(cc.year);
					//that.callback(d);
					//datetime的date
					cc.fathor.dt_date = d;
					cc.fathor.EventCenter.fire('select',{
						date:d
					});
					if(cc.fathor.popup && cc.fathor.closeable){
						cc.fathor.hide();
					}
					if(cc.fathor.range_select){
						cc.fathor.handleRange(d);
					}
					cc.fathor.render({selected:d});
				});
				//向前
				cc.EV[1] = con.one('a.prev').on('click',function(e){
					e.preventDefault();
					cc.fathor.monthMinus().render();
					cc.fathor.EventCenter.fire('switch',{
						date:new Date(cc.fathor.year+'/'+(cc.fathor.month+1)+'/01')
					});

				});
				//向后
				cc.EV[2] = con.one('a.next').on('click',function(e){
					e.preventDefault();
					cc.fathor.monthAdd().render();
					cc.fathor.EventCenter.fire('switch',{
						date:new Date(cc.fathor.year+'/'+(cc.fathor.month+1)+'/01')
					});
				});
				if(cc.fathor.navigator){
					cc.EV[3] = con.one('a.title').on('click',function(e){
						try{
							cc.timmer.hidePopup();
							e.preventDefault();
						}catch(e){}
						e.target = S.Node(e.target);
						var setime_node = con.one('.setime');
						setime_node.html('');
						var in_str = cc.fathor.templetShow(cc.nav_html,{
							the_month:cc.month+1,
							the_year:cc.year
						});
						setime_node.html(in_str);
						setime_node.removeClass('hidden');
						con.one('input').on('keydown',function(e){
							e.target = S.Node(e.target);
							if(e.keyCode == 38){//up
								//e.target.set('value',Number(e.target.get('value'))+1);
								e.target.val(Number(e.target.val())+1);
								//TODO e.target.select如何调用
								e.target[0].select();//TODO 是不是存在select
							}
							if(e.keyCode == 40){//down
								e.target.val(Number(e.target.val())-1);
								e.target[0].select();//TODO 是不是存在select
							}
							if(e.keyCode == 13){//enter
								var _month = con.one('.setime').one('select').val();
								var _year  = con.one('.setime').one('input').val();
								con.one('.setime').addClass('hidden');
								if(!cc.Verify().isYear(_year))return;
								if(!cc.Verify().isMonth(_month))return;
								cc.fathor.render({
									date:new Date(_year+'/'+_month+'/01')
								})
								cc.fathor.EventCenter.fire('switch',{
									date:new Date(_year+'/'+_month+'/01')
								});
							}
						});
					});
					cc.EV[4] = con.one('.setime').on('click',function(e){
						e.preventDefault();
						e.target = S.Node(e.target);
						if(e.target.hasClass('ok')){
							var _month = con.one('.setime').one('select').val();
							var _year  = con.one('.setime').one('input').val();
							con.one('.setime').addClass('hidden');
							//TODO
							if(!cc.Verify().isYear(_year))return;
							if(!cc.Verify().isMonth(_month))return;
							cc.fathor.render({
								date:new Date(_year+'/'+_month+'/01')
							})
							cc.fathor.EventCenter.fire('switch',{
								date:new Date(_year+'/'+_month+'/01')
							});
						}else if(e.target.hasClass('cancel')){
							con.one('.setime').addClass('hidden');
						}
					});
				}
				return this;

			};
			/**
			 * 得到当前子日历的node引用
			 */
			this.getNode = function(){
				var cc = this;
				return cc.node;
			};
			/**
			 * 生成日期的html
			 */
			this.createDS = function(){
				var cc = this;

				var s = '';
				var startweekday = (new Date(cc.year+'/'+(cc.month+1)+'/01').getDay() + cc.fathor.start_day + 7)%7;//当月第一天是星期几
				var k = cc.fathor.getNumOfDays(cc.year,cc.month + 1) + startweekday;
				
				for(var i = 0;i< k;i++){
					//prepare data {{
					if(/532/.test(S.UA.webkit)){//hack for chrome
						var _td_s = new Date(cc.year+'/'+Number(cc.month+1)+'/'+(i+1-startweekday).toString());
					}else {
						var _td_s = new Date(cc.year+'/'+Number(cc.month+1)+'/'+(i+2-startweekday).toString());
					}
					var _td_e = new Date(cc.year+'/'+Number(cc.month+1)+'/'+(i+1-startweekday).toString());
					//prepare data }}
					if(i < startweekday){//null
						s += '<a href="javascript:void(0);" class="null">0</a>';
					}else if( cc.fathor.mindate instanceof Date
								&& new Date(cc.year+'/'+(cc.month+1)+'/'+(i+2-startweekday)).getTime() < (cc.fathor.mindate.getTime()+1)  ){//disabled
						s+= '<a href="javascript:void(0);" class="disabled">'+(i - startweekday + 1)+'</a>';
						
					}else if(cc.fathor.maxdate instanceof Date
								&& new Date(cc.year+'/'+(cc.month+1)+'/'+(i+1-startweekday)).getTime() > cc.fathor.maxdate.getTime()  ){//disabled
						s+= '<a href="javascript:void(0);" class="disabled">'+(i - startweekday + 1)+'</a>';


					}else if((cc.fathor.range.start != null && cc.fathor.range.end != null) //日期选择范围
								&& (
									_td_s.getTime()>=cc.fathor.range.start.getTime() && _td_e.getTime() < cc.fathor.range.end.getTime()) ){
								
								//alert(Y.dump(_td_s.getDate()));
								
							if(i == (startweekday + (new Date()).getDate() - 1) 
								&& (new Date()).getFullYear() == cc.year 
								&& (new Date()).getMonth() == cc.month){//今天并被选择
								s+='<a href="javascript:void(0);" class="range today">'+(i - startweekday + 1)+'</a>';
							}else{
								s+= '<a href="javascript:void(0);" class="range">'+(i - startweekday + 1)+'</a>';
							}

					}else if(i == (startweekday + (new Date()).getDate() - 1) 
								&& (new Date()).getFullYear() == cc.year 
								&& (new Date()).getMonth() == cc.month){//today
						s += '<a href="javascript:void(0);" class="today">'+(i - startweekday + 1)+'</a>';

					}else if(i == (startweekday + cc.fathor.selected.getDate() - 1) 
								&& cc.month == cc.fathor.selected.getMonth() 
								&& cc.year == cc.fathor.selected.getFullYear()){//selected
						s += '<a href="javascript:void(0);" class="selected">'+(i - startweekday + 1)+'</a>';
					}else{//other
						s += '<a href="javascript:void(0);">'+(i - startweekday + 1)+'</a>';
					}
				}
				if(k%7 != 0){
					for(var i = 0;i<(7-k%7);i++){
						s += '<a href="javascript:void(0);" class="null">0</a>';
					}
				}
				cc.ds = s;
				return this;
			};
			/**
			 * 渲染 
			 */
			this.render = function(){
				var cc = this;
				cc.renderUI();
				cc.buildEvent();
				return this;
			};


		}//Call constructor over
		
	});//prototype over

	
	
	
});

