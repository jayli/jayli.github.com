/**
 * Y.Slide
 * @info http://jayli.github.com/gallery/yuislide
 * @author 拔赤/灵玉/虎牙
 * 幻灯片特效,特效默认为none,fade:渐隐,h-slide:水平切换,'v-slide':垂直切换<br/>
 * 实例话说明：new Y.Slide(id,options);
 * @module slide
 * @class Y.Slide
 * @constructor
 * @param {string} id 容器id
 * @param {object} config 初始配置项，具体参数对象如下：
 * <ul>
 * <li>autoSlide:(boolean) 是否自动播放，默认为false</li>
 * <li>speed:(float) 切换特效的速度，默认为0.5</li>
 * <li>timeout:(Number) 切换时间间隔,默认为1000毫秒</li>
 * <li>effect:(string) 特效类型，默认为'none'，取值：'none',无特效,'fade',渐隐,'h-slide',水平切换,'v-slide',垂直切换</li>
 * <li>eventype:(string) 触发tab切换的事件类型，默认为'click',取值：'click',点击，'mouseover',鼠标滑过</li>
 * <li>easing:(string) 切换面板的特效风格，默认为'easeBoth',参考YUI doc</li>
 * <li>hoverStop:(boolean) 鼠标悬停面板上是否停止播放，默认为true</li>
 * <li>selectedClass:(string) tab选中时的class name，默认为'selected'</li>
 * <li>conClass:(string) 容器的class name，默认为't-slide'，目前没有用</li>
 * <li>navClass:(string) tab容器的class name，默认为'tab-nav'</li>
 * <li>contentClass:(string) tab内容容器的class name,默认为tab-content</li>
 * <li>pannelClass:(string) tab面板的class name，默认为tab-pannel</li>
 * <li>id:(string) hook</li>
 * <li>before_switch:(function) 切换之前执行的动作，参数同switch事件的参数，返回true，继续执行，返回false，停止执行</li>
 * <li>ready:(function) 初始化完成后的回调，参数同switch事件的参数，当前index为0</li>
 * <li>carousel:(boolean) 是否以旋转木马形式播放，默认为false</li>
 * <li>touchmove:(boolean) 是否支持手指滑动，默认为false</li>
 * <li>adaptive_fixed_width:(boolean) 屏幕是否根据控件的宽度改变重新渲染尺寸，默认为false，主要在组件定宽高的场景中，保证resize时tab-pannel尺寸正确</li>
 * <li>adaptive_fixed_height:(boolean) 屏幕是否根据控件的高度改变重新渲染尺寸，默认为false,主要在组件定宽高的场景中，保证resize时tab-pannel尺寸正确</li>
 * <li>adaptive_fixed_size:(boolean) 屏幕是否根据控件的宽度和高度改变重新渲染尺寸，默认为false,主要在组件定宽高的场景中，保证resize时tab-pannel尺寸正确</li>
 * <li>adaptive_width:(function)，如果是百分比设置容器的宽度的话，需要指定这个函数，动态的得到可变化的宽度,默认为false
 * <li>reverse:(boolean) "播放下一个"和"播放上一个"对调，默认为false</li>
 * </ul>
 */
YUI.namespace('Y.Slide');
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

			if(that.reverse){
				var _t ;
				_t = that.previous,
				that.previous = that.next,
				that.next = _t;
			}

			// 在移动终端中的优化
			if(that.carousel){
				that.fix_for_transition_when_carousel();
			}

			that.fixSlideSize();

			return this;
		},
		//渲染textarea中的内容，并放在与之相邻的一个div中，若有脚本，执行其中脚本
		renderLazyData:function(textarea){
			textarea.setStyle('display','none');
			if(textarea.getAttribute('lazy-data')=='1'){
				return ;
			}
			textarea.setAttribute('lazy-data','1');
			var	id = Y.stamp(div),
				html = textarea.get('innerHTML').replace(/&lt;/ig,'<').replace(/&gt;/ig,'>'),
				div = Y.Node.create('<div>'+html+'</div>');
			textarea.insert(div,'before');

			var globalEval = function(data){
				if (data && /\S/.test(data)) {
					var head = document.getElementsByTagName('head')[0] || docElem,
						script = document.createElement('script');

					// 神奇的支持所有的浏览器
					script.text = data;

					head.insertBefore(script, head.firstChild);
					head.removeChild(script);
				}
			};

			var id = 'K_'+new Date().getTime().toString(),
				re_script = new RegExp(/<script([^>]*)>([^<]*(?:(?!<\/script>)<[^<]*)*)<\/script>/ig); // 防止过滤错误


			var hd = Y.Node.getDOMNode(Y.one('head')),
				match, attrs, srcMatch, charsetMatch,
				t, s, text,
				RE_SCRIPT_SRC = /\ssrc=(['"])(.*?)\1/i,
				RE_SCRIPT_CHARSET = /\scharset=(['"])(.*?)\1/i;

			re_script.lastIndex = 0;
			while ((match = re_script.exec(html))) {
				attrs = match[1];
				srcMatch = attrs ? attrs.match(RE_SCRIPT_SRC) : false;
				// 通过src抓取到脚本
				if (srcMatch && srcMatch[2]) {
					s = document.createElement('script');
					s.src = srcMatch[2];
					// 设置编码类型
					if ((charsetMatch = attrs.match(RE_SCRIPT_CHARSET)) && charsetMatch[2]) {
						s.charset = charsetMatch[2];
					}
					s.async = true; // hack gecko
					hd.appendChild(s);
				}
				// 如果是内联脚本
				else if ((text = match[2]) && text.length > 0) {
					globalEval(text);
				}
			}
				
		},
		// 构建事件中心
		buildEventCenter:function(){
			var that = this;
			var EventFactory = function(){
				this.publish("switch");//实际上就是before_switch
				this.publish("after_switch");//未实现
				this.publish("before_switch");//未实现
			};
			Y.augment(EventFactory, Y.Event.Target);
			that.EventCenter = new EventFactory();
			return this;
		},
		// 绑定函数 
		on:function(type,foo){
			var that = this;
			that.EventCenter.subscribe(type,foo);
			return this;
		},
		//构建html结构
		construct: function() {
            var that = this;
			var con = that.con = Y.one('#' + that.id);
            that.tabs = con.all('.' + that.navClass + ' li');
            var tmp_pannels = con.all('.' + that.contentClass + ' div.' + that.pannelClass);
            that.length = tmp_pannels.size();
            if (that.tabs.size() == 0) {
                //nav.li没有指定，默认指定1234
                var t_con = con.all('.' + that.navClass);
				var t_str = '';
                for (var i = 0; i < that.length; i++) {
                    var t_str_prefix = '';
                    if (i == 0) {
                        t_str_prefix = that.selectedClass;
                    }
                    t_str += '<li class="' + t_str_prefix + '"><a href="javascript:void(0);">' + (i + 1) + '</a></li>';
                }
                t_con.set('innerHTML', t_str);
            }
            that.tabs = con.all('.' + that.navClass + ' li');//重新赋值
            that.animcon = con.one('.' + that.contentClass);
            that.animwrap = null;
            if (that.effect == 'none') {
                that.pannels = con.all('.' + that.contentClass + ' div.' + that.pannelClass);
				//that.pannels.addClass('hidden');
				that.pannels.setStyles({
					display:'none'	
				});
				//that.pannels.item(that.defaultTab).removeClass('hidden');
				that.pannels.item(that.defaultTab).setStyles({
					'display':'block'	
				});
            } else if (that.effect == 'v-slide') {
                that.animwrap = Y.Node.create('<div style="position:absolute;"></div>');
                that.animwrap.set('innerHTML', that.animcon.get('innerHTML'));
                that.animcon.set('innerHTML', '');
                that.animcon.appendChild(that.animwrap);
                that.pannels = con.all('.' + that.contentClass + ' div.' + that.pannelClass);
                //统一容器和item的宽高及选中默认值
                var animconRegion = that.animcon.get('region');
                that.pannels.setStyles({
                    'float': 'none',
                    'overflow': 'hidden'
                });
                that.animwrap.setStyles({
                    'height': that.length * animconRegion.height + 'px',
                    'overflow': 'hidden',
                    'top': -1 * that.defaultTab * animconRegion.height + 'px'
                });
            } else if (that.effect == 'h-slide') {
                that.animwrap = Y.Node.create('<div style="position:absolute;"></div>');
                that.animwrap.set('innerHTML', that.animcon.get('innerHTML'));
                that.animcon.set('innerHTML', '');
                that.animcon.appendChild(that.animwrap);
                that.pannels = con.all('.' + that.contentClass + ' div.' + that.pannelClass);
                //统一容器和item的宽高及选中默认值
                var animconRegion = that.animcon.get('region');
                that.pannels.setStyles({
                    'float': 'left',
                    'overflow': 'hidden'
                });
                that.animwrap.setStyles({
                    'width': that.length * animconRegion.width + 'px',
                    'overflow': 'hidden',
                    'left': -1 * that.defaultTab * animconRegion.width + 'px'
                });
            } else if (that.effect == 'fade') {
                that.pannels = con.all('.' + that.contentClass + ' div.' + that.pannelClass);
                that.pannels.setStyles({
                    'position': 'absolute',
                    'zIndex': 0
                });
                that.pannels.each(function(node, i){
                    if (i == that.defaultTab) {
                        //node.removeClass('hidden');
                        node.setStyles({
							'opacity': 1,
							'display': 'block'
						});
                    } else {
                        //node.addClass('hidden');
                        node.setStyles({
							'opacity':0,
							'diaplay':'none'	
						});
                    }
                });
            }
			that.fixSlideSize(that.current_tab);
            //添加选中的class
			that.hightlightNav(that.getWrappedIndex(that.current_tab));
            //是否自动播放
            if (that.autoSlide == true) {
                that.play();
            }
            return this;
        },


		// 重新渲染slide内页(pannels)的宽度
		renderWidth:function(){
			var that = this;
			//有可能animcon没有定义宽度
			var width = that.animcon.get('region').width;
			that.pannels.setStyles({
				width:width + 'px'
			});
			return this;
		},
		
		//重新渲染slide内页(pannels)的高度
		renderHeight :function(){
			var that = this;
			//有可能animcon没有定义高度
			var height = that.animcon.get('region').height;
			that.pannels.setStyles({
				height:height + 'px'
			});
			return this;
		},

		//当当前帧的位置不正确时，重新定位当前帧到正确的位置,无动画
		relocateCurrentTab:function(){
			var that = this;
			var index = that.current_tab;
			if(that.effect != 'h-slide'){
				return;
			}

			if(that.transitions){
				that.animwrap.setStyles({
					'-webkit-transition-duration': '0s',
					'-webkit-transform':'translate3d('+(-1 * index * that.animcon.get('region').width)+'px,0,0)'
				});
			}else{
				that.animwrap.setStyles({
					left: -1 * index * that.animcon.get('region').width
					
				});
			}
			return this;
		},

		//根据配置条件修正控件尺寸
		// 重新渲染slide的尺寸，
		// 根据goto到的index索引值渲染当前需要的长度和宽度
		fixSlideSize:function(index){
			var that = this;
			if(that.adaptive_fixed_width){
				that.renderWidth();
			}
			if(that.adaptive_fixed_height){
				that.renderHeight();
			}
			if(that.adaptive_fixed_size){
				that.renderHeight().renderWidth();
			}
			that.resetSlideSize(index);
			return this;
		},

		//在before_switch和windowResize的时候执行，根据spec_width是否指定，来决定是否重置页面中的适配出来的宽度和高度并赋值
		// index是goto的目标tab-pannel的索引
		// 这个函数主要针对横向滚动时各个pannel高度不定的情况
		resetSlideSize:function(index){
			var that = this;
			if(typeof index == 'undefined' || index == null){
				index = that.current_tab;
			}
			// 如果没有开关，或者没有滑动特效，则退出函数，不支持垂直滑动的情况
			if(that.effect != 'h-slide'){
				return;
			}
			//var width = that.spec_width();
			
			var width = that.adaptive_width ? 
									that.adaptive_width():
									that.animcon.get('region').width;


			// pannels的高度是不定的，高度是根据内容
			// 来撑开的因此不能设置高度，而宽度则需要设置
			that.pannels.setStyles({
				width:width+'px',
				display:'block'
			});
			var height = that.pannels.item(index).get('region').height;
			that.animcon.setStyles({
				width:width+'px',
				height:height+'px',
				//强制pannel的内容不超过动画容器的范围
				overflow:'hidden'
			});
			return this;
		},

		// 得到tabnav应当显示的当前index索引，0,1,2,3...
		getWrappedIndex:function(index){
			var that = this,wrappedIndex = 0;

			if(index == 0){
				//debugger;
			}
			if(that.carousel){
				if(index == 0){
					wrappedIndex = that.length - 3;
				}else if(index == that.length - 1){
					wrappedIndex = 0;
				}else {
					wrappedIndex = index - 1;
				}
			}else{
				wrappedIndex = index;
			}
			return wrappedIndex;
		},


		// 绑定默认事件
		bindEvent:function(){
			var that = this;
			if(that.eventype == 'click' || that.eventype == 'mouseover'){
				that.con.delegate(that.eventype,function(e){
					e.halt();
					var ti = Number(that.tabs.indexOf(e.currentTarget));
					if(that.carousel){
						ti = (ti + 1) % that.length;
					}
					that.goto(ti);
					//if(that.autoSlide)that.stop().play();
				},'.'+that.navClass+' li');
			}

			// 是否支持鼠标悬停停止播放
			if(that.hoverStop){
				that.con.delegate('mouseover',function(e){
					//e.halt();
					if(that.autoSlide)that.stop();
				},'.'+that.contentClass+' div.'+that.pannelClass);
				that.con.delegate('mouseout',function(e){
					//e.halt();
					if(that.autoSlide)that.play();
				},'.'+that.contentClass+' div.'+that.pannelClass);
			}

			// 绑定窗口resize事件 
			Y.on('resize',function(e){
				that.fixSlideSize(that.current_tab);
				that.relocateCurrentTab();
			},window);

			//终端事件触屏事件绑定
			if ('ontouchstart' in document.documentElement) {

				that.con.delegate('touchstart',function(e){
					that.stop();
					that.touching = true;
					if(that.is_last() && that.carousel){
						that.fix_next_carousel();
					}
					if(that.is_first() && that.carousel){
						that.fix_pre_carousel();
					}
					that.startX = e._event.changedTouches[0].clientX;
					that.startY = e._event.changedTouches[0].clientY;
					that.animwrap.setStyles({
						'-webkit-transition-duration': '0s'
					});
					that.startT = Number(new Date());//如果快速手滑，则掠过touchmove，因此需要计算时间
				},'.tab-content'); 

				that.con.delegate('touchend',function(e){
					that.touching = false;
					var endX  = e._event.changedTouches[0].clientX;
					var width = Number(that.animcon.get('region').width);
					that.deltaX = Math.abs(endX - that.startX);//滑过的距离
					var swipeleft = (Math.abs(endX) < Math.abs(that.startX));//是否是向左滑动
					var swiperight = !swipeleft;
					//判断是否在边界反滑动，true，出现了反滑动，false，正常滑动
					var anti = that.carousel ? false : ( that.is_last() && swipeleft || that.is_first() && swiperight );


					//复位
					var reset = function(){
						that.animwrap.setStyles({
							'-webkit-transition-duration': (Number(that.speed) / 2) + 's',
							'-webkit-transform':'translate3d('+(-1 * that.current_tab * that.animcon.get('region').width)+'px,0,0)'
						});
					};

					//根据手势走向上一个或下一个
					var goswipe = function(){
						if(swipeleft){//下一帧
							that.next();
						}else{//上一帧
							that.previous();
						}
					};

					//如果检测到是上下滑动，则复位并return
					if(that.isScrolling){
						reset();
						return;
					}

					//如果滑动物理距离太小，则复位并return
					//这个是避免将不精确的点击误认为是滑动
					if(that.touchmove && that.deltaX < 20){
						reset();
						return;
					}


					if(		!anti && (
								// 支持touchmove，跑马灯效果，任意帧，touchmove足够的距离
								( that.touchmove && (that.deltaX > width / 3) ) ||
								// 不支持touchmove，跑马灯
								( !that.touchmove && that.carousel ) ||
								// 正常tab，支持touchmove，横向切换
								( !that.carousel && that.touchmove && that.effect == 'h-slide' ) || 
								// 不支持touchmove，不支持跑马灯
								( !that.touchmove && !that.carousel) ||
								//快速手滑
								( Number(new Date()) - that.startT < 550 )
							)
						
						){

							//根据根据手滑方向翻到上一页和下一页
							goswipe();

					}else{
						//复位
						reset();
					}

					if(that.autoSlide){
						that.play();
					}
				},'.tab-content');


				//处理手指滑动事件相关
				if(that.touchmove){

					that.con.delegate('touchmove',function(e){
						// 确保单手指滑动，而不是多点触碰
						if(e._event.touches.length > 1 ) return;

						//deltaX > 0 ，右移，deltaX < 0 左移
						that.deltaX = e._event.touches[0].pageX - that.startX; 

						//判断是否在边界反滑动，true，出现了反滑动，false，正常滑动
						var anti = ( that.is_last() && that.deltaX < 0 || that.is_first() && that.deltaX > 0 );

						if(!that.carousel && that.effect == 'h-slide' && anti){
							that.deltaX = that.deltaX / 2; //如果是边界反滑动，则增加阻尼效果
						}

						// 判断是否需要上下滑动页面
						that.isScrolling = ( Math.abs(that.deltaX) < Math.abs(e._event.touches[0].pageY - that.startY) ) ? true: false;

						if(!that.isScrolling){
							// 阻止默认上下滑动事件
							e.halt();

							that.stop();
							var width = Number(that.animcon.get('region').width);
							var dic = that.deltaX - that.current_tab * width;

							// 立即跟随移动
							that.animwrap.setStyles({
								'-webkit-transition-duration': '0s',
								'-webkit-transform':'translate3d('+dic+'px,0,0)'
							});

						}
						
					},'.tab-content'); 
					//that.animwrap.on('webkitTransitionEnd',that.onTransitionEnd'); 
				}

			}

			return this;

		},
		//正交运动
		quadraturemotion:function(){


		},
		// 构建参数列表
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
			that.carousel = (typeof o.carousel == 'undefined' || o.carousel == null)?false:o.carousel;
			that.reverse = (typeof o.reverse == 'undefined' || o.reverse == null)?false:o.reverse;
			that.touchmove = (typeof o.touchmove == 'undefined' || o.touchmove == null)?false:o.touchmove;
			that.adaptive_fixed_width = (typeof o.adaptive_fixed_width == 'undefined' || o.adaptive_fixed_width == null)?false:o.adaptive_fixed_width;
			that.adaptive_fixed_height = (typeof o.adaptive_fixed_height == 'undefined' || o.adaptive_fixed_height == null)?false:o.adaptive_fixed_height;
			that.adaptive_fixed_size = (typeof o.adaptive_fixed_size == 'undefined' || o.adaptive_fixed_size == null)?false:o.adaptive_fixed_size;
			that.adaptive_width = (typeof o.adaptive_width == 'undefined' || o.adaptive_width == null)?false:o.adaptive_width;
			that.id = that.id;
			//构造参数
			that.tabs = [];
			that.animcon = null;
			that.pannels = [];
			that.timer = null;
			that.touching = false;
			//默认选中的tab，默认值为0，添加默认选中的功能
			//modified by huya
            that.defaultTab = (typeof o.defaultTab == 'undefined' || o.defaultTab == null) ? 0 : Number(o.defaultTab) - 1;//隐藏所有pannel
			// 如果是跑马灯，则不考虑默认选中的功能，一律定位在第一页,且只能是左右切换的不支持上下切换
			if(that.carousel){
				that.defaultTab = 1;//跑马灯显示的是真实的第二项
				that.effect = 'h-slide';
			}
			that.current_tab = that.defaultTab;//0,1,2,3...

			//判断是否开启了内置动画
			that.transitions = "webkitTransition" in document.body.style;

            return this;
			
		},
		//针对移动终端的跑马灯的hack
		fix_for_transition_when_carousel: function(){
			var that = this;
			var con = that.con = Y.one('#' + that.id);
            that.animcon = that.con.one('.' + that.contentClass);
			that.animwrap = that.animcon.one('div');
			that.pannels = con.all('.' + that.contentClass + ' div.' + that.pannelClass);
			var width = Number(that.animcon.get('region').width);
			var height = Number(that.animcon.get('region').height);
			if(that.effect == 'h-slide'){
				that.animwrap.setStyle('width',that.pannels.size() * width + 2 * width);
				var first = that.pannels.item(0).cloneNode(true);
				var last = that.pannels.item(that.pannels.size()-1).cloneNode(true);
				that.animwrap.append(first);
				that.animwrap.prepend(last);
				if(that.transitions){
					//这步操作会手持终端中造成一次闪烁,待解决
					that.animwrap.setStyles({
						'-webkit-transition-duration': '0s',
						'-webkit-transform':'translate3d('+(-1 * width)+'px,0,0)',
						'left':'0'
					});
				}else {
					that.animwrap.setStyle('left',-1 * width);
				}
			}
			//重新获取重组之后的tabs
			that.pannels = con.all('.' + that.contentClass + ' div.' + that.pannelClass);
			that.length += 2;

		},

		//上一个
		previous:function(){
			var that = this;
			//防止旋转木马状态下切换过快带来的晃眼
			try{
				if(that.anim.get('running') && that.carousel){
					return this;
				}
			}catch(e){}
			var _index = that.current_tab+that.length-1;
			if(_index >= that.length){
				_index = _index % that.length;
			}
			if(that.carousel){

				if(that.is_first()){
					that.fix_pre_carousel();
					arguments.callee.call(that);
					return this;

				}
			}
			that.goto(_index);
			return this;
		},
		//判断当前tab是否是最后一个
		is_last:function(){
			var that = this;
			if(that.current_tab == (that.length - 1)){
				return true;
			}else{
				return false;
			}
		},
		//判断当前tab是否是第一个
		is_first:function(){
			var that = this;
			if(that.current_tab == 0){
				return true;
			}else{
				return false;
			}
		},
		//下一个
		next:function(){
			var that = this;
			//防止旋转木马状态下切换过快带来的晃眼
			try{
				if(that.anim.get('running') && that.carousel){
					return this;
				}
			}catch(e){}
			var _index = that.current_tab+1;
			if(_index >= that.length){
				_index = _index % that.length;
			}
			if(that.carousel){
				
				if(that.is_last()){
					that.fix_next_carousel();
					arguments.callee.call(that);
					return this;

				}

			}
			that.goto(_index);
			return this;
		},
		// 修正跑马灯结尾的滚动位置
		fix_next_carousel:function(){
			var that = this;

			that.current_tab = 1;
			var con = that.con = Y.one('#'+that.id);
			if(that.effect != 'none'){
				that.pannels = con.all('.'+that.contentClass+' div.'+that.pannelClass);
			}

			//目标offset，'-234px'
			var dic = '-' + Number(that.animcon.get('region').width).toString()+'px';

			if(that.effect == 'h-slide'){

				if(that.transitions){
					that.animwrap.setStyles({
						'-webkit-transition-duration': '0s',
						'-webkit-transform':'translate3d('+dic+',0,0)'
					});

				}else{
					that.animwrap.setStyle('left',dic);
				}
			}else if (that.effect == 'v-slide'){
				// 暂不支持纵向跑马灯的滚动

			}


			return;

		},

		// 修正跑马灯开始的滚动位置
		fix_pre_carousel:function(){
			var that = this;

			that.current_tab = that.length - 2;
			var con = that.con = Y.one('#'+that.id);
			if(that.effect != 'none'){
				that.pannels = con.all('.'+that.contentClass+' div.'+that.pannelClass);
			}
			// 目标offset,是一个字符串 '-23px'
			var dic = '-' + (Number(that.animcon.get('region').width) * (that.length - 2)).toString() + 'px';

			if(that.effect == 'h-slide'){
				if(that.transitions){
					that.animwrap.setStyles({
						'-webkit-transition-duration': '0s',
						'-webkit-transform':'translate3d('+dic +',0,0)'
					});

				}else{
					that.animwrap.setStyle('left',dic);
				}
			}else if (that.effect == 'v-slide'){
				//竖向滚动暂时未实现

			}

			return;

		},
		//高亮显示第index(0,1,2,3...)个nav
		hightlightNav:function(index){
			var that = this;
            that.tabs.removeClass(that.selectedClass);
            that.tabs.item(index).addClass(that.selectedClass);
			return this;
		},
		//切换至index,这里的index为真实的索引
		switch_to:function(index){
			var that = this;
			//首先高亮显示tab
			that.hightlightNav(that.getWrappedIndex(index));
			that.fixSlideSize(index);
			if(that.autoSlide){
				that.stop().play();
			}
            if (index >= that.length) {
                index = index % that.length;
            }
            if (index == that.current_tab) {
                return this;
            }
            if (that.effect == 'none') {
                //that.pannels.addClass('hidden');
				that.pannels.setStyles({
					'display':'none'	
				});
                //that.pannels.item(index).removeClass('hidden');
                that.pannels.item(index).setStyles({
					'display':'block'	
				});
            }
            else if (that.effect == 'v-slide') {
                if (that.anim) {
                    try {
                        that.anim.stop();
                        //fix IE6下内存泄露的问题，仅支持3.2.0及3.3.0,3.1.0及3.0.0需修改Y.Anim的代码
						//modified by huya
                        that.anim.destroy();
                        that.anim = null;
                    } catch (e) {}
                }

				if(that.transitions){
					that.animwrap.setStyles({
						'-webkit-transition-duration': that.speed + 's',
						'-webkit-transform':'translate3d(0,'+(-1 * index * that.animcon.get('region').height)+'px,0)'
					});
				}else {
					that.anim = new Y.Anim({
						node: that.animwrap,
						to: {
							top: -1 * index * that.animcon.get('region').height
						},
						easing: that.easing,
						duration: that.speed
					});
					that.anim.run();
				}
            } else if (that.effect == 'h-slide') {
                if (that.anim) {
                    try {
                        that.anim.stop();
                        that.anim.destroy();
                        that.anim = null;
                    } catch (e) {}
                }
				

				if(that.transitions){
					that.animwrap.setStyles({
						'-webkit-transition-duration': that.speed + 's',
						'-webkit-transform':'translate3d('+(-1 * index * that.animcon.get('region').width)+'px,0,0)'
					});
				}else{

					that.anim = new Y.Anim({
						node: that.animwrap,
						to: {
							left: -1 * index * that.animcon.get('region').width
						},
						easing: that.easing,
						duration: that.speed
					});
					that.anim.run();

				}
            } else if (that.effect == 'fade') {
				//重写fade效果逻辑
				//modified by huya
                var _curr = that.current_tab;
                if (that.anim) {
                    try {
                        that.anim.stop();
                        that.anim.destroy();
                        that.anim = null;
                    } catch (e) {}
                }
                that.anim = new Y.Anim({
                    node: that.pannels.item(index),
                    to: {
                        opacity: 1
                    },
                    easing: that.easing,
                    duration: that.speed
                });
                that.anim.on('start', function(){
                    //that.pannels.item(index).removeClass('hidden');
                    that.pannels.item(index).setStyles({
						'display':'block'	
					});
                    that.pannels.item(index).setStyle('opacity', 0);
                    that.pannels.item(_curr).setStyle('zIndex', 1);
                    that.pannels.item(index).setStyle('zIndex', 2);
                });
                that.anim.on('end', function(){
                    that.pannels.item(_curr).setStyle('zIndex', 0);
                    that.pannels.item(index).setStyle('zIndex', 1);
                    that.pannels.item(_curr).setStyle('opacity', 0);
                    //that.pannels.item(_curr).addClass('hidden');
                    that.pannels.item(_curr).setStyles({
						'display':'none'	
					});
                });
                that.anim.run();
            }
            that.current_tab = index;
            that.EventCenter.fire('switch', {
                index: index,
                navnode: that.tabs.item(that.getWrappedIndex(index)),
                pannelnode: that.pannels.item(index)
            });
			//延迟执行的脚本
			var scriptsArea = that.pannels.item(index).all('.lazyload');
			if(scriptsArea){
				scriptsArea.each(function(node,i){
					that.renderLazyData(node);
					//that.pannels.item(index).append(node.get('value'));
				});
				//scriptsArea.remove();
			}
		},
		//去往任意一个,0,1,2,3...
		"goto":function(index){
			var that = this;
			if(that.before_switch({
				index:index,
				navnode:that.tabs.item(index),
				pannelnode:that.pannels.item(index)
			}) == false){
				return;
			}
			//发生goto的时候首先判断是否需要整理空间的长宽尺寸
			//that.renderSize(index);
			that.switch_to(index);
		},
		//自动播放
		play:function(){
			var that = this;
			if(that.timer != null)clearTimeout(that.timer);
			that.timer = setTimeout(function(){
				that.next().play();
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

/*
 * TODO
 * 	1，测试各个情况的工装状况
 *
 * */
