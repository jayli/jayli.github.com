YUI.namespace('Y.DateCascade');
YUI.add('datecascade',function(Y){
	Y.DateCascade = function(){
		this.init.apply(this,arguments);
	};
	Y.mix(Y.DateCascade,{
		init:function(id,config){
			var that = this;
			that.id = id;
			that.config = config?config:{};
			//设置生成日期选择器的对象
			//that.con = Y.one('#'+that.id);
			that.con = (typeof that.id == 'object') ? that.id : Y.one('#'+that.id);
			//定义每月最大天数
			that.daysInMonth = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
			that.render(that.config);
			return this;
		},
		buildParam:function(o){
			var that = this;
			//基本参数
			var o = (typeof o == 'undefined' || o == null)?{}:o;
			//初始日期
			that.defaultDate = (typeof o.defaultDate == 'undefined' || o.defaultDate == null)?that.con.get('value'):o.defaultDate;
			//初始日期是否为空
			that.__defaultNull = that.defaultDate == '' ? true : false;

			//日期范围
			that.dateStart = (typeof o.dateStart == 'undefined' || o.dateStart == null)?'1930/1/1':o.dateStart;
			that.dateEnd = (typeof o.dateEnd == 'undefined' || o.dateEnd == null)?that._Fn.getNowYear()+'/'+that._Fn.getNowMonth()+'/'+that._Fn.getNowDay():o.dateEnd; 
			//得到日期范围
			var _ds = new Date(that.dateStart),
				_de = new Date(that.dateEnd);
			that.dsYear = _ds.getFullYear();
			that.dsMonth = _ds.getMonth()+1;
			that.dsDate = _ds.getDate();
			that.deYear = _de.getFullYear();
			that.deMonth = _de.getMonth()+1;
			that.deDate = _de.getDate();

			//每一个月份相应的天数
			that.buildSelector(o);
			return this;
		},
		buildSelector:function(o){
			var that = this;
			var _id = (typeof that.id == 'object')?'dc' + parseInt(Math.random()*100):that.id;
			//删除已存容器
			if(that.box)that.box.remove();
			//隐藏日期输入框
			that.con.setStyle('display','none');
			//创建日期容器
			that.box = Y.Node.create('<span><select id="'+_id+'_selectyear"><option value="">-</option></select> 年 <select id="'+_id+'_selectmonth"><option value="">-</option></select> 月 <select id="'+_id+'_selectdate"><option value="">-</option></select> 日</span>');
			//确保输入框生成 插入至文本框后
			if(that.box == 'undefined')return;
			that._Fn.insertAfter(that.box,that.con);

			//声明年月日	
			that._Y = Y.one('#'+_id+'_selectyear');
			that._M = Y.one('#'+_id+'_selectmonth');
			that._D = Y.one('#'+_id+'_selectdate');

			//格式化输入框初始日期
			if(that.__defaultNull){
				that.nodeYear = that._Fn.getNowYear();
				that.nodeMonth = that._Fn.getNowMonth();
				that.nodeDate = that._Fn.getNowDay();
			}else{
				var nodeDate = new Date(that.defaultDate.split("-").join("/"));
				that.nodeYear = nodeDate.getFullYear(),
				that.nodeMonth = nodeDate.getMonth()+1,
				that.nodeDate = nodeDate.getDate();
			}
			//简写用
			var nodeYear = 	that.nodeYear,
				nodeMonth = that.nodeMonth,
				nodeDate = that.nodeDate;
			
			//让默认值选中
			if(!that.__defaultNull){
				//初始生成日期
				that.makeYear(nodeYear);
				that.createMonth(nodeYear,nodeMonth);
				that.createDate(nodeYear,nodeMonth,nodeDate);
				that._Y.query('option[value='+nodeYear+']')._node.selected = true;
				that._M.query('option[value='+nodeMonth+']')._node.selected = true;
				that._D.query('option[value='+nodeDate+']')._node.selected = true;
			}else{
				//初始生成日期 
				that.makeYear(nodeYear);
				that.createMonth(1,1);
				that.createDate(1,1,1);
				that._Y.one('option')._node.selected = true;
				that._M.one('option')._node.selected = true;
				that._D.one('option')._node.selected = true;
			}			
			//改变输入框
			that.updateDate();
			return this;
		},
		render:function(o){
			var that = this;
			that.parseParam(o);
			that.bindEvent();
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
		/**
		* 函数
		*/
		_Fn:{
			//当前年份
			getNowYear:function(){
				var date = new Date();
				return date.getFullYear();
			},
			//当前月份
			getNowMonth:function(){
				var date = new Date();
				return date.getMonth()+1;
			},
			//今天
			getNowDay:function(){
				var date = new Date();
				return date.getDate();
			},
			//是否闰年
			isLeapYear:function(year){ 
		　　	return (0==year%4&&((year%100!=0)||(year%400==0))); 
		　　},
			//节点之后插入
			insertAfter:function(el,con){
				var parent=con.get('parentNode');
				//parent = Y.Node.getDOMNode(parent);
				var lastchild = parent.lastChild;
				//el =  Y.Node.getDOMNode(el);
				if(lastchild == con){
					parent.appendChild(el);
				}else{
					parent.insertBefore(el,Y.Node.getDOMNode(con).nextSibling)
				}
			}
		}, 
		//注册事件
		bindEvent:function(){
			var that = this,
				nodeYear = 	that.nodeYear,
				nodeMonth = that.nodeMonth,
				nodeDate = that.nodeDate;
			//年选择
			that._Y.on('change',function(e){
				var el = e.target;
				nodeYear = el.get('value');
				if(nodeMonth=='2' && nodeDate>='29'){
					nodeDate = that._Fn.isLeapYear(nodeYear)?'29':'28';
				}
				//如果已输入月日
				var _nodeMonth = that._M.get('value');
				var _nodeDate = that._D.get('value');
				if (_nodeMonth)nodeMonth = _nodeMonth;
				if (_nodeDate)nodeDate = _nodeDate;
				that.createMonth(nodeYear,nodeMonth);
				that.createDate(nodeYear,nodeMonth,nodeDate);
				if (_nodeMonth)that._M.query('option[value='+nodeMonth+']')._node.selected = true;
				if (_nodeDate)that._D.query('option[value='+nodeDate+']')._node.selected = true;
				//如果重新选择年为空
				if(nodeYear == ''){
					that._M.query('option')._node.selected = true;
					that._D.query('option')._node.selected = true;
				}
				

				//改变输入框
				that.updateDate();
			});
			//月选择
			that._M.on('change',function(e){
				var el = e.target;
				nodeMonth = el.get('value');
				nodeDate = that._D.get('value');
				if(nodeMonth=='2' && nodeDate>='29'){
					nodeDate = that._Fn.isLeapYear(nodeYear)?'29':'28';
				}
				if(nodeMonth !== ''){
					that.createDate(nodeYear,nodeMonth,nodeDate);
					that._D.query('option[value='+nodeDate+']')._node.selected = true;
				}else{
					if(that._D.get('value')!==''){
					//debugger;
					nodeMonth = 1;	
					that.createDate(nodeYear,nodeMonth,nodeDate);
					that._M.query('option')._node.selected = true;
					}
				}

				that.updateDate();
			});
			//日选择
			that._D.on('change',function(e){
				var el = e.target;
				nodeDate = el.get('value');
				that.updateDate();
			});
			return this;
		},
		makeYear:function(nodeYear){
			var that = this;
			/**
			* 遍历生成年
			*/
			for(var i=that.deYear;i>=that.dsYear;i--){
				var option = Y.Node.create('<option value='+i+'>'+i+'</option>');
				that._Y.appendChild(option);
			}
			return this;
		},
		makeMonth:function(nodeYear,nodeMonth,min,max){
			var that = this;
			that._M.set('innerHTML','');
			var __M = Y.Node.create('<option value="">-</option>');
			that._M.append(__M);
			for(var i=min;i<=max;i++){
				var option = Y.Node.create('<option value='+i+'>'+i+'</option>');
				that._M.appendChild(option);
			}
			return this;
		},
		//生成日期下拉
		makeDate:function(nodeYear,nodeMonth,nodeDate,min,max){
			var that = this;
			that._D.set('innerHTML','');
			var __D = Y.Node.create('<option value="">-</option>');
			that._D.append(__D);
			for(var i=min;i<=max;i++){
				var option = Y.Node.create('<option value='+i+'>'+i+'</option>');
				that._D.appendChild(option);
			}
			option = null;
			return this;
		},
		updateDate:function(){
			var that = this;
			that.con.set('value',that._selectedDate());
		},
		_selectedDate:function(){
			var that = this;
			if(that._Y.get('value')=='' || that._M.get('value')=='' || that._D.get('value')==''){
				return '';
			}else{
				var __M = that._M.get('value'),
					__D = that._D.get('value');
				if (__M<10)__M = '0' + __M;
				if (__D<10)__D = '0' + __D;
				return that._Y.get('value')+'-'+__M+'-'+__D;
			}
		},
		createMonth:function(nodeYear,nodeMonth){
			var that = this;
			//控制月份的生成范围
			if(nodeYear == that.dsYear){
				var max = 12,
					min = that.dsMonth;
			}else if(nodeYear == that.deYear){
				var min = 1,
					max = that.deMonth;
			}else{
				var min=1,max=12;
			}
			that.makeMonth(nodeYear,nodeMonth,min,max);
			return this;
		},
		createDate:function(nodeYear,nodeMonth,nodeDate){
			var that = this;
			//找到当月天数
			var _j,lens;
			for (var i=0;i<=that.daysInMonth.length;i++){
				(function(n){
					if(n == nodeMonth){
						return _j = n;
					}
				})(i);
			}
			lens = that.daysInMonth[_j-1];
			if(nodeMonth==2 && that._Fn.isLeapYear(nodeYear)) lens = that.daysInMonth[_j-1] + 1;
			//开始结束日期
			if(nodeMonth=='2' && nodeDate>='29'){
				nodeDate = that._Fn.isLeapYear(nodeYear)?'29':'28';
			}
			//控制日期的生成范围
			//排除当年、日都存在时月选空时
			if(nodeYear !=='' && nodeDate !=='' && nodeMonth==''){
				nodeMonth = 1;
			}
			if(nodeYear == that.dsYear && nodeMonth == that.dsMonth){
				var min = that.dsDate,
					max = lens;
			}else if(nodeYear == that.deYear && nodeMonth == that.deMonth){
				var min = 1,
					max = that.deDate;
			}else{
				var min = 1,max = lens;
			}
			//debugger;
			that.makeDate(nodeYear,nodeMonth,nodeDate,min,max);
			return this;
		}
		
	},0,null,4);
	
},'',{requires:['node']});
