/*
   Cubee分页控件
   kongyan@taobao.com
 */
YUI.namespace('Y.Pagination');
YUI.add('pagination', function (Y) {
    var Lang = Y.Lang,
        Widget = Y.Widget,
        Node = Y.Node;
    function Pagination(config) {
        Pagination.superclass.constructor.apply(this, arguments);
    }
    Pagination.NAME = 'pagination';
    Pagination.ATTRS = {
        step: {
            value: 7
        },
        index: {
            value: 1
        },
        max: {
            value: 7
        },
        jump: {
            value: false
        }
    };
    Y.extend(Pagination, Widget, {
        initializer: function () {
            this.publish('trigger');
            this._eventHandles = {
                delegate: null
            };
            this.render();
        },
        destructor: function () {

        },
        renderUI: function () {
            this._renderMarkup();
            this._renderPage();
        },
        bindUI: function () {
            this._bindDelegate();
        },
        syncUI: function () {
            //this._updatePage();
        },
		setMax: function(max){
			this.set('max', max);
			this.renderUI();
		},
		setStep: function(step){
			this.set('step', step);	
			this.renderUI();
		},
		setIndex: function(index){
			this.set('index', index);		  
			this.renderUI();
		},
        _renderMarkup: function () {
            this.get('contentBox').append('<span></span>');
            if (this.get('jump')) {
                this.get('contentBox').append('<ins>到第<input type="text" />页<button>跳转</button></ins>');
            }
        },
        _renderPage: function () {
            var step = this.get('step'),
                index = this.get('index'),
                max = this.get('max'),
                contentBox = this.get('contentBox');
            var pageMain = [];
            //render Left;
            if (index === 1) {
                pageMain.push('<a href="#" title="上一页" class="page-prev-disabled">上一页</a>');
            } else {
                pageMain.push('<a href="#" title="上一页" class="page-prev">上一页</a>');
            }
            pageMain.push('<span class="page-main">');
            //render Middle
            if (step >= max) {
                for (var i = 1; i <= max; i++) {
                    pageMain.push('<a href="#page-' + i + '"' + (index === i ? ' class="current"' : '') + ' title="第' + i + '页">' + i + '</a>');
                }
            } else {
                if (index < step) {
                    for (var i = 1; i <= step; i++) {
                        pageMain.push('<a href="#page-' + i + '"' + (index === i ? ' class="current"' : '') + ' title="第' + i + '页">' + i + '</a>');
                    }
                    pageMain.push('<em>...</em>');
                    pageMain.push('<a href="#page-' + max + '" title="第' + max + '页">' + max + '</a>');
                } else if (index > max - step) {
                    pageMain.push('<a href="#page-1" title="第1页">1</a>');
                    pageMain.push('<em>...</em>');
                    for (var i = max - step; i <= max; i++) {
                        pageMain.push('<a href="#page-' + i + '"' + (index === i ? ' class="current"' : '') + ' title="第' + i + '页">' + i + '</a>');
                    }
                } else {
                    pageMain.push('<a href="#page-1" title="第1页">1</a>');
                    pageMain.push('<em>...</em>');
                    for (var i = index - Math.floor(step / 2); i <= index + Math.floor(step / 2) - (step % 2 ? 0 : 1); i++) {
                        pageMain.push('<a href="#page-' + i + '"' + (index === i ? ' class="current"' : '') + ' title="第' + i + '页">' + i + '</a>');
                    }
                    pageMain.push('<em>...</em>');
                    pageMain.push('<a href="#page-' + max + '" title="第' + max + '页">' + max + '</a>');
                }
            }
            pageMain.push('</span>');
            //render Right
            if (index === max) {
                pageMain.push('<a href="#" title="下一页" class="page-next-disabled">下一页</a>');
            } else {
                pageMain.push('<a href="#" title="下一页" class="page-next">下一页</a>');
            }
            contentBox.query('span').setContent(pageMain.join(''));
        },
        _bindDelegate: function () {
            var eventHandles = this._eventHandles;
            if (eventHandles.delegate) {
                eventHandles.delegate.detach();
                eventHandles.delegate = null;
            }
            eventHandles.delegate = Y.on('click', Y.bind(this._onDelegateClick, this), this.get('contentBox'));
            if (this.get('jump')) {
                this._bindJump();
            }
        },
        _bindJump: function () {
            var s = this;
            var contentBox = this.get('contentBox'),
                jumpbtn = contentBox.query('button'),
                jumpinput = contentBox.query('input');
            if (Y.UA.ie === 6) {
                jumpbtn.on('mouseover', function (e) {
                    this.addClass('jumpbtn-hover');
                });
				jumpbtn.on('mouseout', function (e) {
                    this.removeClass('jumpbtn-hover');
                });
            }
            jumpinput.on('focus', function (e) {
                this.select();
            });
            jumpinput.on('keydown', function (e) {
                if (e.keyCode === 13) {
                    s._jumpPage();
                    this.select();
                }
            });
        },
        _onDelegateClick: function (e) {
            e.halt();
            var target = e.target;
            if (target.hasClass('page-prev')) {
                this._goPrevPage();
            } else if (target.hasClass('page-next')) {
                this._goNextPage();
            } else if (target.get('tagName') === 'A' && target.get('parentNode').get('className') === 'page-main') {
                this._goToPage(parseInt(target.get('innerHTML')));
            }
            if (this.get('jump') && target.get('tagName') === 'BUTTON') {
                this._jumpPage();
            }
        },
        _goPrevPage: function () {
            var page = this.get('index') - 1;
            this.set('index', page);
            this._renderPage();
            this.fire('trigger', {
                'page': page,
				'max': this.get('max')
            });
        },
        _goNextPage: function () {
            var page = this.get('index') + 1;
            this.set('index', page);
            this._renderPage();
            this.fire('trigger', {
                'page': page,
				'max': this.get('max')
            });
        },
        _goToPage: function (page) {
            this.set('index', page);
            this._renderPage();
            this.fire('trigger', {
                'page': page,
				'max': this.get('max')
            });
        },
        _jumpPage: function () {
            var jumpinputVal = parseInt(this.get('contentBox').query('input').get('value'));
            if (this._validatePage(jumpinputVal)) {
                this._goToPage(jumpinputVal);
            }
        },
        _validatePage: function (val) {
            var max = this.get('max');
            return (Lang.isNumber(val) && val >= 1 && val <= max);
        }
    });
	Y.Pagination = Pagination;
}, '3.0.0', {requires: ['widget']});
