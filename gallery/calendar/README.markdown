# Calendar

- [Demo](http://taobao-wd.github.com/calendar/demo/calendar.html)

# Info

-	基于YUI3/YUI2
-	支持基本的事件：单选、范围选择、弹出、嵌入等等
-	根据ID建议，将选择时间的功能去掉了
-	理论上，可以日历中的子日历可以有生成无数个，但超过3个的情况需要自定义css：增加class为“multi-2”的样式。
-	日历阴影用css3来定义，在opera和ie下日历无阴影
-	在chrome中，日期不支持诸如new Date('2009/12/35')的天溢出，在调试浏览器的时候应当注意
-	在ie6,ie7,firefox2,firefox3.0/3.5/3.6,safari4.0,opera9.62,chrome3.0下测试通过

引入文件

	modules:{
		'calendar-skin-default':{//默认皮肤
			fullpath:'skin/default.css',
			type:'css'
		},
		'calendar':{
			fullpath:'calendar.js',
			requires:['calendar-skin-default','node']
		}
	}


新建一个Y.Calendar对象

	var calendar = new Y.Calendar('J_multipage_1',{
		multi_page:2,
		selected:new Date('2009/12/28')
	});

创建一个Y.Calendar,带入配置项并绑定回调
	var calendar = new Y.Calendar('J_calendar').on('select',function(d){
		//your code
	});


使用

	new Y.Calendar(id,options);
	
参数

	/**
	 * calendar.js 
	 * autohr:lijing00333@163.com
	 * @class Y.Calendar
	 * @param { string } 容器或者触点id 
	 * @param { object } 配置项
	 * @return { object } 生成一个calendar实例
	 * @requires { 'node' }
	 * @requires { calendar-skin-default } 皮肤
	 * 
	 * Y.Calenar：	
	 *	说明：	日历构造器，通过new Y.Calendar来render一个日历
	 *	使用：	new Y.Calendar(id,options);
	 *	参数:	id:{string}容器id
	 *	配置：	selected {date} 选中的日期
	 *			mindate:{date} 最小可选日期
	 *			maxdate:{date} 最大可选日期
	 *			popup:{boolean} 是否弹出，默认false
	 *			closeable:{boolean} 是否单选关闭（弹出状态下起作用），默认为false
	 *			range_select:{boolean} 是否选择范围，默认为false
	 *			range:{start:date,end:date} 默认选择范围
	 *			multi_select:{number} 日历页数，默认为1
	 *			withtime:{boolean} 日历是否显示time选择，默认为false
	 *			date:{date} 默认显示该日期所在的月份，默认为当天
	 *			startDay:{number} 起始日的偏移，默认为周日，建议取值范围(1-7)
	 *			navigator:{boolean} 是否可以选择跳转的月份，默认为true
	 *			useShim:{boolean} 是否使用iframe遮罩,ie6默认加遮罩
	 *		Y.Calendar的实例的方法：
	 *			init:初始化，参数为options
	 *			render:渲染，init在new的时候调用，render可以在运行时任意时刻调用，参数为options，其成员可覆盖原参数
	 *			hide:隐藏，不会删除窗口
	 *			show:显示窗口
	 *		
	 */

事件类型：

-	switch:月份的切换，回调为切换后的日期
-	select:单选
-	rangeselect:范围选择
-	timeselect:时间选择
-	show:显示
-	hide:隐藏
			
