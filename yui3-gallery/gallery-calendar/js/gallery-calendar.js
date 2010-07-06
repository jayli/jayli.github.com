YUI.add('gallery-calendar', function(Y) {

//YUI.add('gallery-calendar', function (Y) {
/**
 * calendar.js
 * autohr:lijing00333@163.com jayli
 * @class Y.Calendar
 * @param { string } hook or trigger
 * @param { object } option
 * @return { object } a new calendar
 * @requires { 'node' }
 * @requires { calendar-skin-default } skin
 * 
 * Y.Calenar	
 *	info	calendar constructor
 *	useage	new Y.Calendar(id,options);
 *	param	id:{string} container id
 *	confgi	selected {date} selected date
 *			mindate:{date} min date
 *			maxdate:{date} max date
 *			popup:{boolean} pupup or not,false by default
 *			closeable:{boolean} close the calendar by select a date when popup,false by default
 *			range_select:{boolean} range select,false by default
 *			range:{start:date,end:date} default range
 *			multi_select:{number} pages,default number is 1
 *			withtime:{boolean} select date with time,false by default
 *			date:{date} default date
 *			navigator:{boolean} can jump to custom month,true by default
 *		Y.Calendar 's method
 *			init
 *			render,rewrite old params
 *			hide
 *			show
 *		
 */
YUI.namespace('Y.Calendar');
//Y.Get.css('');
Y.Calendar = function(){
	this.init.apply(this,arguments);
};
Y.mix(Y.Calendar,{
	init:function(id,config){
		var that = this;
		that.id = that.C_Id = id;
		that.buildParam(config);
		//create the container
		/*
			that.con	the container
			that.id   the id of the container or the trigger
			that.C_Id the id of the container
		*/
		if(!that.popup){
			that.con = Y.one('#'+id);
		} else {
			var trigger = Y.one('#'+id);
			that.trigger = trigger;
			that.C_Id = 'C_'+Math.random().toString().replace(/.\./i,'');
			that.con = Y.Node.create('<div id="'+that.C_Id+'"></div>');
			Y.one('body').appendChild(that.con);
			/*
			var _x = trigger.getXY()[0];
			var _y = trigger.getXY()[1]+trigger.get('region').height;
			that.con.setStyle('left',_x.toString()+'px');
			that.con.setStyle('top',_y.toString()+'px');
			*/
			that.con.setStyle('top','0px');
			that.con.setStyle('position','absolute');
			that.con.setStyle('background','white');
			that.con.setStyle('visibility','hidden');
		}
		that.buildEventCenter();
		that.render();
		that.buildEvent();
		return this;
	},
	/**
	 * create the Event Center
	 */
	buildEventCenter:function(){
		var that = this;
		var EventFactory = function(){
			this.publish("select");
			this.publish("switch");
			this.publish("rangeselect");
			this.publish("timeselect");
			this.publish("selectcomplete");
			this.publish("hide");//later
			this.publish("show");//later
		};
		Y.augment(EventFactory, Y.Event.Target);
		that.EventCenter = new EventFactory();
		return this;
	},
	/**
	 * bind callback
	 */
	on:function(type,foo){
		var that = this;
		that.EventCenter.subscribe(type,foo);
		return this;
	},
	render:function(o){
		var that = this;
		if(typeof o === 'undefined'){
			var o = {};
		}
		//var o = o || {};
		that.parseParam(o);
		that.ca = [];

		that.con.addClass('c-call clearfix multi-'+that.multi_page);
		that.con.set('innerHTML','');

		var _prev,_next;

		for(var i = 0,_oym = [that.year,that.month]; i<that.multi_page;i++){
			if(i === 0){
				_prev = true;
			}else{
				_prev = false;
				_oym = that.computeNextMonth(_oym);
			}
			if(i === (that.multi_page - 1)){
				_next = true;
			}else {
				_next = false;	
			}
			that.ca.push(new that.Call({
				year:_oym[0],
				month:_oym[1],
				prev_arrow:_prev,
				next_arrow:_next,
				withtime:that.withtime
			},that));

			that.ca[i].render();
			/*
			that.ca[i].renderUI();
			that.con.appendChild(that.ca[i].node);
			that.ca[i].buildEvent();
			*/
		}
		return this;

	},
	/**
	 * compute date,hack for chrome
	 * showdate(2,new Date) 	return the date after tomorrow
	 */
	showdate:function(n,d){
		var uom = new Date(d-0+n*86400000);
		uom = uom.getFullYear() + "/" + (uom.getMonth()+1) + "/" + uom.getDate();
		return new Date(uom);
	},
	/**
	 * create event of the calendar container
	 */
	buildEvent:function(){
		var that = this;
		if(!that.popup){
			return this;
		}
		//click on the vacant space 
		//flush event
		for(var i = 0;i<that.EV.length;i++){
			if(typeof that.EV[i] != 'undefined'){
				that.EV[i].detach();
			}
		}
		that.EV[0] = Y.Node.get('document').on('click',function(e){
			if(e.target.get('id') === that.C_Id){
				return;
			}
			var f = e.target.ancestor(function(node){
				if(node.get('id') === that.C_Id){
					return true;
				} else {
					return false;
				}
			});
			if(typeof f === 'undefined' || f === null){
				that.hide();
			}
		});
		//click the trigger
		/*
			Y.one('#'+that.id) = that.trigger
		*/
		that.EV[1] = Y.one('#'+that.id).on('click',function(e){
			e.halt();
			if(that.con.getStyle('visibility') === 'hidden'){
				that.show();
			}else{
				that.hide();
			}
		});
		return this;
	},

	/**
	 * show the calendar
	 */
	show:function(){
		var that = this;
		that.con.setStyle('visibility','');
		var _x = that.trigger.getXY()[0];
		var _y = that.trigger.getXY()[1]+that.trigger.get('region').height;
		that.con.setStyle('left',_x.toString()+'px');
		that.con.setStyle('top',_y.toString()+'px');
		return this;
	},
	/**
	 * hide the calendar
	 */
	hide:function(){
		var that = this;
		that.con.setStyle('visibility','hidden');
		return this;
	},
	/**
	 * create the params
	 */
	buildParam:function(o){
		var that = this;
		if(typeof o === 'undefined' || o === null){
			var o = {};
		}
		that.date = (typeof o.date === 'undefined' || o.date === null)?new Date():o.date;
		that.selected = (typeof o.selected === 'undefined' || o.selected === null)?that.date:o.selected;
		that.multi_page = (typeof o.multi_page === 'undefined' || o.multi_page === null)?1:o.multi_page;
		that.closeable = (typeof o.closeable === 'undefined' || o.closeable === null)?false:o.closeable;
		that.range_select = (typeof o.range_select === 'undefined' || o.range_select === null)?false:o.range_select;
		that.mindate = (typeof o.mindate === 'undefined' || o.mindate === null)?false:o.mindate;
		that.maxdate = (typeof o.maxdate === 'undefined' || o.maxdate === null)?false:o.maxdate;
		that.multi_select = (typeof o.multi_select=== 'undefined' || o.multi_select === null)?false:o.multi_select;
		that.navigator = (typeof o.navigator === 'undefined' || o.navigator === null)?true:o.navigator;
		that.arrow_left = (typeof o.arrow_left === 'undefined' || o.arrow_left === null)?false:o.arrow_left;
		that.arrow_right = (typeof o.arrow_right === 'undefined' || o.arrow_right === null)?false:o.arrow_right;
		that.popup = (typeof o.popup === 'undefined' || o.popup=== null)?false:o.popup;
		that.withtime = (typeof o.withtime === 'undefined' || o.withtime === null)?false:o.withtime;
		that.action = (typeof o.action === 'undefined' || o.action === null)?['click']:o.action;
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
	 * param filter
	 */
	parseParam:function(o){
		var that = this;
		if(typeof o === 'undefined' || o === null){
			var o = {};
		}
		for(var i in o){
			that[i] = o[i];
		}
		that.handleDate();
		return this;
	},
	/**
	 * get the days of given year & month
	 */
	getNumOfDays:function(year,month){
		return 32-new Date(year,month-1,32).getDate();
	},

	/**
	 * templetShow('<html code..>{$value}</html code>',{value:123}) = '<html code..>123</html code>'
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
			if(data != undefined && value_s != null){
				for(var i=0, m=value_s.length; i<m; i++){
					var par = value_s[i].replace(/({\$)|}/g, '');
					value = (data[par] != undefined) ? data[par] : '';
					templet = templet.replace(value_s[i], value);
				}
			}
		}
		return templet;
	},
	/**
	 * handleDate
	 */
	handleDate:function(){
		/*
		that.month
		that.year
		that.selected
		that.mindate
		that.maxdate
		*/
		var that = this;
		var date = that.date;
		that.weekday= date.getDay() + 1;//get the weekday
		that.day = date.getDate();//get the day
		that.month = date.getMonth();//get the month
		that.year = date.getFullYear();//get the year
		return this;
	},
	//get title
	getHeadStr:function(year,month){
		//return year.toString() + 'nian' + (Number(month)+1).toString() + 'month';
		return (Number(month)+1).toString() + '/' + year.toString();
	},
	//month add
	monthAdd:function(){
		var that = this;
		if(that.month === 11){
			that.year++;
			that.month = 0;
		}else{
			that.month++;
		}
		that.date = new Date(that.year.toString()+'/'+(that.month+1).toString()+'/'+that.day.toString());
		return this;
	},
	monthMinus:function(){
		var that = this;
		if(that.month === 0){
			that.year-- ;
			that.month = 11;
		}else{
			that.month--;
		}
		that.date = new Date(that.year.toString()+'/'+(that.month+1).toString()+'/'+that.day.toString());
		return this;
	},
	//get the next month
	computeNextMonth:function(a){
		var that = this;
		var _year = a[0];
		var _month = a[1];
		if(_month === 11){
			_year++;
			_month = 0;
		}else{
			_month++;
		}
		return [_year,_month];
	},
	//handle range,d: a Date
	handleRange : function(d){
		var that = this;
		if((that.range.start === null && that.range.end === null )||(that.range.start != null && that.range.end != null)){
			that.range.start = d;
			that.range.end = null;
			that.render();
		}else if(that.range.start != null && that.range.end === null){
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
	 * TimeSelector consructor
	 */
	TimeSelector:function(ft,fathor){
		//properties------------------
		this.fathor = fathor;
		this.fcon = ft.ancestor('.c-box');//cc container
		this.popupannel = this.fcon.query('.selectime');//the popup div
		if(typeof fathor._time === 'undefined'){
			fathor._time = new Date();
		}
		this.time = fathor._time;
		this.status = 's';//the status,'h','m','s'
		this.ctime = Y.Node.create('<div class="c-time">Time:<span class="h">h</span>:<span class="m">m</span>:<span class="s">s</span><!--{{arrow--><div class="cta"><button class="u"></button><button class="d"></button></div><!--arrow}}--></div>');
		this.button = Y.Node.create('<button class="ct-ok">ok</button>');
		//hours
		this.h_a = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
		//minits
		this.m_a = ['00','10','20','30','40','50'];
		//seconds
		this.s_a = ['00','10','20','30','40','50'];
				

		//interface----------------
		/**
		 * create html code of the container
		 * param: Array
		 * return: html code
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
		 * show the popup div
		 * param:the builded html code
		 */
		this.showPopup= function(instr){
			var that = this;
			this.popupannel.set('innerHTML',instr);
			this.popupannel.removeClass('hidden');
			var status = that.status;
			var _con = that.ctime;
			that.ctime.queryAll('span').removeClass('on');
			switch(status){
				case 'h':
					that.ctime.query('.h').addClass('on');
					break;
				case 'm':
					that.ctime.query('.m').addClass('on');
					break;
				case 's':
					that.ctime.query('.s').addClass('on');
					break;
			}
		};
		/**
		 * hide the popup div
		 */
		this.hidePopup= function(){
			this.popupannel.addClass('hidden');
		};
		/**
		 * render the time
		 */
		this.render = function(){
			var that = this;
			var h = that.get('h');
			var m = that.get('m');
			var s = that.get('s');
			that.fathor._time = that.time;
			that.ctime.query('.h').set('innerHTML',h);
			that.ctime.query('.m').set('innerHTML',m);
			that.ctime.query('.s').set('innerHTML',s);
			return that;
		};
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
		 */
		this.minus= function(){
			var that = this;
			var status = that.status;
			var v = that.get(status);
			v--;
			that.set(status,v);
		};
		

		
		//constructor---------
		this.init = function(){
			var that = this;
			ft.set('innerHTML','').append(that.ctime);
			ft.append(that.button);
			that.render();
			that.popupannel.on('click',function(e){
				var el = e.target;
				if(el.hasClass('x')){//close button
					that.hidePopup();
					return;
				}else if(el.hasClass('item')){//select a time value
					var v = Number(el.get('innerHTML'));
					that.set(that.status,v);
					that.hidePopup();
					return;
				}
			});
			//confirm button
			that.button.on('click',function(e){
				var d = that.fathor.dt_date;
				d.setHours(that.get('h'));
				d.setMinutes(that.get('m'));
				d.setSeconds(that.get('s'));
				that.fathor.EventCenter.fire('timeselect',d);
				if(that.fathor.popup && that.fathor.closeable){
					that.fathor.hide();
				}
			});
			//bind keybord event on ctime
			that.ctime.on('keyup',function(e){
				if(e.keyCode === 38 || e.keyCode === 37){//up or left
					e.halt();
					that.add();
				}
				if(e.keyCode === 40 || e.keyCode === 39){//down or right
					e.halt();
					that.minus();
				}
			});
			//arrow up
			that.ctime.query('.u').on('click',function(e){
				that.hidePopup();
				that.add();
			});
			//arrow down
			that.ctime.query('.d').on('click',function(e){
				that.hidePopup();
				that.minus();
			});
			//popup hours
			that.ctime.query('.h').on('click',function(e){
				var in_str = that.parseSubHtml(that.h_a);
				that.status = 'h';
				that.showPopup(in_str);
			});
			//popup minits
			that.ctime.query('.m').on('click',function(e){
				var in_str = that.parseSubHtml(that.m_a);
				that.status = 'm';
				that.showPopup(in_str);
			});
			//popup seconds
			that.ctime.query('.s').on('click',function(e){
				var in_str = that.parseSubHtml(that.s_a);
				that.status = 's';
				that.showPopup(in_str);
			});
			


		};
		this.init();


	},
	//constructor
	/**
	 * constructor of calendar pages
	 * @constructor Y.Calendar.prototype.Call
	 * @param {object} config 
	 * @param {object} fathor,ref of the Y.Calendar instance
	 * @return calendar pages
	 */
	Call:function(config,fathor){
		//propoties
		this.fathor = fathor;
		this.month = Number(config.month);
		this.year = Number(config.year);
		this.prev_arrow = config.prev_arrow;
		this.next_arrow = config.next_arrow;
		this.node = null;
		this.timmer = null;//time selector
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
						'<span>Sun</span>',
						'<span>Mon</span>',
						'<span>Tue</span>',
						'<span>Wen</span>',
						'<span>Thu</span>',
						'<span>Fri</span>',
						'<span>Sat</span>',
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
						'Time: 00:00 	&hearts;',
					'</div>',
				'</div>',
				'<div class="selectime hidden">',
				'</div>',
			'</div><!--#c-box-->'
		].join("");
		this.nav_html = [
				'<p>',
				'Month',
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
				'Year',
					'<input type="text" value="{$the_year}" onfocus="this.select()"></input>',
				'</p>',
				'<p>',
					'<button class="ok">ok</button><button class="cancel">cancel</button>',
				'</p>'
		].join("");


		//methods
		/**
		 * render calendar pages
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
			//cc.node = Y.Node.create(cc.fathor.templetShow(cc.html,_o));
			cc.fathor.con.appendChild(Y.Node.create(cc.fathor.templetShow(cc.html,_o)));
			cc.node = Y.one('#'+cc.id);
			if(cc.fathor.withtime){
				var ft = cc.node.query('.c-ft');
				ft.removeClass('hidden');
				cc.timmer = new cc.fathor.TimeSelector(ft,cc.fathor);
			}
			return this;
		};
		/**
		 * create Events of the calendar pages
		 */
		this.buildEvent = function(){
			var cc = this;
			var con = Y.one('#'+cc.id);
			//flush event
			for(var i = 0;i<cc.EV.length;i++){
				if(typeof cc.EV[i] != 'undefined'){
					cc.EV[i].detach();
				}
			}
			cc.EV[0] = con.query('div.dbd').on('click',function(e){
				e.halt();
				if(e.target.hasClass('null')){
					return;
				}
				if(e.target.hasClass('disabled')){
					return;
				}
				var selectedd = Number(e.target.get('innerHTML'));
				var d = new Date();
				d.setDate(selectedd);
				d.setMonth(cc.month);
				d.setYear(cc.year);
				//that.callback(d);
				//date of datetime
				cc.fathor.dt_date = d;
				cc.fathor.EventCenter.fire('select',d);
				if(cc.fathor.popup && cc.fathor.closeable){
					cc.fathor.hide();
				}
				if(cc.fathor.range_select){
					cc.fathor.handleRange(d);
				}
				cc.fathor.render({selected:d});
			});
			//foraword
			cc.EV[1] = con.query('a.prev').on('click',function(e){
				e.halt();
				cc.fathor.monthMinus().render();
				cc.fathor.EventCenter.fire('switch',new Date(cc.fathor.year+'/'+(cc.fathor.month+1)+'/01'));
			});
			//backword
			cc.EV[2] = con.query('a.next').on('click',function(e){
				e.halt();
				cc.fathor.monthAdd().render();
				cc.fathor.EventCenter.fire('switch',new Date(cc.fathor.year+'/'+(cc.fathor.month+1)+'/01'));
			});
			if(cc.fathor.navigator){
				cc.EV[3] = con.query('a.title').on('click',function(e){
					try{
						cc.timmer.hidePopup();
					}catch(e){}
					e.halt();	
					var setime_node = con.query('.setime');
					setime_node.set('innerHTML','');
					var in_str = cc.fathor.templetShow(cc.nav_html,{
						the_month:cc.month+1,
						the_year:cc.year
					});
					setime_node.set('innerHTML',in_str);
					setime_node.removeClass('hidden');
					con.query('input').on('keydown',function(e){
						if(e.keyCode === 38){//up
							e.target.set('value',Number(e.target.get('value'))+1);
							e.target.select();
						}
						if(e.keyCode === 40){//down
							e.target.set('value',Number(e.target.get('value'))-1);
							e.target.select();
						}
						if(e.keyCode === 13){//enter
							var _month = con.query('.setime').query('select').get('value');
							var _year  = con.query('.setime').query('input').get('value');
							cc.fathor.render({
								date:new Date(_year+'/'+_month+'/01')
							})
							cc.fathor.EventCenter.fire('switch',new Date(_year+'/'+_month+'/01'));
							con.query('.setime').addClass('hidden');
						}
					});
				});
				cc.EV[4] = con.query('.setime').on('click',function(e){
					e.halt();
					if(e.target.hasClass('ok')){
						var _month = con.query('.setime').query('select').get('value');
						var _year  = con.query('.setime').query('input').get('value');
						cc.fathor.render({
							date:new Date(_year+'/'+_month+'/01')
						})
						cc.fathor.EventCenter.fire('switch',new Date(_year+'/'+_month+'/01'));
						con.query('.setime').addClass('hidden');
					}else if(e.target.hasClass('cancel')){
						con.query('.setime').addClass('hidden');
					}
				});
			}
			return this;

		};
		/**
		 * get the calendar page node
		 */
		this.getNode = function(){
			var cc = this;
			return cc.node;
		};
		/**
		 * create the date html code
		 */
		this.createDS = function(){
			var cc = this;

			var s = '';
			var startweekday = new Date(cc.year+'/'+(cc.month+1)+'/01').getDay();//the first day of this Month
			var k = cc.fathor.getNumOfDays(cc.year,cc.month + 1) + startweekday;
			
			for(var i = 0;i< k;i++){
				//prepare data {{
				if(/532/.test(Y.UA.webkit)){//hack for chrome
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


				}else if((cc.fathor.range.start != null && cc.fathor.range.end != null) //select range
							&& (
								_td_s.getTime()>=cc.fathor.range.start.getTime() && _td_e.getTime() < cc.fathor.range.end.getTime()) ){
							
							//alert(Y.dump(_td_s.getDate()));
							
						if(i === (startweekday + (new Date()).getDate() - 1) 
							&& (new Date()).getFullYear() === cc.year 
							&& (new Date()).getMonth() === cc.month){//today
							s+='<a href="javascript:void(0);" class="range today">'+(i - startweekday + 1)+'</a>';
						}else{
							s+= '<a href="javascript:void(0);" class="range">'+(i - startweekday + 1)+'</a>';
						}

				}else if(i === (startweekday + (new Date()).getDate() - 1) 
							&& (new Date()).getFullYear() === cc.year 
							&& (new Date()).getMonth() === cc.month){//today
					s += '<a href="javascript:void(0);" class="today">'+(i - startweekday + 1)+'</a>';

				}else if(i === (startweekday + cc.fathor.selected.getDate() - 1) 
							&& cc.month === cc.fathor.selected.getMonth() 
							&& cc.year === cc.fathor.selected.getFullYear()){//selected
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
		 * render calenar page
		 */
		this.render = function(){
			var cc = this;
			cc.renderUI();
			cc.buildEvent();
			return this;
		};


	}//Call constructor over
	
},0,null,4);

//},'3.0.0',{requires:['node']});



}, '@VERSION@' ,{requires:['node']});
