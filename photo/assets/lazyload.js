/**
 * 懒加载
 * @module lazyload
 * @author huya.nzb@alibaba-inc.com
 * @date 2014-05-12
 */

!(function(S) {

	//合并属性
	function mix(r, s, o) {

		if (r && s) {
			for (var k in s) {
				if (s.hasOwnProperty(k) && (o || typeof r[k] === 'undefined')) {
					r[k] = s[k];
				}
			}
		}

		return r;
	}

	//绑定上下文
	function bind(fn, context) {
		return fn.bind ? fn.bind(context) : function() {
			fn.apply(context, arguments);
		};
	}

	/**
	 * 懒加载

	 new LazyLoad({
            nodes: '.lazyimg',
            delay: 30,
            margin: 15,
            onload: function(node) {
                node.src = node.getAttribute('lazysrc');
            }
        });

	 * @class LazyLoad
	 * @param {Object} config 见init
	 * @constructor
	 */

	function LazyLoad(config) {
		this.init.apply(this, arguments);
	}

	//添加原型方法
	mix(LazyLoad.prototype, {

		/**
		 * 初始化
		 * @method init
		 * @param {Object} config 配置参数
		 * @param {String|HTMLCollection} config.nodes 懒加载节点
		 * @param {Number|Boolean} config.delay 延时（false时不延时）
		 * @param {Number} config.margin 边距
		 * @param {Boolean} config.preciseMode 是否是精确模式，即节点必须在视窗范围内，在视窗之上不会触发
		 * @param {Boolean} config.autoDestroy 懒加载完成之后是否自动销毁
		 * @param {Function} config.onload 加载回调
		 * @public
		 */
		init: function(config) {

			//默认配置
			this._config = {
				container: window,
				nodes: [],
				delay: 30,
				margin: 15,
				onload: null,
				preciseMode: false,
				autoDestroy: true,
				useAnim: true,
				speed: '0.5s',
				loadBeforeScroll: false,
				autoReload: true,
				imgSize: false,
				useWebp: false,
				runScript: true,
				heightOnly: false
			};
			S.augment(LazyLoad, S.Event.Target);

			this.config(config);
			this.refresh();
			this.bind();
			this.check();
		},

		/**
		 * 销毁
		 * @method destroy
		 * @chainable
		 * @public
		 */
		destroy: function() {
			this.rmDetach();

			this._nodes = null;
			this._config = null;

			delete this._nodes;
			delete this._config;
			delete this._delayTimeout;
			delete this._eventCallbackBinded;

			this.destroyed = true;

			return this;
		},

		/**
		 * 配置参数
		 * @method config
		 * @param {Object} 见init
		 * @chainable
		 * @public
		 */
		config: function(config) {
			this._config = mix(this._config, config, true);
			return this;
		},

		/**
		 * 刷新懒加载节点
		 * @method refresh
		 * @chainable
		 * @public
		 */
		refresh: function() {
			var nodes = this._config.nodes;

			nodes = typeof nodes === 'string' ? document.querySelectorAll(nodes) : nodes;
			nodes = (nodes && nodes.length) ? Array.prototype.slice.call(nodes, 0) : [];

			//过滤已经loaded的
			this._nodes = nodes.filter(function(node) {
				return !node._lazyloaded;
			});

			return this;
		},

		/**
		 * 绑定事件
		 * @method bind
		 * @chainable
		 * @public
		 */
		bind: function() {

			//事件回调是否绑定上下文
			if (!this._eventCallbackBinded) {
				this._onResize = bind(this._onResize, this);
				this._onScroll = bind(this._onScroll, this);
				this._onTouchStart = bind(this._onTouchStart, this);
				this._onOrientationChange = bind(this._onOrientationChange, this);
				this._eventCallbackBinded = true;
			}

			this._config.container.addEventListener('scroll',this._onScroll, false);
			window.addEventListener('resize', this._onResize, false);
			window.addEventListener('orientationchange', this._onOrientationChange, false);
			if(this._config.loadBeforeScroll)
				window.addEventListener('touchstart',this._onTouchStart,false);

			return this;
		},

		/**
		 * 解除事件绑定
		 * @method detach
		 * @chainable
		 * @public
		 */
		rmDetach: function() {
			window.removeEventListener('resize', this._onResize, false);
			window.removeEventListener('scroll', this._onScroll, false);
			window.removeEventListener('orientationchange', this._onOrientationChange, false);
			if(this._config.loadBeforeScroll)
				window.removeEventListener('touchstart',this._onTouchStart,false);
			return this;
		},

		/**
		 * 检查元素是否在视窗内
		 * @method check
		 * @chainable
		 * @public
		 */
		check: function(tmp) {

			var that = this;

			//清除延时
			clearTimeout(this._delayTimeout);
			this._delayTimeout = null;

			//有可能有延时的回调
			//如果销毁了，则停止执行
			if (this.destroyed) { return this; }

			//var winWidth = this._config.container.offsetWidth,
			//	winHeight = this._config.container.offsetHeight,
			var winWidth = S.one(this._config.container).width(),
				winHeight = S.one(this._config.container).height(),
				config = this._config,
				margin = tmp || config.margin,
				precise = config.preciseMode,
				destroy = config.autoDestroy,
				useAnim = config.useAnim,
				autoReload = config.autoReload,
				heightOnly = config.heightOnly,
				nodes = this._nodes,
				type = this._config.type,
				i = 0,
				node, display, offset, loadable;

			while (i < nodes.length) {
				node = nodes[i++];

				if(useAnim && !node.isBind && type == 'img') {
					node.style.opacity = 0;
				}


				if(!node.isBind && type == 'img') {
					node.onload = function () {
						var self = this;
						if (useAnim) {
							//fix for 图片在红米上提前载入问题
							this.style.webkitTransition = 'opacity '+config.speed+' ease-in';
							this.style.opacity = 1;
						}
						that.fire('load',{
							node: self
						});
					};
					node.onerror = function(){
						//避免多次重复加载
						if(autoReload) {
							this.onerror = null;
							this.src = this.src;
						}
					}
				}

				node.isBind = true;


				//如果已经加载过一次，则从数组中移除
				if (node._lazyloaded) {
					nodes.splice(--i, 1);
					continue;
				}

				display = node.style.display ||  document.defaultView.getComputedStyle(node, null).getPropertyValue('display');

				//display:none时不检查
				if (display === 'none') { continue; }

				offset = node.getBoundingClientRect();

				//父元素display:none时也不检查
				if (!offset.top && !offset.bottom && !offset.left && !offset.right) { continue; }

				//普通模式节点只要在视窗之内及以上即可
				//精确模式节点必须在视窗范围内
				loadable = (winHeight + margin >= offset.top && (heightOnly || (winWidth + margin >= offset.left))) &&
					(!precise || (offset.bottom + margin >= 0 && (heightOnly || (offset.right + margin >= 0))));

				if (loadable) {
					i--;
					this.load(node);
				}
			}

			destroy && !nodes.length && this.destroy();

			return this;
		},

		load: function(node){
			var that = this;
			var index = that._nodes.indexOf(node),
				attr = that._config.attr,
				type = that._config.type,
				size = that._config.imgSize,
				useWebp = that._config.useWebp,
				runScript = that._config.runScript;


			this._nodes.splice(index, 1);
			node._lazyloaded = true;

			size && this.resize(node);

			switch(type){
				case 'img':
					if(useWebp)
						isSupportWebp(function(rs){
							node.src = rs ? that.webpReplace(node) :node.getAttribute(attr);
							node.removeAttribute(attr);
						});
					else{
						node.src = node.getAttribute(attr);
						node.removeAttribute(attr);
					}
					break;
				case 'bg':
					node.style['backgroundImage'] = 'url("' + node.getAttribute(attr) + '")';
					node.removeAttribute('lazybg');
					break;
				case 'script':
					var script = S.one(node).one('script');
					script.before(script.html().trim());
					script.remove();
					break;
				case 'textarea':
					var textarea = S.one(node).one('textarea');
					if(runScript)
						textarea.before(textarea.html().trim().replace(/&lt;/ig,'<').replace(/&gt;/ig,'>'));
					else
						textarea.before(textarea.html().trim());
					textarea.remove();
					break;
			}


			//onload && onload.call(this, node);

		},
		webpReplace: function(node){
			var attr = this._config.attr,
				lazySrc = node.getAttribute(attr),
				typeReg = /(\.jpg|\.png)$/,
				cdnReg = /taobaocdn|alicdn/ig;

			return (typeReg.test(lazySrc) && cdnReg.test(lazySrc)) ? (lazySrc+'_.webp') : lazySrc;
		},

		resize: function(node){
			var attr = this._config.attr,
				lazySrc = node.getAttribute(attr),
				size = this._config.imgSize,
				cdnReg = /taobaocdn|alicdn/ig,
				sizeReg = /\.jpg_\w*q\d{2}\w*\.jpg/ig;

			if(cdnReg.test(lazySrc) && sizeReg.test(lazySrc)){
				lazySrc = lazySrc.replace(/q\d{2}/,'q'+size);
				node.setAttribute(attr,lazySrc);
			}
		},

		/**
		 * 延时检查是否在视窗之内
		 * @method _interval
		 * @protected
		 */
		_interval: function(tmp) {
			var that = this;
			var delay = that._config.delay;

			//delay为false时不延时，delay为0时延时0ms
			if (typeof delay == 'number') {

				//前面有延时的话，则不新添加延时，保证每隔一段时间执行一次
				//类似 throttle
				!that._delayTimeout && (that._delayTimeout = setTimeout(function(){
					that.check(tmp);
				}, delay));
			} else {
				that.check(tmp);
			}
		},

		pause: function(){
			if(this.destroyed)
				return;

			this.detach();

		},

		resume: function(){
			if(this.destroyed)
				return;

			this.bind();
		},


		/**
		 * 窗口变化事件回调
		 * @method _onResize
		 * @param {Number} delay 延时时间
		 * @protected
		 */
		_onResize: function() {
			this._interval();
		},

		/**
		 * 滚动事件回调
		 * @method _onScroll
		 * @protected
		 */
		_onScroll: function() {
			this._interval();
		},

		/**
		 * 横竖屏切换事件回调
		 * @method _onOrientationChange
		 * @protected
		 */
		_onOrientationChange: function() {
			//横竖屏切换延时400ms，保证页面能够完全切换过来
			setTimeout(bind(this._interval, this), 400);
		},
		_onTouchStart: function(){
			var tmp = window.innerHeight;
			this._interval(tmp);
		}

	}, true);

	//添加航旅命名空间
	//@deprecated window.LazyLoad
	window.MT = window.MT || {};
	MT.LazyLoad = window.LazyLoad = LazyLoad;

	//helper
	function isSupportWebp(exec){
		var img = new Image(), loaded,_isSupport;
		if(window.localStorage && window.localStorage.hasOwnProperty('isSupportWebp')){
			_isSupport = localStorage.getItem('isSupportWebp') == 'true' ? true : false;
			exec(_isSupport);
			return;
		}
		img.onload = img.onerror = function () {
			if (!loaded) {
				loaded = true;
				exec(img.width === 2 && img.height === 2);
				window.localStorage && window.localStorage.setItem('isSupportWebp',img.width===2 && img.height ===2);
			}
		};
		setTimeout(function () {
			if (!loaded) {
				loaded = true;
				exec(false);
				window.localStorage && window.localStorage.setItem('isSupportWebp',false);
			}
		}, 16);
		img.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
	}

})(KISSY);

//添加KISSY支持
window.KISSY && KISSY.add(function() {
	return MT.LazyLoad;
});
