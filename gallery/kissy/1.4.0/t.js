/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 19:20
*/
KISSY.add("event/dom/base/utils",function(f,d){var a="ksEventTargetId_"+f.now(),b=f.Env.host.document;return{simpleAdd:b&&b.addEventListener?function(a,b,d,f){a.addEventListener&&a.addEventListener(b,d,!!f)}:function(a,b,d){a.attachEvent&&a.attachEvent("on"+b,d)},simpleRemove:b&&b.removeEventListener?function(a,b,d,f){a.removeEventListener&&a.removeEventListener(b,d,!!f)}:function(a,b,d){a.detachEvent&&a.detachEvent("on"+b,d)},data:function(b,f){return d.data(b,a,f)},removeData:function(b){return d.removeData(b,
a)}}},{requires:["dom"]});KISSY.add("event/dom/base/special",function(){return{}});
KISSY.add("event/dom/base/observer",function(f,d,a){function b(a){b.superclass.constructor.apply(this,arguments)}f.extend(b,a.Observer,{keys:"fn,filter,data,context,originalType,groups,last".split(","),notifyInternal:function(a,b){var f,j,p=a.type,l;(l=this.originalType)?a.type=l:l=p;(f=d[l])&&f.handle?(f=f.handle(a,this,b))&&0<f.length&&(j=f[0]):j=this.simpleNotify(a,b);a.type=p;return j}});return b},{requires:["./special","event/base"]});
KISSY.add("event/dom/base/object",function(f,d,a){function b(){return j}function q(){return p}function m(c){var k=c.type;m.superclass.constructor.call(this);this.originalEvent=c;this.isDefaultPrevented=c.defaultPrevented||c.returnValue===p||c.getPreventDefault&&c.getPreventDefault()?b:q;var h=null,g,n,i=l.concat();f.each(o,function(c){return k.match(c.reg)?(i=i.concat(c.props),h=c.fix,!1):a});for(g=i.length;g;)n=i[--g],this[n]=c[n];this.target||(this.target=c.srcElement||t);3===this.target.nodeType&&
(this.target=this.target.parentNode);h&&h(this,c)}var t=f.Env.host.document,j=!0,p=!1,l="altKey,bubbles,cancelable,ctrlKey,currentTarget,eventPhase,metaKey,shiftKey,target,timeStamp,view,type".split(","),o=[{reg:/^key/,props:["char","charCode","key","keyCode","which"],fix:function(c,k){null==c.which&&(c.which=null!=k.charCode?k.charCode:k.keyCode);c.metaKey===a&&(c.metaKey=c.ctrlKey)}},{reg:/^touch/,props:["touches","changedTouches","targetTouches"]},{reg:/^gesturechange$/i,props:["rotation","scale"]},
{reg:/^mousewheel$/,props:[],fix:function(c,k){var h,g,l,i=k.wheelDelta,b=k.axis,o=k.wheelDeltaY,f=k.wheelDeltaX,d=k.detail;i&&(l=i/120);d&&(l=-(0==d%3?d/3:d));b!==a&&(b===e.HORIZONTAL_AXIS?(g=0,h=-1*l):b===e.VERTICAL_AXIS&&(h=0,g=l));o!==a&&(g=o/120);f!==a&&(h=-1*f/120);!h&&!g&&(g=l);h!==a&&(c.deltaX=h);g!==a&&(c.deltaY=g);l!==a&&(c.delta=l)}},{reg:/^mouse|contextmenu|click|mspointer/i,props:"buttons,clientX,clientY,button,offsetX,relatedTarget,which,fromElement,toElement,offsetY,pageX,pageY,screenX,screenY".split(","),
fix:function(c,l){var h,g,b=c.target,i=l.button;null==c.pageX&&null!=l.clientX&&(h=b.ownerDocument||t,g=h.documentElement,h=h.body,c.pageX=l.clientX+(g&&g.scrollLeft||h&&h.scrollLeft||0)-(g&&g.clientLeft||h&&h.clientLeft||0),c.pageY=l.clientY+(g&&g.scrollTop||h&&h.scrollTop||0)-(g&&g.clientTop||h&&h.clientTop||0));!c.which&&i!==a&&(c.which=i&1?1:i&2?3:i&4?2:0);!c.relatedTarget&&c.fromElement&&(c.relatedTarget=c.fromElement===b?c.toElement:c.fromElement);return c}}];f.extend(m,d.Object,{constructor:m,
preventDefault:function(){var a=this.originalEvent;a.preventDefault?a.preventDefault():a.returnValue=p;m.superclass.preventDefault.call(this)},stopPropagation:function(){var a=this.originalEvent;a.stopPropagation?a.stopPropagation():a.cancelBubble=j;m.superclass.stopPropagation.call(this)}});return m},{requires:["event/base"]});
KISSY.add("event/dom/base/observable",function(f,d,a,b,q,m,t){function j(a){f.mix(this,a);this.reset()}var p=t.Utils;f.extend(j,t.Observable,{setup:function(){var l=this.type,o=a[l]||{},c=this.currentTarget,k=b.data(c).handle;(!o.setup||!1===o.setup.call(c,l))&&b.simpleAdd(c,l,k)},constructor:j,reset:function(){j.superclass.reset.call(this);this.lastCount=this.delegateCount=0},notify:function(a){var b=a.target,c=a.type,k=this.currentTarget,h=this.observers,g=[],n,i,f=this.delegateCount||0,s,u;if(f&&
b.nodeType)for(;b!=k;){if(!0!==b.disabled||"click"!==c){var r={},m,j,q;s=[];for(i=0;i<f;i++)u=h[i],q=u.filter,j=q+"",m=r[j],void 0===m&&(m=r[j]=d.test(b,q)),m&&s.push(u);s.length&&g.push({currentTarget:b,currentTargetObservers:s})}b=b.parentNode||k}f<h.length&&g.push({currentTarget:k,currentTargetObservers:h.slice(f)});i=0;for(b=g.length;!a.isPropagationStopped()&&i<b;++i){c=g[i];s=c.currentTargetObservers;c=c.currentTarget;a.currentTarget=c;for(c=0;!a.isImmediatePropagationStopped()&&c<s.length;c++)k=
s[c],k=k.notify(a,this),!1!==n&&(n=k)}return n},fire:function(b,o){var b=b||{},c=""+this.type,k,h,g=a[c]||{};k=!1!==g.bubbles;var n=this.currentTarget;if(!(g.fire&&!1===g.fire.call(n,o))&&(b instanceof m||(h=b,b=new m({currentTarget:n,type:c,target:n}),f.mix(b,h)),!(g.preFire&&!1===g.preFire.call(n,b,o)))){var i=n,v=d.getWindow(i),s=v.document;h=[];g=0;do h.push(i),i=i.parentNode||i.ownerDocument||i===s&&v;while(!o&&i&&k);i=h[g];do b.currentTarget=i,(k=j.getDomEventObservable(i,c))&&k.notify(b),i=
h[++g];while(!o&&i&&!b.isPropagationStopped());if(!o&&!b.isDefaultPrevented()){try{n[c]&&!f.isWindow(n)&&(j.triggeredEvent=c,n[c]())}catch(u){}j.triggeredEvent=""}}},on:function(b){var f=this.observers,c=a[this.type]||{},b=b instanceof q?b:new q(b);-1==this.findObserver(b)&&(b.filter?(f.splice(this.delegateCount,0,b),this.delegateCount++):b.last?(f.push(b),this.lastCount++):f.splice(f.length-this.lastCount,0,b),c.add&&c.add.call(this.currentTarget,b))},detach:function(b){var f,c=a[this.type]||{},
k="filter"in b,h=b.filter,g=b.context,n=b.fn,i=this.currentTarget,d=this.observers,b=b.groups;if(d.length){b&&(f=p.getGroupsRe(b));var s,u,r,m,j=d.length;if(n||k||f){g=g||i;s=b=0;for(u=[];b<j;++b)r=d[b],m=r.context||i,g!=m||n&&n!=r.fn||k&&(h&&h!=r.filter||!h&&!r.filter)||f&&!r.groups.match(f)?u[s++]=r:(r.filter&&this.delegateCount&&this.delegateCount--,r.last&&this.lastCount&&this.lastCount--,c.remove&&c.remove.call(i,r));this.observers=u}else this.reset();this.checkMemory()}},checkMemory:function(){var d=
this.type,m,c,k=a[d]||{},h=this.currentTarget,g=b.data(h);if(g&&(m=g.observables,this.hasObserver()||(c=g.handle,(!k.tearDown||!1===k.tearDown.call(h,d))&&b.simpleRemove(h,d,c),delete m[d]),f.isEmptyObject(m)))g.handle=null,b.removeData(h)}});j.triggeredEvent="";j.getDomEventObservable=function(a,f){var c=b.data(a),k;c&&(k=c.observables);return k?k[f]:null};j.getDomEventObservablesHolder=function(a,f){var c=b.data(a);!c&&f&&b.data(a,c={});return c};return j},{requires:"dom,./special,./utils,./observer,./object,event/base".split(",")});
KISSY.add("event/dom/base/dom-event",function(f,d,a,b,q,m,t){function j(a,b){var c=q[b]||{},f;if(!a.originalType&&(f=c.typeFix))a.originalType=b,b=f;return b}function p(a,b,c){var d,i,v,c=f.merge(c),b=j(c,b);d=m.getDomEventObservablesHolder(a,1);if(!(v=d.handle))v=d.handle=function(a){var b=a.type,c=v.currentTarget;if(!(m.triggeredEvent==b||"undefined"==typeof KISSY))if(b=m.getDomEventObservable(c,b))return a.currentTarget=c,a=new t(a),b.notify(a)},v.currentTarget=a;if(!(i=d.observables))i=d.observables=
{};d=i[b];d||(d=i[b]=new m({type:b,currentTarget:a}),d.setup());d.on(c);a=null}function l(a,b,c){var c=f.merge(c),b=j(c,b),a=m.getDomEventObservablesHolder(a),d=(a||{}).observables;if(a&&d)if(b)(b=d[b])&&b.detach(c);else for(b in d)d[b].detach(c)}var o=d.Utils,c={};f.mix(c,{on:function(a,c,g,d){a=b.query(a);o.batchForType(function(a,b,c,d){for(var c=o.normalizeParam(b,c,d),g,b=c.type,d=a.length-1;0<=d;d--)g=a[d],p(g,b,c)},1,a,c,g,d);return a},detach:function(a,c,d,f){a=b.query(a);o.batchForType(function(a,
b,c,d){for(var c=o.normalizeParam(b,c,d),g,f,b=c.type,d=a.length-1;0<=d;d--)if(g=a[d],l(g,b,c),c.deep&&g.getElementsByTagName){f=g.getElementsByTagName("*");for(g=f.length-1;0<=g;g--)l(f[g],b,c)}},1,a,c,d,f);return a},delegate:function(a,b,d,f,i){return c.on(a,b,{fn:f,context:i,filter:d})},undelegate:function(a,b,d,f,i){return c.detach(a,b,{fn:f,context:i,filter:d})},fire:function(a,c,d,f){var i=void 0,d=d||{};d.synthetic=1;o.splitAndRun(c,function(c){var h,j,l;o.fillGroupsForEvent(c,d);c=d.type;
if((j=q[c])&&j.typeFix)c=j.typeFix;a=b.query(a);for(j=a.length-1;0<=j;j--)h=a[j],l=m.getDomEventObservable(h,c),!f&&!l&&(l=new m({type:c,currentTarget:h})),l&&(h=l.fire(d,f),!1!==i&&(i=h))});return i},fireHandler:function(a,b,d){return c.fire(a,b,d,1)},clone:function(b,c){var d;if(d=m.getDomEventObservablesHolder(b)){var j=a.data(b);j&&j===a.data(c)&&a.removeData(c);f.each(d.observables,function(a,b){f.each(a.observers,function(a){p(c,b,a)})})}}});return c},{requires:"event/base,./utils,dom,./special,./observable,./object".split(",")});
KISSY.add("event/dom/base/key-codes",function(f){var d=f.UA,a={MAC_ENTER:3,BACKSPACE:8,TAB:9,NUM_CENTER:12,ENTER:13,SHIFT:16,CTRL:17,ALT:18,PAUSE:19,CAPS_LOCK:20,ESC:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,PRINT_SCREEN:44,INSERT:45,DELETE:46,ZERO:48,ONE:49,TWO:50,THREE:51,FOUR:52,FIVE:53,SIX:54,SEVEN:55,EIGHT:56,NINE:57,QUESTION_MARK:63,A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,
Y:89,Z:90,META:91,WIN_KEY_RIGHT:92,CONTEXT_MENU:93,NUM_ZERO:96,NUM_ONE:97,NUM_TWO:98,NUM_THREE:99,NUM_FOUR:100,NUM_FIVE:101,NUM_SIX:102,NUM_SEVEN:103,NUM_EIGHT:104,NUM_NINE:105,NUM_MULTIPLY:106,NUM_PLUS:107,NUM_MINUS:109,NUM_PERIOD:110,NUM_DIVISION:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,NUMLOCK:144,SEMICOLON:186,DASH:189,EQUALS:187,COMMA:188,PERIOD:190,SLASH:191,APOSTROPHE:192,SINGLE_QUOTE:222,OPEN_SQUARE_BRACKET:219,BACKSLASH:220,CLOSE_SQUARE_BRACKET:221,
WIN_KEY:224,MAC_FF_META:224,WIN_IME:229,isTextModifyingKeyEvent:function(b){if(b.altKey&&!b.ctrlKey||b.metaKey||b.keyCode>=a.F1&&b.keyCode<=a.F12)return!1;switch(b.keyCode){case a.ALT:case a.CAPS_LOCK:case a.CONTEXT_MENU:case a.CTRL:case a.DOWN:case a.END:case a.ESC:case a.HOME:case a.INSERT:case a.LEFT:case a.MAC_FF_META:case a.META:case a.NUMLOCK:case a.NUM_CENTER:case a.PAGE_DOWN:case a.PAGE_UP:case a.PAUSE:case a.PRINT_SCREEN:case a.RIGHT:case a.SHIFT:case a.UP:case a.WIN_KEY:case a.WIN_KEY_RIGHT:return!1;
default:return!0}},isCharacterKey:function(b){if(b>=a.ZERO&&b<=a.NINE||b>=a.NUM_ZERO&&b<=a.NUM_MULTIPLY||b>=a.A&&b<=a.Z||d.webkit&&0==b)return!0;switch(b){case a.SPACE:case a.QUESTION_MARK:case a.NUM_PLUS:case a.NUM_MINUS:case a.NUM_PERIOD:case a.NUM_DIVISION:case a.SEMICOLON:case a.DASH:case a.EQUALS:case a.COMMA:case a.PERIOD:case a.SLASH:case a.APOSTROPHE:case a.SINGLE_QUOTE:case a.OPEN_SQUARE_BRACKET:case a.BACKSLASH:case a.CLOSE_SQUARE_BRACKET:return!0;default:return!1}}};return a});
KISSY.add("event/dom/base/gesture",function(){return{start:"mousedown",move:"mousemove",end:"mouseup",tap:"click",doubleTap:"dblclick"}});
KISSY.add("event/dom/base/special-events",function(f,d,a){var b=b;return f.mix(a,{mousewheel:{typeFix:f.UA.gecko?"DOMMouseScroll":"mousewheel"},load:{bubbles:!1},click:{fire:function(a){return!a&&"checkbox"===""+this.type&&this.click&&"input"==this.nodeName.toLowerCase()?(this.click(),!1):b}},focus:{bubbles:!1,preFire:function(a,b){b||d.fire(this,"focusin")},fire:function(a){return!a&&this.ownerDocument&&this!==this.ownerDocument.activeElement&&this.focus?(this.focus(),!1):b}},blur:{bubbles:!1,preFire:function(a,
b){b||d.fire(this,"focusout")},fire:function(a){return!a&&this.ownerDocument&&this===this.ownerDocument.activeElement&&this.blur?(this.blur(),!1):b}}})},{requires:["./dom-event","./special"]});
KISSY.add("event/dom/base/mouseenter",function(f,d,a){f.each([{name:"mouseenter",fix:"mouseover"},{name:"mouseleave",fix:"mouseout"}],function(b){a[b.name]={typeFix:b.fix,handle:function(a,b,f){var j=a.currentTarget,p=a.relatedTarget;if(!p||p!==j&&!d.contains(j,p))return[b.simpleNotify(a,f)]}}})},{requires:["dom","./special"]});
KISSY.add("event/dom/base/valuechange",function(f,d,a,b){function q(b){if(a.hasData(b,g)){var c=a.data(b,g);clearTimeout(c);a.removeData(b,g)}}function m(a){q(a.target)}function t(b){var f=b.value,g=a.data(b,h);f!==g&&(d.fireHandler(b,c,{prevVal:g,newVal:f}),a.data(b,h,f))}function j(b){a.hasData(b,g)||a.data(b,g,setTimeout(function(){t(b);a.data(b,g,setTimeout(arguments.callee,n))},n))}function p(b){var c=b.target;"focus"==b.type&&a.data(c,h,c.value);j(c)}function l(a){t(a.target)}function o(b){a.removeData(b,
h);q(b);d.detach(b,"blur",m);d.detach(b,"webkitspeechchange",l);d.detach(b,"mousedown keyup keydown focus",p)}var c="valuechange",k=a.nodeName,h="event/valuechange/history",g="event/valuechange/poll",n=50;b[c]={setup:function(){var a=k(this);if("input"==a||"textarea"==a)o(this),d.on(this,"blur",m),d.on(this,"webkitspeechchange",l),d.on(this,"mousedown keyup keydown focus",p)},tearDown:function(){o(this)}};return d},{requires:["./dom-event","dom","./special"]});
KISSY.add("event/dom/base",function(f,d,a,b,q){return f.merge({add:d.on,remove:d.detach,KeyCode:a,Gesture:b,Special:q},d)},{requires:"./base/dom-event,./base/key-codes,./base/gesture,./base/special-events,./base/mouseenter,./base/valuechange".split(",")});
/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 19:20
*/
KISSY.add("event/dom/focusin",function(d,e){var g=e.Special;d.each([{name:"focusin",fix:"focus"},{name:"focusout",fix:"blur"}],function(c){function f(a){return e.fire(a.target,c.name)}var b=d.guid("attaches_"+d.now()+"_");g[c.name]={setup:function(){var a=this.ownerDocument||this;b in a||(a[b]=0);a[b]+=1;1===a[b]&&a.addEventListener(c.fix,f,!0)},tearDown:function(){var a=this.ownerDocument||this;a[b]-=1;0===a[b]&&a.removeEventListener(c.fix,f,!0)}}});return e},{requires:["event/dom/base"]});
/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 19:20
*/
KISSY.add("event/dom/shake",function(d,k,f){function l(a){var b=a.accelerationIncludingGravity,a=b.x,d=b.y,b=b.z,g;c!==f&&(g=n(h(a-c),h(d-i),h(b-j)),g>o&&m(),g>p&&(e=1));c=a;i=d;j=b}var q=k.Special,o=5,p=20,e=0,c,i,j,n=Math.max,h=Math.abs,a=d.Env.host,m=d.buffer(function(){e&&(k.fireHandler(a,"shake",{accelerationIncludingGravity:{x:c,y:i,z:j}}),c=f,e=0)},250);q.shake={setup:function(){this==a&&a.addEventListener("devicemotion",l,!1)},tearDown:function(){this==a&&(m.stop(),c=f,e=0,a.removeEventListener("devicemotion",
l,!1))}}},{requires:["event/dom/base"]});
/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 19:20
*/
KISSY.add("event/dom/touch/handle-map",function(){return{}});KISSY.add("event/dom/touch/gesture",function(f,b){var d=b.Gesture,c=f.Features,a,i,j,k;c.isTouchEventSupported()?(a="touchstart",i="touchmove",k="touchend",j="touchcancel"):c.isMsPointerSupported()&&(a="MSPointerDown",i="MSPointerMove",k="MSPointerUp",j="MSPointerCancel");a&&(d.start=a,d.move=i,d.end=k,d.cancel=j,d.tap="tap",d.doubleTap="doubleTap",d.singleTouchStart="singleTouchStart");return d},{requires:["event/dom/base"]});
KISSY.add("event/dom/touch/single-touch",function(f){function b(){}b.prototype={constructor:b,requiredTouchCount:1,onTouchStart:function(d){if(d.touches.length!=this.requiredTouchCount)return!1;this.lastTouches=d.touches},onTouchMove:f.noop,onTouchEnd:f.noop};return b});
KISSY.add("event/dom/touch/tap",function(f,b,d,c){function a(){}f.extend(a,c,{onTouchMove:function(){return!1},onTouchEnd:function(a){var c=a.changedTouches[0];d.fire(a.target,"tap",{pageX:c.pageX,pageY:c.pageY,which:1,touch:c})}});b.tap={handle:new a};return a},{requires:["./handle-map","event/dom/base","./single-touch"]});
KISSY.add("event/dom/touch/swipe",function(f,b,d,c){function a(e,g,h){var m=g.changedTouches[0],a=m.pageX-e.startX,c=m.pageY-e.startY,b=Math.abs(a),i=Math.abs(c);if(h)e.isVertical&&e.isHorizontal&&(i>b?e.isHorizontal=0:e.isVertical=0);else if(e.isVertical&&i<l&&(e.isVertical=0),e.isHorizontal&&b<l)e.isHorizontal=0;if(e.isHorizontal)a=0>a?"left":"right";else if(e.isVertical)a=0>c?"up":"down",b=i;else return!1;d.fire(g.target,h?k:j,{originalEvent:g.originalEvent,pageX:m.pageX,pageY:m.pageY,which:1,
touch:m,direction:a,distance:b,duration:(g.timeStamp-e.startTime)/1E3})}function i(){}var j="swipe",k="swiping",l=50;f.extend(i,c,{onTouchStart:function(e){if(!1===i.superclass.onTouchStart.apply(this,arguments))return!1;var g=e.touches[0];this.startTime=e.timeStamp;this.isVertical=this.isHorizontal=1;this.startX=g.pageX;this.startY=g.pageY;-1!=e.type.indexOf("mouse")&&e.preventDefault()},onTouchMove:function(e){var g=e.changedTouches[0],h=g.pageY-this.startY,g=Math.abs(g.pageX-this.startX),h=Math.abs(h);
if(1E3<e.timeStamp-this.startTime)return!1;this.isVertical&&35<g&&(this.isVertical=0);this.isHorizontal&&35<h&&(this.isHorizontal=0);return a(this,e,1)},onTouchEnd:function(e){return!1===this.onTouchMove(e)?!1:a(this,e,0)}});b[j]=b[k]={handle:new i};return i},{requires:["./handle-map","event/dom/base","./single-touch"]});
KISSY.add("event/dom/touch/double-tap",function(f,b,d,c){function a(){}f.extend(a,c,{onTouchStart:function(c){if(!1===a.superclass.onTouchStart.apply(this,arguments))return!1;this.startTime=c.timeStamp;this.singleTapTimer&&(clearTimeout(this.singleTapTimer),this.singleTapTimer=0)},onTouchMove:function(){return!1},onTouchEnd:function(a){var c=this.lastEndTime,b=a.timeStamp,f=a.target,e=a.changedTouches[0],g=b-this.startTime;this.lastEndTime=b;if(c&&(g=b-c,300>g)){this.lastEndTime=0;d.fire(f,"doubleTap",
{touch:e,duration:g/1E3});return}g=b-this.startTime;300<g?d.fire(f,"singleTap",{touch:e,pageX:e.pageX,which:1,pageY:e.pageY,duration:g/1E3}):this.singleTapTimer=setTimeout(function(){d.fire(f,"singleTap",{touch:e,pageX:e.pageX,which:1,pageY:e.pageY,duration:g/1E3})},300)}});b.singleTap=b.doubleTap={handle:new a};return a},{requires:["./handle-map","event/dom/base","./single-touch"]});
KISSY.add("event/dom/touch/multi-touch",function(f,b){function d(){}d.prototype={constructor:d,requiredTouchCount:2,onTouchStart:function(c){var a=this.requiredTouchCount,b=c.touches.length;b===a?this.start():b>a&&this.end(c)},onTouchEnd:function(c){this.end(c)},start:function(){this.isTracking||(this.isTracking=!0,this.isStarted=!1)},fireEnd:f.noop,getCommonTarget:function(c){var a=c.touches,c=a[0].target,a=a[1].target;if(c==a||b.contains(c,a))return c;for(;;){if(b.contains(a,c))return a;a=a.parentNode}},
end:function(c){this.isTracking&&(this.isTracking=!1,this.isStarted&&(this.isStarted=!1,this.fireEnd(c)))}};return d},{requires:["dom"]});
KISSY.add("event/dom/touch/pinch",function(f,b,d,c,a){function i(){}function j(a){(!a.touches||2==a.touches.length)&&a.preventDefault()}f.extend(i,c,{onTouchMove:function(a){if(this.isTracking){var c=a.touches,e,g=c[0],h=c[1];e=g.pageX-h.pageX;g=g.pageY-h.pageY;e=Math.sqrt(e*e+g*g);this.lastTouches=c;this.isStarted?d.fire(this.target,"pinch",f.mix(a,{distance:e,scale:e/this.startDistance})):(this.isStarted=!0,this.startDistance=e,c=this.target=this.getCommonTarget(a),d.fire(c,"pinchStart",f.mix(a,
{distance:e,scale:1})))}},fireEnd:function(a){d.fire(this.target,"pinchEnd",f.mix(a,{touches:this.lastTouches}))}});c=new i;b.pinchStart=b.pinchEnd={handle:c};b.pinch={handle:c,add:function(){d.on(this,a.move,j)},remove:function(){d.detach(this,a.move,j)}};return i},{requires:["./handle-map","event/dom/base","./multi-touch","./gesture"]});
KISSY.add("event/dom/touch/tap-hold",function(f,b,d,c,a){function i(){}function j(a){(!a.touches||1==a.touches.length)&&a.preventDefault()}f.extend(i,d,{onTouchStart:function(a){if(!1===i.superclass.onTouchStart.call(this,a))return!1;this.timer=setTimeout(function(){var b=a.touches[0];c.fire(a.target,"tapHold",{touch:b,pageX:b.pageX,pageY:b.pageY,which:1,duration:(f.now()-a.timeStamp)/1E3})},1E3)},onTouchMove:function(){clearTimeout(this.timer);return!1},onTouchEnd:function(){clearTimeout(this.timer)}});
b.tapHold={setup:function(){c.on(this,a.start,j)},tearDown:function(){c.detach(this,a.start,j)},handle:new i};return i},{requires:["./handle-map","./single-touch","event/dom/base","./gesture"]});
KISSY.add("event/dom/touch/rotate",function(f,b,d,c,a,i){function j(){}function k(a){(!a.touches||2==a.touches.length)&&a.preventDefault()}var l=180/Math.PI;f.extend(j,d,{onTouchMove:function(a){if(this.isTracking){var g=a.touches,h=g[0],b=g[1],d=this.lastAngle,h=Math.atan2(b.pageY-h.pageY,b.pageX-h.pageX)*l;if(d!==i){var b=Math.abs(h-d),j=(h+360)%360,k=(h-360)%360;Math.abs(j-d)<b?h=j:Math.abs(k-d)<b&&(h=k)}this.lastTouches=g;this.lastAngle=h;this.isStarted?c.fire(this.target,"rotate",f.mix(a,{angle:h,
rotation:h-this.startAngle})):(this.isStarted=!0,this.startAngle=h,this.target=this.getCommonTarget(a),c.fire(this.target,"rotateStart",f.mix(a,{angle:h,rotation:0})))}},end:function(){this.lastAngle=i;j.superclass.end.apply(this,arguments)},fireEnd:function(a){c.fire(this.target,"rotateEnd",f.mix(a,{touches:this.lastTouches}))}});d=new j;b.rotateEnd=b.rotateStart={handle:d};b.rotate={handle:d,add:function(){c.on(this,a.move,k)},remove:function(){c.detach(this,a.move,k)}};return j},{requires:["./handle-map",
"./multi-touch","event/dom/base","./gesture"]});KISSY.add("event/dom/touch/single-touch-start",function(f,b,d,c){function a(){}f.extend(a,c,{onTouchStart:function(b){if(!1!==a.superclass.onTouchStart.apply(this,arguments)){var c=b.touches[0];d.fire(b.target,"singleTouchStart",{touch:c[0],pageX:c.pageX,pageY:c.pageY,which:1,touches:b.touches})}else return!1}});b.singleTouchStart={handle:new a};return a},{requires:["./handle-map","event/dom/base","./single-touch"]});
KISSY.add("event/dom/touch/handle",function(f,b,d,c,a){function i(a){this.doc=a;this.eventHandle={};this.init();this.touches=[]}var j=f.guid("touch-handle"),k=f.Features,l=k.isMsPointerSupported(),e={};e[a.start]="onTouchStart";e[a.move]="onTouchMove";e[a.end]="onTouchEnd";a.cancel&&(e[a.cancel]="onTouchEnd");i.prototype={constructor:i,addTouch:function(a){this.touches.push(a)},removeTouch:function(a){var h=this.touches;f.each(h,function(b,c){if(b.pointerId==a.pointerId)return h.splice(c,1),!1})},
updateTouch:function(a){var h=this.touches;f.each(h,function(b,c){if(b.pointerId==a.pointerId)return h[c]=a,!1})},init:function(){var a=this.doc,h,b;for(h in e)b=e[h],c.on(a,h,this[b],this)},normalize:function(a){var b=a.type,c;if(k.isTouchEventSupported())return c="touchend"==b||"touchcancel"==b?a.changedTouches:a.touches,1==c.length&&(a.which=1,a.pageX=c.pageX,a.pageY=c.pageY),a;if(l)c=this.touches;else{if(-1!=b.indexOf("mouse")&&1!=a.which)return;c=[a]}b=!b.match(/(up|cancel)$/i);a.touches=b?c:
[];a.targetTouches=b?c:[];a.changedTouches=c;return a},onTouchMove:function(a){l&&this.updateTouch(a.originalEvent);this.callEventHandle("onTouchMove",a)},onTouchStart:function(a){var b,c,e=this.eventHandle;for(b in e)c=e[b].handle,c.isActive=1;l&&this.addTouch(a.originalEvent);this.callEventHandle("onTouchStart",a)},onTouchEnd:function(a){this.callEventHandle("onTouchEnd",a);l&&this.removeTouch(a.originalEvent)},callEventHandle:function(a,b){var c=this.eventHandle,e,d;if(b=this.normalize(b)){for(e in c)d=
c[e].handle,d.processed||(d.processed=1,d.isActive&&!1===d[a](b)&&(d.isActive=0));for(e in c)d=c[e].handle,d.processed=0}},addEventHandle:function(a){var b=this.eventHandle,c=d[a].handle;b[a]?b[a].count++:b[a]={count:1,handle:c}},removeEventHandle:function(a){var b=this.eventHandle;b[a]&&(b[a].count--,b[a].count||delete b[a])},destroy:function(){var a=this.doc,b,d;for(b in e)d=e[b],c.detach(a,b,this[d],this)}};return{addDocumentHandle:function(a,c){var e=b.getDocument(a),d=b.data(e,j);d||b.data(e,
j,d=new i(e));d.addEventHandle(c)},removeDocumentHandle:function(a,c){var e=b.getDocument(a),d=b.data(e,j);d&&(d.removeEventHandle(c),f.isEmptyObject(d.eventHandle)&&(d.destroy(),b.removeData(e,j)))}}},{requires:"dom,./handle-map,event/dom/base,./gesture,./tap,./swipe,./double-tap,./pinch,./tap-hold,./rotate,./single-touch-start".split(",")});
KISSY.add("event/dom/touch",function(f,b,d,c){function a(a){i.call(this,a);d[a].setup.apply(this,arguments)}function i(a){var b=this.style;l.isMsPointerSupported()&&b&&(this.__ks_touch_action||(this.__ks_touch_action=b.msTouchAction,this.__ks_user_select=b.msUserSelect,b.msTouchAction=b.msUserSelect="none"),this.__ks_touch_action_count?this.__ks_touch_action_count++:this.__ks_touch_action_count=1);c.addDocumentHandle(this,a)}function j(a){k.call(this,a);d[a].tearDown.apply(this,arguments)}function k(a){var b=
this.style;l.isMsPointerSupported()&&b&&(this.__ks_touch_action_count--,this.__ks_touch_action_count||(b.msUserSelect=this.__ks_user_select,b.msTouchAction=this.__ks_touch_action,this.__ks_touch_action=""));c.removeDocumentHandle(this,a)}var l=f.Features,f=b.Special,e,g;for(e in d)b={},g=d[e],b.setup=g.setup?a:i,b.tearDown=g.tearDown?j:k,g.add&&(b.add=g.add),g.remove&&(b.remove=g.remove),f[e]=b},{requires:["event/dom/base","./touch/handle-map","./touch/handle"]});
/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 19:20
*/
KISSY.add("event/custom/observer",function(h,m){function f(){f.superclass.constructor.apply(this,arguments)}h.extend(f,m.Observer,{keys:["fn","context","groups"]});return f},{requires:["event/base"]});KISSY.add("event/custom/object",function(h,m){function f(j){f.superclass.constructor.call(this);h.mix(this,j)}h.extend(f,m.Object);return f},{requires:["event/base"]});
KISSY.add("event/custom/observable",function(h,m,f,j){function i(){i.superclass.constructor.apply(this,arguments);this.defaultFn=null;this.defaultTargetOnly=!1;this.bubbles=!0}var b=j.Utils;h.extend(i,j.Observable,{on:function(a){a=new m(a);-1==this.findObserver(a)&&this.observers.push(a)},fire:function(a){var a=a||{},c=this.bubbles,d=this.currentTarget,e,l=this.type,k=this.defaultFn,n,g=a,b;a.type=l;g instanceof f||(g.target=d,g=new f(g));g.currentTarget=d;a=this.notify(g);!1!==b&&(b=a);if(c&&!g.isPropagationStopped()){e=
(c=d.getTargets(1))&&c.length||0;for(n=0;n<e&&!g.isPropagationStopped();n++)a=c[n].fire(l,g),!1!==b&&(b=a)}if(k&&!g.isDefaultPrevented()&&(l=i.getCustomEventObservable(g.target,g.type),!this.defaultTargetOnly&&!l.defaultTargetOnly||d==g.target))b=k.call(d,g);return b},notify:function(a){var c=[].concat(this.observers),d,e,b=c.length,k;for(k=0;k<b&&!a.isImmediatePropagationStopped();k++)d=c[k].notify(a,this),!1!==e&&(e=d),!1===d&&a.halt();return e},detach:function(a){var c,d=a.fn,e=a.context,l=this.currentTarget,
k=this.observers,a=a.groups;if(k.length){a&&(c=b.getGroupsRe(a));var n,g,f,h,j=k.length;if(d||c){e=e||l;n=a=0;for(g=[];a<j;++a)if(f=k[a],h=f.context||l,e!=h||d&&d!=f.fn||c&&!f.groups.match(c))g[n++]=f;this.observers=g}else this.reset()}}});i.getCustomEventObservable=function(a,c,d){var e,b=i.getCustomEventObservables(a,d);e=b&&b[c];!e&&d&&(e=b[c]=new i({currentTarget:a,type:c}));return e};i.getCustomEventObservables=function(a,b){!a["__~ks_custom_events"]&&b&&(a["__~ks_custom_events"]={});return a["__~ks_custom_events"]};
return i},{requires:["./observer","./object","event/base"]});
KISSY.add("event/custom/target",function(h,m,f){var j=m.Utils,i=j.splitAndRun;return{isTarget:1,fire:function(b,a){var c=this,d=void 0,e=c.getTargets(1),l=e&&e.length,a=a||{};i(b,function(b){var e;j.fillGroupsForEvent(b,a);b=a.type;if((e=f.getCustomEventObservable(c,b))||l){if(e){if(!e.hasObserver()&&!e.defaultFn&&(e.bubbles&&!l||!e.bubbles))return}else e=new f({currentTarget:c,type:b});b=e.fire(a);!1!==d&&(d=b)}});return d},publish:function(b,a){var c,d=this;i(b,function(e){c=f.getCustomEventObservable(d,
e,1);h.mix(c,a)});return d},addTarget:function(b){var a=this.getTargets();h.inArray(b,a)||a.push(b);return this},removeTarget:function(b){var a=this.getTargets(),b=h.indexOf(b,a);-1!=b&&a.splice(b,1);return this},getTargets:function(b){b||(this["__~ks_bubble_targets"]=this["__~ks_bubble_targets"]||[]);return this["__~ks_bubble_targets"]},on:function(b,a,c){var d=this;j.batchForType(function(a,b,c){b=j.normalizeParam(a,b,c);a=b.type;if(a=f.getCustomEventObservable(d,a,1))a.on(b)},0,b,a,c);return d},
detach:function(b,a,c){var d=this;j.batchForType(function(a,b,c){var i=j.normalizeParam(a,b,c);(a=i.type)?(a=f.getCustomEventObservable(d,a,1))&&a.detach(i):(a=f.getCustomEventObservables(d),h.each(a,function(a){a.detach(i)}))},0,b,a,c);return d}}},{requires:["event/base","./observable"]});KISSY.add("event/custom",function(h,m){return{Target:m}},{requires:["./custom/target"]});
/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 19:20
*/
KISSY.add("event/base/utils",function(e){function f(a){if(0>a.indexOf("."))return[a,""];var b=a.match(/([^.]+)?(\..+)?$/),a=[b[1]];(b=b[2])?(b=b.split(".").sort(),a.push(b.join("."))):a.push("");return a}var d,c;return{splitAndRun:d=function(a,b){e.isArray(a)?e.each(a,b):(a=e.trim(a),-1==a.indexOf(" ")?b(a):e.each(a.split(/\s+/),b))},normalizeParam:function(a,b,c){var d=b||{},d=e.isFunction(b)?{fn:b,context:c}:e.merge(d),b=f(a),a=b[0];d.groups=b[1];d.type=a;return d},batchForType:function(a,b){var c=
e.makeArray(arguments),f=c[2+b];f&&"object"==typeof f?e.each(f,function(d,f){var e=[].concat(c);e.splice(0,2);e[b]=f;e[b+1]=d;a.apply(null,e)}):d(f,function(d){var e=[].concat(c);e.splice(0,2);e[b]=d;a.apply(null,e)})},fillGroupsForEvent:function(a,b){var d=f(a),e=d[1];e&&(e=c(e),b._ks_groups=e);b.type=d[0]},getGroupsRe:c=function(a){return RegExp(a.split(".").join(".*\\.")+"(?:\\.|$)")}}});
KISSY.add("event/base/object",function(e,f){function d(){this.timeStamp=e.now();this.currentTarget=this.target=f}var c=function(){return!1},a=function(){return!0};d.prototype={constructor:d,isDefaultPrevented:c,isPropagationStopped:c,isImmediatePropagationStopped:c,preventDefault:function(){this.isDefaultPrevented=a},stopPropagation:function(){this.isPropagationStopped=a},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=a;this.stopPropagation()},halt:function(a){a?this.stopImmediatePropagation():
this.stopPropagation();this.preventDefault()}};return d});
KISSY.add("event/base/observer",function(e,f){function d(c){e.mix(this,c)}d.prototype={constructor:d,equals:function(c){var a=this;return!!e.reduce(a.keys,function(b,d){return b&&a[d]===c[d]},1)},simpleNotify:function(c,a){var b;b=this.fn.call(this.context||a.currentTarget,c,this.data);this.once&&a.removeObserver(this);return b},notifyInternal:function(c,a){return this.simpleNotify(c,a)},notify:function(c,a){var b;if((b=c._ks_groups)&&(!this.groups||!this.groups.match(b)))return f;b=this.notifyInternal(c,
a);!1===b&&c.halt();return b}};return d});
KISSY.add("event/base/observable",function(e){function f(d){this.currentTarget=null;e.mix(this,d);this.reset()}f.prototype={constructor:f,hasObserver:function(){return!!this.observers.length},reset:function(){this.observers=[]},removeObserver:function(d){var c,a=this.observers,b=a.length;for(c=0;c<b;c++)if(a[c]==d){a.splice(c,1);break}this.checkMemory()},checkMemory:function(){},findObserver:function(d){var c=this.observers,a;for(a=c.length-1;0<=a;--a)if(d.equals(c[a]))return a;return-1}};return f});
KISSY.add("event/base",function(e,f,d,c,a){return{Utils:f,Object:d,Observer:c,Observable:a}},{requires:["./base/utils","./base/object","./base/observer","./base/observable"]});
/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 19:20
*/
KISSY.add("event",function(a,c,b){a.EventTarget=b.Target;return a.Event=a.merge(c,b)},{requires:["event/dom","event/custom"]});
/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:48
*/
KISSY.add("anim/base/queue",function(c,e){function h(b,d,a){var d=d||g,c,j=e.data(b,i);!j&&!a&&e.data(b,i,j={});j&&(c=j[d],!c&&!a&&(c=j[d]=[]));return c}var i=c.guid("ks-queue-"+c.now()+"-"),g=c.guid("ks-queue-"+c.now()+"-"),f;return f={queueCollectionKey:i,queue:function(b,c,a){b=h(b,c);b.push(a);return b},remove:function(b,d,a){var e=h(b,d,1);e&&(a=c.indexOf(a,e),-1<a&&e.splice(a,1));e&&!e.length&&f.clearQueue(b,d);return e},clearQueues:function(b){e.removeData(b,i)},clearQueue:function(b,d){var d=
d||g,a=e.data(b,i);a&&delete a[d];c.isEmptyObject(a)&&e.removeData(b,i)},dequeue:function(b,c){var a=h(b,c,1);a&&(a.shift(),a.length||f.clearQueue(b,c));return a}}},{requires:["dom"]});
KISSY.add("anim/base/utils",function(c,e,h,i){var g=c.guid("ks-anim-unqueued-"+c.now()+"-"),f=c.guid("ks-anim-paused-"+c.now()+"-");return{saveRunningAnim:function(b){var d=b.node,a=e.data(d,g);a||e.data(d,g,a={});a[c.stamp(b)]=b},removeRunningAnim:function(b){var d=b.node,a=e.data(d,g);a&&(delete a[c.stamp(b)],c.isEmptyObject(a)&&e.removeData(d,g))},isAnimPaused:function(b){var d=e.data(b.node,f);return d?!!d[c.stamp(b)]:0},removePausedAnim:function(b){var d=b.node,a=e.data(d,f);a&&(delete a[c.stamp(b)],
c.isEmptyObject(a)&&e.removeData(d,f))},savePausedAnim:function(b){var d=b.node,a=e.data(d,f);a||e.data(d,f,a={});a[c.stamp(b)]=b},isAnimRunning:function(b){var d=e.data(b.node,g);return d?!!d[c.stamp(b)]:0},isElPaused:function(b){return(b=e.data(b,f))&&!c.isEmptyObject(b)},isElRunning:function(b){return(b=e.data(b,g))&&!c.isEmptyObject(b)},pauseOrResumeQueue:function(b,d,a){b=e.data(b,"resume"==a?f:g);b=c.merge(b);c.each(b,function(b){if(d===i||b.config.queue==d)b[a]()})},stopEl:function(b,d,a,f){a&&
(f===i?h.clearQueues(b):!1!==f&&h.clearQueue(b,f));b=e.data(b,g);b=c.merge(b);c.each(b,function(a){(f===i||a.config.queue==f)&&a.stop(d)})}}},{requires:["dom","./queue"]});
KISSY.add("anim/base",function(c,e,h,i,g){function f(a){this.config=a;this.node=this.el=e.get(a.node);this._backupProps={};this._propsData={};if(a=a.complete)this.on("complete",a)}var b=e.NodeType,d={toggle:1,hide:1,show:1};c.augment(f,i.Target,{prepareFx:function(){},runInternal:function(){var a=this,f=a.config,j=a.node,g,i=a._backupProps,m=a._propsData,k=f.to,o=f.delay||0,p=f.duration;h.saveRunningAnim(a);if(!1===a.fire("beforeStart"))a.stop(0);else{c.each(k,function(a,b){c.isPlainObject(a)||(a=
{value:a});m[b]=c.mix({delay:o,easing:f.easing,frame:f.frame,duration:p},a)});if(j.nodeType==b.ELEMENT_NODE){if(k.width||k.height)k=j.style,c.mix(i,{overflow:k.overflow,"overflow-x":k.overflowX,"overflow-y":k.overflowY}),k.overflow="hidden","inline"===e.css(j,"display")&&"none"===e.css(j,"float")&&(c.UA.ie?k.zoom=1:k.display="inline-block");var n,l;l="none"===e.css(j,"display");c.each(m,function(b,c){g=b.value;if(d[g]){if("hide"==g&&l||"show"==g&&!l)return a.stop(1),n=!1;i[c]=e.style(j,c);"toggle"==
g?g=l?"show":"hide":"hide"==g?(b.value=0,i.display="none"):(b.value=e.css(j,c),e.css(j,c,0),e.show(j))}});if(!1===n)return}a.startTime=c.now();a.prepareFx();a.doStart()}},isRunning:function(){return h.isAnimRunning(this)},isPaused:function(){return h.isAnimPaused(this)},pause:function(){this.isRunning()&&(this._runTime=c.now()-this.startTime,h.removeRunningAnim(this),h.savePausedAnim(this),this.doStop());return this},doStop:function(){},doStart:function(){},resume:function(){this.isPaused()&&(this.startTime=
c.now()-this._runTime,h.removePausedAnim(this),h.saveRunningAnim(this),this.beforeResume(),this.doStart());return this},beforeResume:function(){},run:function(){var a;a=this.config.queue;!1===a?this.runInternal():(a=g.queue(this.node,a,this),1==a.length&&this.runInternal());return this},stop:function(a){var b=this.node,d=this.config.queue;if(!this.isRunning()&&!this.isPaused())return!1!==d&&g.remove(b,d,this),this;h.removeRunningAnim(this);h.removePausedAnim(this);this.doStop(a);if(a){var f;c.isEmptyObject(f=
this._backupProps)||e.css(this.node,f);this.fire("complete")}!1!==d&&(a=g.dequeue(b,d))&&a[0]&&a[0].runInternal();this.fire("end");return this}});f.Utils=h;f.Q=g;return f},{requires:["dom","./base/utils","event/custom","./base/queue"]});
/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:48
*/
KISSY.add("anim",function(b,k,g,h,i){function a(a,e,d,f,c){if(a.node)c=a;else{"string"==typeof e?(e=b.unparam(""+e,";",":"),b.each(e,function(c,a){var d=b.trim(a);d&&(e[d]=b.trim(c));(!d||d!=a)&&delete e[a]})):e=b.clone(e);if(b.isPlainObject(d))c=b.clone(d);else if(c={complete:c},d&&(c.duration=d),f)c.easing=f;c.node=a;c.to=e}c=b.merge(j,c,{useTransition:b.config("anim/useTransition")});return c.useTransition&&i?new i(c):new h(c)}var f=g.Utils,j={duration:1,easing:"linear"};b.each(["pause","resume"],
function(b){a[b]=function(a,d){return null===d||"string"==typeof d||!1===d?f.pauseOrResumeQueue(a,d,b):f.pauseOrResumeQueue(a,void 0,b)}});a.isRunning=f.isElRunning;a.isPaused=f.isElPaused;a.stop=f.stopEl;a.Easing=h.Easing;b.Anim=a;a.Q=g.Q;return a},{requires:["dom","anim/base","anim/timer",KISSY.Features.isTransitionSupported()?"anim/transition":""]});
/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 19:20
*/
KISSY.add("event/base/utils",function(e){function f(a){if(0>a.indexOf("."))return[a,""];var b=a.match(/([^.]+)?(\..+)?$/),a=[b[1]];(b=b[2])?(b=b.split(".").sort(),a.push(b.join("."))):a.push("");return a}var d,c;return{splitAndRun:d=function(a,b){e.isArray(a)?e.each(a,b):(a=e.trim(a),-1==a.indexOf(" ")?b(a):e.each(a.split(/\s+/),b))},normalizeParam:function(a,b,c){var d=b||{},d=e.isFunction(b)?{fn:b,context:c}:e.merge(d),b=f(a),a=b[0];d.groups=b[1];d.type=a;return d},batchForType:function(a,b){var c=
e.makeArray(arguments),f=c[2+b];f&&"object"==typeof f?e.each(f,function(d,f){var e=[].concat(c);e.splice(0,2);e[b]=f;e[b+1]=d;a.apply(null,e)}):d(f,function(d){var e=[].concat(c);e.splice(0,2);e[b]=d;a.apply(null,e)})},fillGroupsForEvent:function(a,b){var d=f(a),e=d[1];e&&(e=c(e),b._ks_groups=e);b.type=d[0]},getGroupsRe:c=function(a){return RegExp(a.split(".").join(".*\\.")+"(?:\\.|$)")}}});
KISSY.add("event/base/object",function(e,f){function d(){this.timeStamp=e.now();this.currentTarget=this.target=f}var c=function(){return!1},a=function(){return!0};d.prototype={constructor:d,isDefaultPrevented:c,isPropagationStopped:c,isImmediatePropagationStopped:c,preventDefault:function(){this.isDefaultPrevented=a},stopPropagation:function(){this.isPropagationStopped=a},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=a;this.stopPropagation()},halt:function(a){a?this.stopImmediatePropagation():
this.stopPropagation();this.preventDefault()}};return d});
KISSY.add("event/base/observer",function(e,f){function d(c){e.mix(this,c)}d.prototype={constructor:d,equals:function(c){var a=this;return!!e.reduce(a.keys,function(b,d){return b&&a[d]===c[d]},1)},simpleNotify:function(c,a){var b;b=this.fn.call(this.context||a.currentTarget,c,this.data);this.once&&a.removeObserver(this);return b},notifyInternal:function(c,a){return this.simpleNotify(c,a)},notify:function(c,a){var b;if((b=c._ks_groups)&&(!this.groups||!this.groups.match(b)))return f;b=this.notifyInternal(c,
a);!1===b&&c.halt();return b}};return d});
KISSY.add("event/base/observable",function(e){function f(d){this.currentTarget=null;e.mix(this,d);this.reset()}f.prototype={constructor:f,hasObserver:function(){return!!this.observers.length},reset:function(){this.observers=[]},removeObserver:function(d){var c,a=this.observers,b=a.length;for(c=0;c<b;c++)if(a[c]==d){a.splice(c,1);break}this.checkMemory()},checkMemory:function(){},findObserver:function(d){var c=this.observers,a;for(a=c.length-1;0<=a;--a)if(d.equals(c[a]))return a;return-1}};return f});
KISSY.add("event/base",function(e,f,d,c,a){return{Utils:f,Object:d,Observer:c,Observable:a}},{requires:["./base/utils","./base/object","./base/observer","./base/observable"]});
/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:48
*/
KISSY.add("anim/timer/easing",function(){function h(a){return a}function f(a,b,o,d){var m=3*a-3*o+1,e=3*o-6*a,g=3*a,c=3*b-3*d+1,h=3*d-6*b,f=3*b;return function(a){a:{for(var b=a,o,d,l=0;8>l;l++){d=((m*b+e)*b+g)*b-a;if(n(d)<j){a=b;break a}o=(3*m*b+2*e)*b+g;if(n(o)<j)break;b-=d/o}o=1;l=0;for(b=a;o>l;){d=((m*b+e)*b+g)*b-a;if(n(d)<j)break;0<d?o=b:l=b;b=(o+l)/2}a=b}return((c*a+h)*a+f)*a}}var i=Math.PI,c=Math.pow,k=Math.sin,b=parseFloat,g=/^cubic-bezier\(([^,]+),([^,]+),([^,]+),([^,]+)\)$/i,e={swing:function(a){return-Math.cos(a*
i)/2+0.5},easeNone:h,linear:h,easeIn:function(a){return a*a},ease:f(0.25,0.1,0.25,1),"ease-in":f(0.42,0,1,1),"ease-out":f(0,0,0.58,1),"ease-in-out":f(0.42,0,0.58,1),"ease-out-in":f(0,0.42,1,0.58),toFn:function(a){var j;return(j=a.match(g))?f(b(j[1]),b(j[2]),b(j[3]),b(j[4])):e[a]||h},easeOut:function(a){return(2-a)*a},easeBoth:function(a){return 1>(a*=2)?0.5*a*a:0.5*(1- --a*(a-2))},easeInStrong:function(a){return a*a*a*a},easeOutStrong:function(a){return 1- --a*a*a*a},easeBothStrong:function(a){return 1>
(a*=2)?0.5*a*a*a*a:0.5*(2-(a-=2)*a*a*a)},elasticIn:function(a){return 0===a||1===a?a:-(c(2,10*(a-=1))*k((a-0.075)*2*i/0.3))},elasticOut:function(a){return 0===a||1===a?a:c(2,-10*a)*k((a-0.075)*2*i/0.3)+1},elasticBoth:function(a){return 0===a||2===(a*=2)?a:1>a?-0.5*c(2,10*(a-=1))*k((a-0.1125)*2*i/0.45):0.5*c(2,-10*(a-=1))*k((a-0.1125)*2*i/0.45)+1},backIn:function(a){1===a&&(a-=0.001);return a*a*(2.70158*a-1.70158)},backOut:function(a){return(a-=1)*a*(2.70158*a+1.70158)+1},backBoth:function(a){var b,
o=(b=2.5949095)+1;return 1>(a*=2)?0.5*a*a*(o*a-b):0.5*((a-=2)*a*(o*a+b)+2)},bounceIn:function(a){return 1-e.bounceOut(1-a)},bounceOut:function(a){return a<1/2.75?7.5625*a*a:a<2/2.75?7.5625*(a-=1.5/2.75)*a+0.75:a<2.5/2.75?7.5625*(a-=2.25/2.75)*a+0.9375:7.5625*(a-=2.625/2.75)*a+0.984375},bounceBoth:function(a){return 0.5>a?0.5*e.bounceIn(2*a):0.5*e.bounceOut(2*a-1)+0.5}},j=1.0E-6,n=Math.abs;return e});
KISSY.add("anim/timer/manager",function(h,f){var i=h.stamp,c=h.Env.host,k=c.requestAnimationFrame,b=c.cancelAnimationFrame;if(!k)for(var g=["ms","moz","webkit","o"],e=0;e<g.length&&!k;++e)k=c[g[e]+"RequestAnimationFrame"],b=c[g[e]+"CancelAnimationFrame"]||c[g[e]+"CancelRequestAnimationFrame"];if(!k||h.UA.chrome)k=function(b){return setTimeout(b,15)},b=function(b){clearTimeout(b)};return{runnings:{},timer:null,start:function(b){var e=i(b);this.runnings[e]||(this.runnings[e]=b,this.startTimer())},stop:function(b){this.notRun(b)},
notRun:function(b){delete this.runnings[i(b)];h.isEmptyObject(this.runnings)&&this.stopTimer()},pause:function(b){this.notRun(b)},resume:function(b){this.start(b)},startTimer:function(){var b=this;b.timer||(b.timer=k(function a(){b.runFrames()?b.stopTimer():b.timer=k(a)}))},stopTimer:function(){var e=this.timer;e&&(b(e),this.timer=0)},runFrames:function(){var b,e,a=this.runnings;for(b in a)a[b].frame(),e=0;return e===f}}});
KISSY.add("anim/timer/fx",function(h,f,i){function c(b){this.load(b)}function k(b,g){return(!b.style||null==b.style[g])&&null!=f.attr(b,g,i,1)?1:0}c.prototype={isBasicFx:1,constructor:c,load:function(b){h.mix(this,b);this.pos=0;this.unit=this.unit||""},frame:function(b){this.pos=b;this.update();this.finished=this.finished||1==b},interpolate:function(b,g,e){return h.isNumber(b)&&h.isNumber(g)?(b+(g-b)*e).toFixed(3):i},update:function(){var b=this.prop,g=this.anim.node,e=this.to,c=this.interpolate(this.from,
e,this.pos);c===i?this.finished||(this.finished=1,f.css(g,b,e)):(c+=this.unit,k(g,b)?f.attr(g,b,c,1):f.css(g,b,c))},cur:function(){var b=this.prop,c=this.anim.node;if(k(c,b))return f.attr(c,b,i,1);var e,b=f.css(c,b);return isNaN(e=parseFloat(b))?!b||"auto"===b?0:b:e}};c.Factories={};c.getPos=function(b,c){var e=h.now(),f=c.duration,e=e-b.startTime-c.delay;return 0>=e?0:e>=f?1:c.easing(e/f)};c.getFx=function(b){return new (c.Factories[b.prop]||c)(b)};return c},{requires:["dom"]});
KISSY.add("anim/timer/short-hand",function(){return{background:[],border:["borderBottomWidth","borderLeftWidth","borderRightWidth","borderTopWidth"],borderBottom:["borderBottomWidth"],borderLeft:["borderLeftWidth"],borderTop:["borderTopWidth"],borderRight:["borderRightWidth"],font:["fontSize","fontWeight"],margin:["marginBottom","marginLeft","marginRight","marginTop"],padding:["paddingBottom","paddingLeft","paddingRight","paddingTop"]}});
KISSY.add("anim/timer/color",function(h,f,i,c){function k(b){var b=b+"",d;if(d=b.match(n))return[parseInt(d[1]),parseInt(d[2]),parseInt(d[3])];if(d=b.match(a))return[parseInt(d[1]),parseInt(d[2]),parseInt(d[3]),parseInt(d[4])];if(d=b.match(l)){for(b=1;b<d.length;b++)2>d[b].length&&(d[b]+=d[b]);return[parseInt(d[1],g),parseInt(d[2],g),parseInt(d[3],g)]}return j[b=b.toLowerCase()]?j[b]:[255,255,255]}function b(){b.superclass.constructor.apply(this,arguments)}var g=16,e=Math.floor,j={black:[0,0,0],silver:[192,
192,192],gray:[128,128,128],white:[255,255,255],maroon:[128,0,0],red:[255,0,0],purple:[128,0,128],fuchsia:[255,0,255],green:[0,128,0],lime:[0,255,0],olive:[128,128,0],yellow:[255,255,0],navy:[0,0,128],blue:[0,0,255],teal:[0,128,128],aqua:[0,255,255]},n=/^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,a=/^rgba\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+),\s*([0-9]+)\)$/i,l=/^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i;c.background.push("backgroundColor");c.borderColor=["borderBottomColor","borderLeftColor",
"borderRightColor","borderTopColor"];c.border.push("borderBottomColor","borderLeftColor","borderRightColor","borderTopColor");c.borderBottom.push("borderBottomColor");c.borderLeft.push("borderLeftColor");c.borderRight.push("borderRightColor");c.borderTop.push("borderTopColor");h.extend(b,i,{load:function(){b.superclass.load.apply(this,arguments);this.from&&(this.from=k(this.from));this.to&&(this.to=k(this.to))},interpolate:function(a,d,c){var l=b.superclass.interpolate;return 3==a.length&&3==d.length?
"rgb("+[e(l(a[0],d[0],c)),e(l(a[1],d[1],c)),e(l(a[2],d[2],c))].join(", ")+")":4==a.length||4==d.length?"rgba("+[e(l(a[0],d[0],c)),e(l(a[1],d[1],c)),e(l(a[2],d[2],c)),e(l(a[3]||1,d[3]||1,c))].join(", ")+")":h.log("anim/color unknown value : "+a)}});h.each("backgroundColor,borderBottomColor,borderLeftColor,borderRightColor,borderTopColor,color,outlineColor".split(","),function(a){i.Factories[a]=b});return b},{requires:["dom","./fx","./short-hand"]});
KISSY.add("anim/timer",function(h,f,i,c,k,b,g,e){function j(){var a;j.superclass.constructor.apply(this,arguments);h.each(a=this.to,function(b,d){var c=n(d);d!=c&&(a[c]=a[d],delete a[d])})}var n=f._camelCase,a=/^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;h.extend(j,c,{prepareFx:function(){var b=this.node,c=this._propsData;h.each(c,function(a){a.duration*=1E3;a.delay*=1E3;"string"==typeof a.easing&&(a.easing=k.toFn(a.easing))});h.each(e,function(a,d){var e,m=c[d],g;m&&!m.fx&&(g=m.value,e={},h.each(a,function(a){e[a]=
f.css(b,a)}),f.css(b,d,g),h.each(e,function(a,d){d in c||(c[d]=h.merge(m,{value:f.css(b,d)}));f.css(b,d,a)}),delete c[d])});var d,m,p,j,i,n,r,q;for(d in c)if(m=c[d],m.fx)m.fx.prop=d;else{p=m.value;n={prop:d,anim:this,propData:m};r=g.getFx(n);j=p;i=r.cur();p+="";q="";if(p=p.match(a)){j=parseFloat(p[2]);if((q=p[3])&&"px"!==q&&i){var s=0,t=j;do++t,f.css(b,d,t+q),s=r.cur();while(0==s);i*=t/s;f.css(b,d,i+q)}p[1]&&(j=("-="===p[1]?-1:1)*j+i)}n.from=i;n.to=j;n.unit=q;r.load(n);m.fx=r}},frame:function(){var a,
b=1,d,c,e,f,h=this._propsData;for(a in h)if(f=h[a],c=f.fx,!c.finished&&(e=g.getPos(this,f),0!=e)){c.pos=e;if(c.isBasicFx){if(c.from==c.to){c.finished=c.finished||1==e;continue}d=0;if(f.frame&&(d=f.frame(this,c),!this.isRunning()))return;!1!==d&&c.frame(c.finished||e)}else if(c.finished=c.finished||1==e,c.frame(this,c),!this.isRunning())return;b&=c.finished}(!1===this.fire("step")||b)&&this.stop(b)},doStop:function(a){var c,d,e,f=this._propsData;b.stop(this);if(a)for(c in f)if(e=f[c],(a=e.fx)&&!a.finished)a.pos=
1,a.isBasicFx?(d=0,e.frame&&(d=e.frame(this,a)),!1!==d&&a.frame(1)):a.frame(this,a),a.finished=1},doStart:function(){b.start(this)}});j.Easing=k;return j},{requires:"dom,event,./base,./timer/easing,./timer/manager,./timer/fx,./timer/short-hand,./timer/color".split(",")});
/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:48
*/
KISSY.add("anim/transition",function(c,h,k,n){function o(b){var a="";c.each(b,function(b,f){a&&(a+=",");a+=f+" "+b.duration+"s "+b.easing+" "+b.delay+"s"});return a}function j(b){j.superclass.constructor.apply(this,arguments)}var l=c.Features.getTransitionPrefix(),m=l?l.toLowerCase()+"TransitionEnd":"transitionend",i=c.Features.getTransitionProperty();c.extend(j,n,{doStart:function(){var b=this,a=b.node,d=a.style,f=b._propsData,e=d[i],g={};c.each(f,function(f,d){var e=f.value,c=h.css(a,d);"number"==
typeof e&&(c=parseFloat(c));c==e&&setTimeout(function(){b._onTransitionEnd({originalEvent:{propertyName:d}})},0);g[d]=e});-1!=e.indexOf("none")?e="":e&&(e+=",");d[i]=e+o(f);k.on(a,m,b._onTransitionEnd,b);h.css(a,g)},beforeResume:function(){var b=this._propsData,a=c.merge(b),d=this._runTime/1E3;c.each(a,function(a,e){var c=d;a.delay>=c?a.delay-=c:(c-=a.delay,a.delay=0,a.duration>=c?a.duration-=c:delete b[e])})},_onTransitionEnd:function(b){var b=b.originalEvent,a=1,d=this._propsData;d[b.propertyName]&&
(d[b.propertyName].finished=1,c.each(d,function(b){if(!b.finished)return a=0,!1}),a&&this.stop(!0))},doStop:function(b){var a=this.node,d=a.style,f=this._propsData,e=[],g={};k.detach(a,m,this._onTransitionEnd,this);c.each(f,function(c,d){b||(g[d]=h.css(a,d));e.push(d)});f=c.trim(d[i].replace(RegExp("(^|,)\\s*(?:"+e.join("|")+")\\s+[^,]+","gi"),"$1")).replace(/^,|,,|,$/g,"")||"none";d[i]=f;h.css(a,g)}});return j},{requires:["dom","event","./base"]});
﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 16 12:06
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 dom/base/api
 dom/base/attr
 dom/base/class
 dom/base/create
 dom/base/data
 dom/base/insertion
 dom/base/offset
 dom/base/style
 dom/base/selector
 dom/base/traversal
 dom/base
*/

/**
 * @ignore
 * dom
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/api', function (S) {

    var WINDOW = S.Env.host || {},
        DOCUMENT = WINDOW.document,
        UA = S.UA,
        RE_NUM = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,
        /**
         * Dom Element node type.
         * @enum {Number} KISSY.DOM.NodeType
         */
            NodeType = {
            /**
             * element type
             */
            ELEMENT_NODE: 1,
            /**
             * attribute node type
             */
            'ATTRIBUTE_NODE': 2,
            /**
             * text node type
             */
            TEXT_NODE: 3,
            /**
             * cdata node type
             */
            'CDATA_SECTION_NODE': 4,
            /**
             * entity reference node type
             */
            'ENTITY_REFERENCE_NODE': 5,
            /**
             * entity node type
             */
            'ENTITY_NODE': 6,
            /**
             * processing instruction node type
             */
            'PROCESSING_INSTRUCTION_NODE': 7,
            /**
             * comment node type
             */
            COMMENT_NODE: 8,
            /**
             * document node type
             */
            DOCUMENT_NODE: 9,
            /**
             * document type
             */
            'DOCUMENT_TYPE_NODE': 10,
            /**
             * document fragment type
             */
            DOCUMENT_FRAGMENT_NODE: 11,
            /**
             * notation type
             */
            'NOTATION_NODE': 12
        },
        /**
         * KISSY Dom Utils.
         * Provides Dom helper methods.
         * @class KISSY.DOM
         * @singleton
         */
            Dom = {

            /**
             * Whether has been set a custom domain.
             * Note not perfect: localhost:8888, domain='localhost'
             * @param {window} [win] Test window. Default current window.
             * @return {Boolean}
             */
            isCustomDomain: function (win) {
                win = win || WINDOW;
                win = Dom.get(win);
                var domain = win.document.domain,
                    hostname = win.location.hostname;
                return domain != hostname &&
                    domain != ( '[' + hostname + ']' );	// IPv6 IP support
            },

            /**
             * Get appropriate src for new empty iframe.
             * Consider custom domain.
             * @param {window} [win] Window new iframe will be inserted into.
             * @return {String} Src for iframe.
             */
            getEmptyIframeSrc: function (win) {
                win = win || WINDOW;
                win = Dom.get(win);
                if (UA['ie'] && Dom.isCustomDomain(win)) {
                    return  'javascript:void(function(){' + encodeURIComponent(
                        'document.open();' +
                            "document.domain='" +
                            win.document.domain
                            + "';" +
                            'document.close();') + '}())';
                }
                return '';
            },

            NodeType: NodeType,

            /**
             * Return corresponding window if elem is document or window.
             * Return global window if elem is undefined
             * Else return false.
             * @param {undefined|window|HTMLDocument} [elem]
             * @return {window|Boolean}
             */
            getWindow: function (elem) {
                if (!elem) {
                    return WINDOW;
                }

                elem = Dom.get(elem);

                if (S.isWindow(elem)) {
                    return elem;
                }

                var doc = elem;

                if (doc.nodeType !== NodeType.DOCUMENT_NODE) {
                    doc = elem.ownerDocument;
                }

                return doc.defaultView || doc.parentWindow;
            },


            /**
             * Return corresponding document of this element.
             * @param {Element|window|HTMLDocument} [elem]
             * @return {HTMLDocument}
             */
            getDocument: function (elem) {
                if (!elem) {
                    return DOCUMENT;
                }
                elem = Dom.get(elem);
                return S.isWindow(elem) ?
                    elem['document'] :
                    (elem.nodeType == NodeType.DOCUMENT_NODE ?
                        elem :
                        elem.ownerDocument);
            },

            isDomNodeList: function (o) {
                // 注1：ie 下，有 window.item, typeof node.item 在 ie 不同版本下，返回值不同
                // 注2：select 等元素也有 item, 要用 !node.nodeType 排除掉
                // 注3：通过 namedItem 来判断不可靠
                // 注4：getElementsByTagName 和 querySelectorAll 返回的集合不同
                // 注5: 考虑 iframe.contentWindow
                return o && !o.nodeType && o.item && !o.setTimeout;
            },

            /**
             * Get node 's nodeName in lowercase.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
             * @return {String} el 's nodeName in lowercase
             */
            nodeName: function (selector) {
                var el = Dom.get(selector),
                    nodeName = el.nodeName.toLowerCase();
                // http://msdn.microsoft.com/en-us/library/ms534388(VS.85).aspx
                if (UA['ie']) {
                    var scopeName = el['scopeName'];
                    if (scopeName && scopeName != 'HTML') {
                        nodeName = scopeName.toLowerCase() + ':' + nodeName;
                    }
                }
                return nodeName;
            },

            _RE_NUM_NO_PX: new RegExp("^(" + RE_NUM + ")(?!px)[a-z%]+$", "i")
        };

    S.mix(Dom, NodeType);

    return Dom;

});

/*
 2011-08
 - 添加节点类型枚举值，方便依赖程序清晰
 */
/**
 * @ignore
 * dom-attr
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/attr', function (S, Dom, undefined) {

    var doc = S.Env.host.document,
        NodeType = Dom.NodeType,
        docElement = doc && doc.documentElement,
        EMPTY = '',
        nodeName = Dom.nodeName,
        R_BOOLEAN = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
        R_FOCUSABLE = /^(?:button|input|object|select|textarea)$/i,
        R_CLICKABLE = /^a(?:rea)?$/i,
        R_INVALID_CHAR = /:|^on/,
        R_RETURN = /\r/g,

        attrFix = {
        },

        attrFn = {
            val: 1,
            css: 1,
            html: 1,
            text: 1,
            data: 1,
            width: 1,
            height: 1,
            offset: 1,
            scrollTop: 1,
            scrollLeft: 1
        },

        attrHooks = {
            // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
            tabindex: {
                get: function (el) {
                    // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
                    var attributeNode = el.getAttributeNode('tabindex');
                    return attributeNode && attributeNode.specified ?
                        parseInt(attributeNode.value, 10) :
                        R_FOCUSABLE.test(el.nodeName) ||
                            R_CLICKABLE.test(el.nodeName) && el.href ?
                            0 :
                            undefined;
                }
            }
        },

        propFix = {
            'hidefocus': 'hideFocus',
            tabindex: 'tabIndex',
            readonly: 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            maxlength: 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            rowspan: 'rowSpan',
            colspan: 'colSpan',
            usemap: 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        },

    // Hook for boolean attributes
    // if bool is false
    // - standard browser returns null
    // - ie<8 return false
    // - norm to undefined
        boolHook = {
            get: function (elem, name) {
                // 转发到 prop 方法
                return Dom.prop(elem, name) ?
                    // 根据 w3c attribute , true 时返回属性名字符串
                    name.toLowerCase() :
                    undefined;
            },
            set: function (elem, value, name) {
                var propName;
                if (value === false) {
                    // Remove boolean attributes when set to false
                    Dom.removeAttr(elem, name);
                } else {
                    // 直接设置 true,因为这是 bool 类属性
                    propName = propFix[ name ] || name;
                    if (propName in elem) {
                        // Only set the IDL specifically if it already exists on the element
                        elem[ propName ] = true;
                    }
                    elem.setAttribute(name, name.toLowerCase());
                }
                return name;
            }
        },

        propHooks = {
        },

    // get attribute value from attribute node, only for ie
        attrNodeHook = {
        },

        valHooks = {

            select: {
                // fix for multiple select
                get: function (elem) {
                    var index = elem.selectedIndex,
                        options = elem.options,
                        ret,
                        i,
                        len,
                        one = (String(elem.type) === 'select-one');

                    // Nothing was selected
                    if (index < 0) {
                        return null;
                    } else if (one) {
                        return Dom.val(options[index]);
                    }

                    // Loop through all the selected options
                    ret = [];
                    i = 0;
                    len = options.length;
                    for (; i < len; ++i) {
                        if (options[i].selected) {
                            ret.push(Dom.val(options[i]));
                        }
                    }
                    // Multi-Selects return an array
                    return ret;
                },

                set: function (elem, value) {
                    var values = S.makeArray(value),
                        opts = elem.options;
                    S.each(opts, function (opt) {
                        opt.selected = S.inArray(Dom.val(opt), values);
                    });

                    if (!values.length) {
                        elem.selectedIndex = -1;
                    }
                    return values;
                }
            }

        };

    // Radios and checkboxes getter/setter
    S.each(['radio', 'checkbox'], function (r) {
        valHooks[r] = {
            get: function (elem) {
                // Handle the case where in Webkit '' is returned instead of 'on'
                // if a value isn't specified
                return elem.getAttribute('value') === null ? 'on' : elem.value;
            },
            set: function (elem, value) {
                if (S.isArray(value)) {
                    return elem.checked = S.inArray(Dom.val(elem), value);
                }
                return undefined;
            }
        };
    });

    // IE7- 下，需要用 cssText 来获取
    // 所有浏览器统一下, attr('style') 标准浏览器也不是 undefined
    attrHooks['style'] = {
        get: function (el) {
            return el.style.cssText;
        }
    };

    function getProp(elem, name) {
        name = propFix[name] || name;
        var hook = propHooks[name];
        if (hook && hook.get) {
            return hook.get(elem, name);
        } else {
            return elem[name];
        }
    }

    S.mix(Dom,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {

            _valHooks: valHooks,

            _propFix: propFix,

            _attrHooks: attrHooks,

            _propHooks: propHooks,

            _attrNodeHook: attrNodeHook,

            _attrFix: attrFix,

            /**
             * Get the value of a property for the first element in the set of matched elements.
             * or
             * Set one or more properties for the set of matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector matched elements
             * @param {String|Object} name
             * The name of the property to set.
             * or
             * A map of property-value pairs to set.
             * @param [value] A value to set for the property.
             * @return {String|undefined|Boolean}
             */
            prop: function (selector, name, value) {
                var elems = Dom.query(selector),
                    i,
                    elem,
                    hook;

                // supports hash
                if (S.isPlainObject(name)) {
                    S.each(name, function (v, k) {
                        Dom.prop(elems, k, v);
                    });
                    return undefined;
                }

                // Try to normalize/fix the name
                name = propFix[ name ] || name;
                hook = propHooks[ name ];
                if (value !== undefined) {
                    for (i = elems.length - 1; i >= 0; i--) {
                        elem = elems[i];
                        if (hook && hook.set) {
                            hook.set(elem, value, name);
                        } else {
                            elem[ name ] = value;
                        }
                    }
                } else {
                    if (elems.length) {
                        return getProp(elems[0], name);
                    }
                }
                return undefined;
            },

            /**
             * Whether one of the matched elements has specified property name
             * @param {HTMLElement[]|String|HTMLElement} selector 元素
             * @param {String} name The name of property to test
             * @return {Boolean}
             */
            hasProp: function (selector, name) {
                var elems = Dom.query(selector),
                    i,
                    len = elems.length,
                    el;
                for (i = 0; i < len; i++) {
                    el = elems[i];
                    if (getProp(el, name) !== undefined) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * Remove a property for the set of matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector matched elements
             * @param {String} name The name of the property to remove.
             */
            removeProp: function (selector, name) {
                name = propFix[ name ] || name;
                var elems = Dom.query(selector),
                    i,
                    el;
                for (i = elems.length - 1; i >= 0; i--) {
                    el = elems[i];
                    try {
                        el[ name ] = undefined;
                        delete el[ name ];
                    } catch (e) {
                        // S.log('delete el property error : ');
                        // S.log(e);
                    }
                }
            },

            /**
             * Get the value of an attribute for the first element in the set of matched elements.
             * or
             * Set one or more attributes for the set of matched elements.
             * @param {HTMLElement[]|HTMLElement|String} selector matched elements
             * @param {String|Object} name The name of the attribute to set. or A map of attribute-value pairs to set.
             * @param [val] A value to set for the attribute.
             * @param [pass] internal use by anim
             * @return {String|undefined}
             */
            attr: function (selector, name, val, /*internal use by anim/fx*/pass) {
                /*
                 Hazards From Caja Note:

                 - In IE[67], el.setAttribute doesn't work for attributes like
                 'class' or 'for'.  IE[67] expects you to set 'className' or
                 'htmlFor'.  Caja use setAttributeNode solves this problem.

                 - In IE[67], <input> elements can shadow attributes.  If el is a
                 form that contains an <input> named x, then el.setAttribute(x, y)
                 will set x's value rather than setting el's attribute.  Using
                 setAttributeNode solves this problem.

                 - In IE[67], the style attribute can only be modified by setting
                 el.style.cssText.  Neither setAttribute nor setAttributeNode will
                 work.  el.style.cssText isn't bullet-proof, since it can be
                 shadowed by <input> elements.

                 - In IE[67], you can never change the type of an <button> element.
                 setAttribute('type') silently fails, but setAttributeNode
                 throws an exception.  caja : the silent failure. KISSY throws error.

                 - In IE[67], you can never change the type of an <input> element.
                 setAttribute('type') throws an exception.  We want the exception.

                 - In IE[67], setAttribute is case-sensitive, unless you pass 0 as a
                 3rd argument.  setAttributeNode is case-insensitive.

                 - Trying to set an invalid name like ':' is supposed to throw an
                 error.  In IE[678] and Opera 10, it fails without an error.
                 */

                var els = Dom.query(selector),
                    attrNormalizer,
                    i,
                    el = els[0],
                    ret;

                // supports hash
                if (S.isPlainObject(name)) {
                    pass = val;
                    for (var k in name) {
                        Dom.attr(els, k, name[k], pass);
                    }
                    return undefined;
                }

                // attr functions
                if (pass && attrFn[name]) {
                    return Dom[name](selector, val);
                }

                // scrollLeft
                name = name.toLowerCase();

                if (pass && attrFn[name]) {
                    return Dom[name](selector, val);
                }

                // custom attrs
                name = attrFix[name] || name;

                if (R_BOOLEAN.test(name)) {
                    attrNormalizer = boolHook;
                }
                // only old ie?
                else if (R_INVALID_CHAR.test(name)) {
                    attrNormalizer = attrNodeHook;
                } else {
                    attrNormalizer = attrHooks[name];
                }

                if (val === undefined) {
                    if (el && el.nodeType === NodeType.ELEMENT_NODE) {
                        // browsers index elements by id/name on forms, give priority to attributes.
                        if (nodeName(el) == 'form') {
                            attrNormalizer = attrNodeHook;
                        }
                        if (attrNormalizer && attrNormalizer.get) {
                            return attrNormalizer.get(el, name);
                        }

                        ret = el.getAttribute(name);

                        if (ret === "") {
                            var attrNode = el.getAttributeNode(name);
                            if (!attrNode || !attrNode.specified) {
                                return undefined;
                            }
                        }

                        // standard browser non-existing attribute return null
                        // ie<8 will return undefined , because it return property
                        // so norm to undefined
                        return ret === null ? undefined : ret;
                    }
                } else {
                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        if (el && el.nodeType === NodeType.ELEMENT_NODE) {
                            if (nodeName(el) == 'form') {
                                attrNormalizer = attrNodeHook;
                            }
                            if (attrNormalizer && attrNormalizer.set) {
                                attrNormalizer.set(el, val, name);
                            } else {
                                // convert the value to a string (all browsers do this but IE)
                                el.setAttribute(name, EMPTY + val);
                            }
                        }
                    }
                }
                return undefined;
            },

            /**
             * Remove an attribute from each element in the set of matched elements.
             * @param {HTMLElement[]|String} selector matched elements
             * @param {String} name An attribute to remove
             */
            removeAttr: function (selector, name) {
                name = name.toLowerCase();
                name = attrFix[name] || name;
                var els = Dom.query(selector),
                    propName,
                    el, i;
                for (i = els.length - 1; i >= 0; i--) {
                    el = els[i];
                    if (el.nodeType == NodeType.ELEMENT_NODE) {
                        el.removeAttribute(name);
                        // Set corresponding property to false for boolean attributes
                        if (R_BOOLEAN.test(name) && (propName = propFix[ name ] || name) in el) {
                            el[ propName ] = false;
                        }
                    }
                }
            },

            /**
             * Whether one of the matched elements has specified attribute
             * @method
             * @param {HTMLElement[]|String} selector matched elements
             * @param {String} name The attribute to be tested
             * @return {Boolean}
             */
            hasAttr: docElement && !docElement.hasAttribute ?
                function (selector, name) {
                    name = name.toLowerCase();
                    var elems = Dom.query(selector),
                        i, el,
                        attrNode;
                    // from ppk :http://www.quirksmode.org/dom/w3c_core.html
                    // IE5-7 doesn't return the value of a style attribute.
                    // var $attr = el.attributes[name];
                    for (i = 0; i < elems.length; i++) {
                        el = elems[i];
                        attrNode = el.getAttributeNode(name);
                        if (attrNode && attrNode.specified) {
                            return true;
                        }
                    }
                    return false;
                } :
                function (selector, name) {
                    var elems = Dom.query(selector), i,
                        len = elems.length;
                    for (i = 0; i < len; i++) {
                        //使用原生实现
                        if (elems[i].hasAttribute(name)) {
                            return true;
                        }
                    }
                    return false;
                },

            /**
             * Get the current value of the first element in the set of matched elements.
             * or
             * Set the value of each element in the set of matched elements.
             * @param {HTMLElement[]|String} selector matched elements
             * @param {String|String[]} [value] A string of text or an array of strings corresponding to the value of each matched element to set as selected/checked.
             * @return {undefined|String|String[]|Number}
             */
            val: function (selector, value) {
                var hook, ret, elem, els, i, val;

                //getter
                if (value === undefined) {

                    elem = Dom.get(selector);

                    if (elem) {
                        hook = valHooks[ nodeName(elem) ] || valHooks[ elem.type ];

                        if (hook && 'get' in hook &&
                            (ret = hook.get(elem, 'value')) !== undefined) {
                            return ret;
                        }

                        ret = elem.value;

                        return typeof ret === 'string' ?
                            // handle most common string cases
                            ret.replace(R_RETURN, '') :
                            // handle cases where value is null/undefined or number
                            ret == null ? '' : ret;
                    }

                    return undefined;
                }

                els = Dom.query(selector);
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    if (elem.nodeType !== 1) {
                        return undefined;
                    }

                    val = value;

                    // Treat null/undefined as ''; convert numbers to string
                    if (val == null) {
                        val = '';
                    } else if (typeof val === 'number') {
                        val += '';
                    } else if (S.isArray(val)) {
                        val = S.map(val, function (value) {
                            return value == null ? '' : value + '';
                        });
                    }

                    hook = valHooks[ nodeName(elem)] || valHooks[ elem.type ];

                    // If set returns undefined, fall back to normal setting
                    if (!hook || !('set' in hook) || hook.set(elem, val, 'value') === undefined) {
                        elem.value = val;
                    }
                }
                return undefined;
            },

            /**
             * Get the combined text contents of each element in the set of matched elements, including their descendants.
             * or
             * Set the content of each element in the set of matched elements to the specified text.
             * @param {HTMLElement[]|HTMLElement|String} selector matched elements
             * @param {String} [val] A string of text to set as the content of each matched element.
             * @return {String|undefined}
             */
            text: function (selector, val) {
                var el, els, i, nodeType;
                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    el = Dom.get(selector);
                    return Dom._getText(el);
                } else {
                    els = Dom.query(selector);
                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        nodeType = el.nodeType;
                        if (nodeType == NodeType.ELEMENT_NODE) {
                            Dom.empty(el);
                            el.appendChild(el.ownerDocument.createTextNode(val));
                        }
                        else if (nodeType == NodeType.TEXT_NODE || nodeType == NodeType.CDATA_SECTION_NODE) {
                            el.nodeValue = val;
                        }
                    }
                }
                return undefined;
            },

            _getText: function (el) {
                return el.textContent;
            }
        });

    return Dom;
}, {
    requires: ['./api']
});
/*
 NOTES:
 yiminghe@gmail.com: 2013-03-19
 - boolean property 和 attribute ie 和其他浏览器不一致，统一为类似 ie8：
 - attr('checked',string) == .checked=true setAttribute('checked','checked') // ie8 相同 setAttribute()
 - attr('checked',false) == removeAttr('check') // ie8 不同, setAttribute ie8 相当于 .checked=true setAttribute('checked','checked')
 - removeAttr('checked') == .checked=false removeAttribute('checked') // ie8 removeAttribute 相同

 yiminghe@gmail.com: 2012-11-27
 - 拆分 ie attr，条件加载

 yiminghe@gmail.com：2011-06-03
 - 借鉴 jquery 1.6,理清 attribute 与 property

 yiminghe@gmail.com：2011-01-28
 - 处理 tabindex，顺便重构

 2010.03
 - 在 jquery/support.js 中，special attrs 里还有 maxlength, cellspacing,
 rowspan, colspan, usemap, frameborder, 但测试发现，在 Grade-A 级浏览器中
 并无兼容性问题。
 - 当 colspan/rowspan 属性值设置有误时，ie7- 会自动纠正，和 href 一样，需要传递
 第 2 个参数来解决。jQuery 未考虑，存在兼容性 bug.
 - jQuery 考虑了未显式设定 tabindex 时引发的兼容问题，kissy 里忽略（太不常用了）
 - jquery/attributes.js: Safari mis-reports the default selected
 property of an option 在 Safari 4 中已修复。

 */
/**
 * batch class operation
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/base/class', function (S, Dom) {

    var slice = [].slice,
        NodeType = Dom.NodeType,
        RE_SPLIT = /[\.\s]\s*\.?/;

    function strToArray(str) {
        str = S.trim(str || '');
        var arr = str.split(RE_SPLIT),
            newArr = [], v,
            l = arr.length,
            i = 0;
        for (; i < l; i++) {
            if (v = arr[i]) {
                newArr.push(v);
            }
        }
        return newArr;
    }

    function batchClassList(method) {
        return function (elem, classNames) {
            var i, l,
                className,
                classList = elem.classList,
                extraArgs = slice.call(arguments, 2);
            for (i = 0, l = classNames.length; i < l; i++) {
                if (className = classNames[i]) {
                    classList[method].apply(classList, [className].concat(extraArgs));
                }
            }
        }
    }

    function batchEls(method) {
        return function (selector, className) {
            var classNames = strToArray(className),
                extraArgs = slice.call(arguments, 2);
            Dom.query(selector).each(function (elem) {
                if (elem.nodeType == NodeType.ELEMENT_NODE) {
                    Dom[method].apply(Dom, [elem, classNames].concat(extraArgs));
                }
            });
        }
    }

    S.mix(Dom,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {
            _hasClass: function (elem, classNames) {
                var i, l, className, classList = elem.classList;
                if (classList.length) {
                    for (i = 0, l = classNames.length; i < l; i++) {
                        className = classNames[i];
                        if (className && !classList.contains(className)) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            },

            _addClass: batchClassList('add'),

            _removeClass: batchClassList('remove'),

            _toggleClass: batchClassList('toggle'),

            /**
             * Determine whether any of the matched elements are assigned the given classes.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @method
             * @param {String} className One or more class names to search for.
             * multiple class names is separated by space
             * @return {Boolean}
             */
            hasClass: function (selector, className) {
                var elem = Dom.get(selector);
                return elem && elem.nodeType == NodeType.ELEMENT_NODE && Dom._hasClass(elem, strToArray(className));
            },

            /**
             * Replace a class with another class for matched elements.
             * If no oldClassName is present, the newClassName is simply added.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @method
             * @param {String} oldClassName One or more class names to be removed from the class attribute of each matched element.
             * multiple class names is separated by space
             * @param {String} newClassName One or more class names to be added to the class attribute of each matched element.
             * multiple class names is separated by space
             */
            replaceClass: function (selector, oldClassName, newClassName) {
                Dom.removeClass(selector, oldClassName);
                Dom.addClass(selector, newClassName);
            },

            /**
             * Adds the specified class(es) to each of the set of matched elements.
             * @method
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} className One or more class names to be added to the class attribute of each matched element.
             * multiple class names is separated by space
             */
            addClass: batchEls('_addClass'),

            /**
             * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @method
             * @param {String} className One or more class names to be removed from the class attribute of each matched element.
             * multiple class names is separated by space
             */
            removeClass: batchEls('_removeClass'),

            /**
             * Add or remove one or more classes from each element in the set of
             * matched elements, depending on either the class's presence or the
             * value of the switch argument.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} className One or more class names to be added to the class attribute of each matched element.
             * multiple class names is separated by space
             * @method
             */
            toggleClass: batchEls('_toggleClass')
            // @param [state] {Boolean} optional boolean to indicate whether class
            // should be added or removed regardless of current state.
            // latest firefox/ie10 does not support
        });

    return Dom;

}, {
    requires: ['./api']
});

/*
 http://jsperf.com/kissy-classlist-vs-classname 17157:14741
 http://jsperf.com/kissy-1-3-vs-jquery-on-dom-class 15721:15223

 NOTES:
 - hasClass/addClass/removeClass 的逻辑和 jQuery 保持一致
 - toggleClass 不支持 value 为 undefined 的情形（jQuery 支持）
 */
/**
 * @ignore
 * dom-create
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('dom/base/create', function (S, Dom, undefined) {

    var doc = S.Env.host.document,
        NodeType = Dom.NodeType,
        UA = S.UA,
        ie = UA['ie'],
        DIV = 'div',
        PARENT_NODE = 'parentNode',
        DEFAULT_DIV = doc && doc.createElement(DIV),
        R_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        RE_TAG = /<([\w:]+)/,
        R_LEADING_WHITESPACE = /^\s+/,
        R_TAIL_WHITESPACE = /\s+$/,
        lostLeadingTailWhitespace = ie && ie < 9,
        R_HTML = /<|&#?\w+;/,
        supportOuterHTML = doc && 'outerHTML' in doc.documentElement,
        RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

    // help compression
    function getElementsByTagName(el, tag) {
        return el.getElementsByTagName(tag);
    }

    function cleanData(els) {
        var DOMEvent = S.require('event/dom');
        if (DOMEvent) {
            DOMEvent.detach(els);
        }
        Dom.removeData(els);
    }

    function defaultCreator(html, ownerDoc) {
        var frag = ownerDoc && ownerDoc != doc ?
            ownerDoc.createElement(DIV) :
            DEFAULT_DIV;
        // html 为 <style></style> 时不行，必须有其他元素？
        frag.innerHTML = 'm<div>' + html + '<' + '/div>';
        return frag.lastChild;
    }

    S.mix(Dom,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {

            /**
             * Creates Dom elements on the fly from the provided string of raw HTML.
             * @param {String} html A string of HTML to create on the fly. Note that this parses HTML, not XML.
             * @param {Object} [props] An map of attributes on the newly-created element.
             * @param {HTMLDocument} [ownerDoc] A document in which the new elements will be created
             * @param {Boolean} [_trim]
             * @return {DocumentFragment|HTMLElement}
             */
            create: function (html, props, ownerDoc, _trim/*internal*/) {

                var ret = null;

                if (!html) {
                    return ret;
                }

                if (html.nodeType) {
                    return Dom.clone(html);
                }


                if (typeof html != 'string') {
                    return ret;
                }

                if (_trim === undefined) {
                    _trim = true;
                }

                if (_trim) {
                    html = S.trim(html);
                }

                var creators = Dom._creators,
                    holder,
                    whitespaceMatch,
                    context = ownerDoc || doc,
                    m,
                    tag = DIV,
                    k,
                    nodes;

                if (!R_HTML.test(html)) {
                    ret = context.createTextNode(html);
                }
                // 简单 tag, 比如 Dom.create('<p>')
                else if ((m = RE_SIMPLE_TAG.exec(html))) {
                    ret = context.createElement(m[1]);
                }
                // 复杂情况，比如 Dom.create('<img src='sprite.png' />')
                else {
                    // Fix 'XHTML'-style tags in all browsers
                    html = html.replace(R_XHTML_TAG, '<$1><' + '/$2>');

                    if ((m = RE_TAG.exec(html)) && (k = m[1])) {
                        tag = k.toLowerCase();
                    }

                    holder = (creators[tag] || defaultCreator)(html, context);
                    // ie 把前缀空白吃掉了
                    if (lostLeadingTailWhitespace &&
                        (whitespaceMatch = html.match(R_LEADING_WHITESPACE))) {
                        holder.insertBefore(context.createTextNode(whitespaceMatch[0]),
                            holder.firstChild);
                    }
                    if (lostLeadingTailWhitespace && /\S/.test(html) &&
                        (whitespaceMatch = html.match(R_TAIL_WHITESPACE))) {
                        holder.appendChild(context.createTextNode(whitespaceMatch[0]));
                    }

                    nodes = holder.childNodes;

                    if (nodes.length === 1) {
                        // return single node, breaking parentNode ref from 'fragment'
                        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
                    } else if (nodes.length) {
                        // return multiple nodes as a fragment
                        ret = nodeListToFragment(nodes);
                    } else {
                        S.error(html + ' : create node error');
                    }
                }

                return attachProps(ret, props);
            },

            _fixCloneAttributes: function (src, dest) {
                // value of textarea can not be clone in chrome/firefox??
                if (Dom.nodeName(src) === 'textarea') {
                    dest.defaultValue = src.defaultValue;
                    dest.value = src.value;
                }
            },

            _creators: {
                div: defaultCreator
            },

            _defaultCreator: defaultCreator,

            /**
             * Get the HTML contents of the first element in the set of matched elements.
             * or
             * Set the HTML contents of each element in the set of matched elements.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} [htmlString]  A string of HTML to set as the content of each matched element.
             * @param {Boolean} [loadScripts=false] True to look for and process scripts
             */
            html: function (selector, htmlString, loadScripts) {
                // supports css selector/Node/NodeList
                var els = Dom.query(selector),
                    el = els[0],
                    success = false,
                    valNode,
                    i, elem;
                if (!el) {
                    return null;
                }
                // getter
                if (htmlString === undefined) {
                    // only gets value on the first of element nodes
                    if (el.nodeType == NodeType.ELEMENT_NODE) {
                        return el.innerHTML;
                    } else {
                        return null;
                    }
                }
                // setter
                else {
                    htmlString += '';

                    // faster
                    // fix #103,some html element can not be set through innerHTML
                    if (!htmlString.match(/<(?:script|style|link)/i) &&
                        (!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[ (htmlString.match(RE_TAG) || ['', ''])[1].toLowerCase() ]) {

                        try {
                            for (i = els.length - 1; i >= 0; i--) {
                                elem = els[i];
                                if (elem.nodeType == NodeType.ELEMENT_NODE) {
                                    cleanData(getElementsByTagName(elem, '*'));
                                    elem.innerHTML = htmlString;
                                }
                            }
                            success = true;
                        } catch (e) {
                            // a <= '<a>'
                            // a.innerHTML='<p>1</p>';
                        }

                    }

                    if (!success) {
                        valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
                        Dom.empty(els);
                        Dom.append(valNode, els, loadScripts);
                    }
                }
                return undefined;
            },

            /**
             * Get the outerHTML of the first element in the set of matched elements.
             * or
             * Set the outerHTML of each element in the set of matched elements.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} [htmlString]  A string of HTML to set as outerHTML of each matched element.
             * @param {Boolean} [loadScripts=false] True to look for and process scripts
             */
            outerHtml: function (selector, htmlString, loadScripts) {
                var els = Dom.query(selector),
                    holder,
                    i,
                    valNode,
                    ownerDoc,
                    length = els.length,
                    el = els[0];
                if (!el) {
                    return null;
                }
                // getter
                if (htmlString === undefined) {
                    if (supportOuterHTML) {
                        return el.outerHTML
                    } else {
                        ownerDoc = el.ownerDocument;
                        holder = ownerDoc && ownerDoc != doc ?
                            ownerDoc.createElement(DIV) :
                            DEFAULT_DIV;
                        holder.innerHTML = '';
                        holder.appendChild(Dom.clone(el, true));
                        holder.appendChild(Dom.clone(el, true));
                        return holder.innerHTML;
                    }
                } else {
                    htmlString += '';
                    if (!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML) {
                        for (i = length - 1; i >= 0; i--) {
                            el = els[i];
                            if (el.nodeType == NodeType.ELEMENT_NODE) {
                                cleanData(el);
                                cleanData(getElementsByTagName(el, '*'));
                                el.outerHTML = htmlString;
                            }
                        }
                    } else {
                        valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
                        Dom.insertBefore(valNode, els, loadScripts);
                        Dom.remove(els);
                    }
                }
                return undefined;
            },

            /**
             * Remove the set of matched elements from the Dom.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {Boolean} [keepData=false] whether keep bound events and jQuery data associated with the elements from removed.
             */
            remove: function (selector, keepData) {
                var el,
                    els = Dom.query(selector),
                    all,
                    parent,
                    DOMEvent = S.require('event/dom'),
                    i;
                for (i = els.length - 1; i >= 0; i--) {
                    el = els[i];
                    if (!keepData && el.nodeType == NodeType.ELEMENT_NODE) {
                        all = S.makeArray(getElementsByTagName(el, '*'));
                        all.push(el);
                        Dom.removeData(all);
                        if (DOMEvent) {
                            DOMEvent.detach(all);
                        }
                    }
                    if (parent = el.parentNode) {
                        parent.removeChild(el);
                    }
                }
            },

            /**
             * Create a deep copy of the first of matched elements.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {Boolean|Object} [deep=false] whether perform deep copy or copy config.
             * @param {Boolean} [deep.deep] whether perform deep copy
             * @param {Boolean} [deep.withDataAndEvent=false] A Boolean indicating
             * whether event handlers and data should be copied along with the elements.
             * @param {Boolean} [deep.deepWithDataAndEvent=false]
             * A Boolean indicating whether event handlers and data for all children of the cloned element should be copied.
             * if set true then deep argument must be set true as well.
             * @param {Boolean} [withDataAndEvent=false] A Boolean indicating
             * whether event handlers and data should be copied along with the elements.
             * @param {Boolean} [deepWithDataAndEvent=false]
             * A Boolean indicating whether event handlers and data for all children of the cloned element should be copied.
             * if set true then deep argument must be set true as well.
             * refer: https://developer.mozilla.org/En/Dom/Node.cloneNode
             * @return {HTMLElement}
             * @member KISSY.DOM
             */
            clone: function (selector, deep, withDataAndEvent, deepWithDataAndEvent) {
                if (typeof deep === 'object') {
                    deepWithDataAndEvent = deep['deepWithDataAndEvent'];
                    withDataAndEvent = deep['withDataAndEvent'];
                    deep = deep['deep'];
                }

                var elem = Dom.get(selector),
                    clone,
                    _fixCloneAttributes = Dom._fixCloneAttributes,
                    elemNodeType;

                if (!elem) {
                    return null;
                }

                elemNodeType = elem.nodeType;

                // TODO
                // ie bug :
                // 1. ie<9 <script>xx</script> => <script></script>
                // 2. ie will execute external script
                clone = /**
                 @type HTMLElement
                 @ignore*/elem.cloneNode(deep);

                if (elemNodeType == NodeType.ELEMENT_NODE ||
                    elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
                    // IE copies events bound via attachEvent when using cloneNode.
                    // Calling detachEvent on the clone will also remove the events
                    // from the original. In order to get around this, we use some
                    // proprietary methods to clear the events. Thanks to MooTools
                    // guys for this hotness.
                    if (_fixCloneAttributes && elemNodeType == NodeType.ELEMENT_NODE) {
                        _fixCloneAttributes(elem, clone);
                    }

                    if (deep && _fixCloneAttributes) {
                        processAll(_fixCloneAttributes, elem, clone);
                    }
                }
                // runtime 获得事件模块
                if (withDataAndEvent) {
                    cloneWithDataAndEvent(elem, clone);
                    if (deep && deepWithDataAndEvent) {
                        processAll(cloneWithDataAndEvent, elem, clone);
                    }
                }
                return clone;
            },

            /**
             * Remove(include data and event handlers) all child nodes of the set of matched elements from the Dom.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             */
            empty: function (selector) {
                var els = Dom.query(selector),
                    el, i;
                for (i = els.length - 1; i >= 0; i--) {
                    el = els[i];
                    Dom.remove(el.childNodes);
                }
            },

            _nodeListToFragment: nodeListToFragment
        });

    // compatibility
    Dom.outerHTML=Dom.outerHtml;

    function processAll(fn, elem, clone) {
        var elemNodeType = elem.nodeType;
        if (elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
            var eCs = elem.childNodes,
                cloneCs = clone.childNodes,
                fIndex = 0;
            while (eCs[fIndex]) {
                if (cloneCs[fIndex]) {
                    processAll(fn, eCs[fIndex], cloneCs[fIndex]);
                }
                fIndex++;
            }
        } else if (elemNodeType == NodeType.ELEMENT_NODE) {
            var elemChildren = getElementsByTagName(elem, '*'),
                cloneChildren = getElementsByTagName(clone, '*'),
                cIndex = 0;
            while (elemChildren[cIndex]) {
                if (cloneChildren[cIndex]) {
                    fn(elemChildren[cIndex], cloneChildren[cIndex]);
                }
                cIndex++;
            }
        }
    }

    // 克隆除了事件的 data
    function cloneWithDataAndEvent(src, dest) {
        var DOMEvent = S.require('event/dom'),
            srcData,
            d;

        if (dest.nodeType == NodeType.ELEMENT_NODE && !Dom.hasData(src)) {
            return;
        }

        srcData = Dom.data(src);

        // 浅克隆，data 也放在克隆节点上
        for (d in srcData) {
            Dom.data(dest, d, srcData[d]);
        }

        // 事件要特殊点
        if (DOMEvent) {
            // attach src 's event data and dom attached listener to dest
            DOMEvent.clone(src, dest);
        }
    }

    // 添加成员到元素中
    function attachProps(elem, props) {
        if (S.isPlainObject(props)) {
            if (elem.nodeType == NodeType.ELEMENT_NODE) {
                Dom.attr(elem, props, true);
            }
            // document fragment
            else if (elem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
                Dom.attr(elem.childNodes, props, true);
            }
        }
        return elem;
    }

    // 将 nodeList 转换为 fragment
    function nodeListToFragment(nodes) {
        var ret = null,
            i,
            ownerDoc,
            len;
        if (nodes && (nodes.push || nodes.item) && nodes[0]) {
            ownerDoc = nodes[0].ownerDocument;
            ret = ownerDoc.createDocumentFragment();
            nodes = S.makeArray(nodes);
            for (i = 0, len = nodes.length; i < len; i++) {
                ret.appendChild(nodes[i]);
            }
        } else {
            S.log('Unable to convert ' + nodes + ' to fragment.');
        }
        return ret;
    }

    // 残缺元素处理
    var creators = Dom._creators,
        create = Dom.create,
        creatorsMap = {
            option: 'select',
            optgroup: 'select',
            area: 'map',
            thead: 'table',
            td: 'tr',
            th: 'tr',
            tr: 'tbody',
            tbody: 'table',
            tfoot: 'table',
            caption: 'table',
            colgroup: 'table',
            col: 'colgroup',
            legend: 'fieldset'
        }, p;

    for (p in creatorsMap) {
        (function (tag) {
            creators[p] = function (html, ownerDoc) {
                return create('<' + tag + '>' +
                    html + '<' + '/' + tag + '>',
                    null, ownerDoc);
            };
        })(creatorsMap[p]);
    }

    return Dom;
}, {
    requires: ['./api']
});

/*
 2012-01-31
 remove spurious tbody

 2011-10-13
 empty , html refactor

 2011-08-22
 clone 实现，参考 jq

 2011-08
 remove 需要对子孙节点以及自身清除事件以及自定义 data
 create 修改，支持 <style></style> ie 下直接创建
 */
/**
 * @ignore
 * dom-data
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('dom/base/data', function (S, Dom, undefined) {

    var win = S.Env.host,
        EXPANDO = '_ks_data_' + S.now(), // 让每一份 kissy 的 expando 都不同
        dataCache = { }, // 存储 node 节点的 data
        winDataCache = { }, // 避免污染全局


    // The following elements throw uncatchable exceptions if you
    // attempt to add expando properties to them.
        noData = {
        };
    noData['applet'] = 1;
    noData['object'] = 1;
    noData['embed'] = 1;

    var commonOps = {
        hasData: function (cache, name) {
            if (cache) {
                if (name !== undefined) {
                    if (name in cache) {
                        return true;
                    }
                } else if (!S.isEmptyObject(cache)) {
                    return true;
                }
            }
            return false;
        }
    };

    var objectOps = {
        hasData: function (ob, name) {
            // 只判断当前窗口，iframe 窗口内数据直接放入全局变量
            if (ob == win) {
                return objectOps.hasData(winDataCache, name);
            }
            // 直接建立在对象内
            var thisCache = ob[EXPANDO];
            return commonOps.hasData(thisCache, name);
        },

        data: function (ob, name, value) {
            if (ob == win) {
                return objectOps.data(winDataCache, name, value);
            }
            var cache = ob[EXPANDO];
            if (value !== undefined) {
                cache = ob[EXPANDO] = ob[EXPANDO] || {};
                cache[name] = value;
            } else {
                if (name !== undefined) {
                    return cache && cache[name];
                } else {
                    cache = ob[EXPANDO] = ob[EXPANDO] || {};
                    return cache;
                }
            }
        },
        removeData: function (ob, name) {
            if (ob == win) {
                return objectOps.removeData(winDataCache, name);
            }
            var cache = ob[EXPANDO];
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    objectOps.removeData(ob);
                }
            } else {
                try {
                    // ob maybe window in iframe
                    // ie will throw error
                    delete ob[EXPANDO];
                } catch (e) {
                    ob[EXPANDO] = undefined;
                }
            }
        }
    };

    var domOps = {
        hasData: function (elem, name) {
            var key = elem[EXPANDO];
            if (!key) {
                return false;
            }
            var thisCache = dataCache[key];
            return commonOps.hasData(thisCache, name);
        },

        data: function (elem, name, value) {
            if (noData[elem.nodeName.toLowerCase()]) {
                return undefined;
            }
            var key = elem[EXPANDO], cache;
            if (!key) {
                // 根本不用附加属性
                if (name !== undefined &&
                    value === undefined) {
                    return undefined;
                }
                // 节点上关联键值也可以
                key = elem[EXPANDO] = S.guid();
            }
            cache = dataCache[key];
            if (value !== undefined) {
                // 需要新建
                cache = dataCache[key] = dataCache[key] || {};
                cache[name] = value;
            } else {
                if (name !== undefined) {
                    return cache && cache[name];
                } else {
                    // 需要新建
                    cache = dataCache[key] = dataCache[key] || {};
                    return cache;
                }
            }
        },

        removeData: function (elem, name) {
            var key = elem[EXPANDO], cache;
            if (!key) {
                return;
            }
            cache = dataCache[key];
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    domOps.removeData(elem);
                }
            } else {
                delete dataCache[key];
                try {
                    delete elem[EXPANDO];
                } catch (e) {
                    elem[EXPANDO] = undefined;
                    //S.log('delete expando error : ');
                    //S.log(e);
                }
                if (elem.removeAttribute) {
                    elem.removeAttribute(EXPANDO);
                }
            }
        }
    };


    S.mix(Dom,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {

            __EXPANDO: EXPANDO,

            /**
             * Determine whether an element has any data or specified data name associated with it.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String} [name] A string naming the piece of data to set.
             * @return {Boolean}
             */
            hasData: function (selector, name) {
                var ret = false,
                    elems = Dom.query(selector);
                for (var i = 0; i < elems.length; i++) {
                    var elem = elems[i];
                    if (elem.nodeType) {
                        ret = domOps.hasData(elem, name);
                    } else {
                        // window
                        ret = objectOps.hasData(elem, name);
                    }
                    if (ret) {
                        return ret;
                    }
                }
                return ret;
            },

            /**
             * If name set and data unset Store arbitrary data associated with the specified element. Returns undefined.
             * or
             * If name set and data unset returns value at named data store for the element
             * or
             * If name unset and data unset returns the full data store for the element.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String} [name] A string naming the piece of data to set.
             * @param [data] The new data value.
             * @return {Object|undefined}
             */
            data: function (selector, name, data) {

                var elems = Dom.query(selector), elem = elems[0];

                // supports hash
                if (S.isPlainObject(name)) {
                    for (var k in name) {
                        Dom.data(elems, k, name[k]);
                    }
                    return undefined;
                }

                // getter
                if (data === undefined) {
                    if (elem) {
                        if (elem.nodeType) {
                            return domOps.data(elem, name);
                        } else {
                            // window
                            return objectOps.data(elem, name);
                        }
                    }
                }
                // setter
                else {
                    for (var i = elems.length - 1; i >= 0; i--) {
                        elem = elems[i];
                        if (elem.nodeType) {
                            domOps.data(elem, name, data);
                        } else {
                            // window
                            objectOps.data(elem, name, data);
                        }
                    }
                }
                return undefined;
            },

            /**
             * Remove a previously-stored piece of data from matched elements.
             * or
             * Remove all data from matched elements if name unset.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String} [name] A string naming the piece of data to delete.
             */
            removeData: function (selector, name) {
                var els = Dom.query(selector), elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    if (elem.nodeType) {
                        domOps.removeData(elem, name);
                    } else {
                        // window
                        objectOps.removeData(elem, name);
                    }
                }
            }
        });

    return Dom;

}, {
    requires: ['./api']
});
/*
 yiminghe@gmail.com：2011-05-31
 - 分层，节点和普通对象分开处理
 */
/**
 * @ignore
 * dom-insertion
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/insertion', function (S, Dom) {

    var PARENT_NODE = 'parentNode',
        NodeType = Dom.NodeType,
        RE_FORM_EL = /^(?:button|input|object|select|textarea)$/i,
        getNodeName = Dom.nodeName,
        makeArray = S.makeArray,
        splice = [].splice,
        NEXT_SIBLING = 'nextSibling',
        R_SCRIPT_TYPE = /\/(java|ecma)script/i;

    function isJs(el) {
        return !el.type || R_SCRIPT_TYPE.test(el.type);
    }

    // extract script nodes and execute alone later
    function filterScripts(nodes, scripts) {
        var ret = [], i, el, nodeName;
        for (i = 0; nodes[i]; i++) {
            el = nodes[i];
            nodeName = getNodeName(el);
            if (el.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
                ret.push.apply(ret, filterScripts(makeArray(el.childNodes), scripts));
            } else if (nodeName === 'script' && isJs(el)) {
                // remove script to make sure ie9 does not invoke when append
                if (el.parentNode) {
                    el.parentNode.removeChild(el)
                }
                if (scripts) {
                    scripts.push(el);
                }
            } else {
                if (el.nodeType == NodeType.ELEMENT_NODE &&
                    // ie checkbox getElementsByTagName 后造成 checked 丢失
                    !RE_FORM_EL.test(nodeName)) {
                    var tmp = [],
                        s,
                        j,
                        ss = el.getElementsByTagName('script');
                    for (j = 0; j < ss.length; j++) {
                        s = ss[j];
                        if (isJs(s)) {
                            tmp.push(s);
                        }
                    }
                    splice.apply(nodes, [i + 1, 0].concat(tmp));
                }
                ret.push(el);
            }
        }
        return ret;
    }

    // execute script
    function evalScript(el) {
        if (el.src) {
            S.getScript(el.src);
        } else {
            var code = S.trim(el.text || el.textContent || el.innerHTML || '');
            if (code) {
                S.globalEval(code);
            }
        }
    }

    // fragment is easier than nodelist
    function insertion(newNodes, refNodes, fn, scripts) {
        newNodes = Dom.query(newNodes);

        if (scripts) {
            scripts = [];
        }

        // filter script nodes ,process script separately if needed
        newNodes = filterScripts(newNodes, scripts);

        // Resets defaultChecked for any radios and checkboxes
        // about to be appended to the Dom in IE 6/7
        if (Dom._fixInsertionChecked) {
            Dom._fixInsertionChecked(newNodes);
        }

        refNodes = Dom.query(refNodes);

        var newNodesLength = newNodes.length,
            newNode,
            i,
            refNode,
            node,
            clonedNode,
            refNodesLength = refNodes.length;

        if ((!newNodesLength && (!scripts || !scripts.length)) || !refNodesLength) {
            return;
        }

        // fragment 插入速度快点
        // 而且能够一个操作达到批量插入
        // refer: http://www.w3.org/TR/REC-Dom-Level-1/level-one-core.html#ID-B63ED1A3
        newNode = Dom._nodeListToFragment(newNodes);
        //fragment 一旦插入里面就空了，先复制下
        if (refNodesLength > 1) {
            clonedNode = Dom.clone(newNode, true);
            refNodes = S.makeArray(refNodes)
        }

        for (i = 0; i < refNodesLength; i++) {
            refNode = refNodes[i];
            if (newNode) {
                //refNodes 超过一个，clone
                node = i > 0 ? Dom.clone(clonedNode, true) : newNode;
                fn(node, refNode);
            }
            if (scripts && scripts.length) {
                S.each(scripts, evalScript);
            }
        }
    }

    // loadScripts default to false to prevent xss
    S.mix(Dom,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {

            _fixInsertionChecked: null,

            /**
             * Insert every element in the set of newNodes before every element in the set of refNodes.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} refNodes Nodes to be referred
             * @param {Boolean} [loadScripts] whether execute script node
             */
            insertBefore: function (newNodes, refNodes, loadScripts) {
                insertion(newNodes, refNodes, function (newNode, refNode) {
                    if (refNode[PARENT_NODE]) {
                        refNode[PARENT_NODE].insertBefore(newNode, refNode);
                    }
                }, loadScripts);
            },

            /**
             * Insert every element in the set of newNodes after every element in the set of refNodes.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} refNodes Nodes to be referred
             * @param {Boolean} [loadScripts] whether execute script node
             */
            insertAfter: function (newNodes, refNodes, loadScripts) {
                insertion(newNodes, refNodes, function (newNode, refNode) {
                    if (refNode[PARENT_NODE]) {
                        refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
                    }
                }, loadScripts);
            },

            /**
             * Insert every element in the set of newNodes to the end of every element in the set of parents.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} parents Nodes to be referred as parentNode
             * @param {Boolean} [loadScripts] whether execute script node
             */
            appendTo: function (newNodes, parents, loadScripts) {
                insertion(newNodes, parents, function (newNode, parent) {
                    parent.appendChild(newNode);
                }, loadScripts);
            },

            /**
             * Insert every element in the set of newNodes to the beginning of every element in the set of parents.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} parents Nodes to be referred as parentNode
             * @param {Boolean} [loadScripts] whether execute script node
             */
            prependTo: function (newNodes, parents, loadScripts) {
                insertion(newNodes, parents, function (newNode, parent) {
                    parent.insertBefore(newNode, parent.firstChild);
                }, loadScripts);
            },

            /**
             * Wrap a node around all elements in the set of matched elements
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
             */
            wrapAll: function (wrappedNodes, wrapperNode) {
                // deep clone
                wrapperNode = Dom.clone(Dom.get(wrapperNode), true);
                wrappedNodes = Dom.query(wrappedNodes);
                if (wrappedNodes[0].parentNode) {
                    Dom.insertBefore(wrapperNode, wrappedNodes[0]);
                }
                var c;
                while ((c = wrapperNode.firstChild) && c.nodeType == 1) {
                    wrapperNode = c;
                }
                Dom.appendTo(wrappedNodes, wrapperNode);
            },

            /**
             * Wrap a node around each element in the set of matched elements
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
             */
            wrap: function (wrappedNodes, wrapperNode) {
                wrappedNodes = Dom.query(wrappedNodes);
                wrapperNode = Dom.get(wrapperNode);
                S.each(wrappedNodes, function (w) {
                    Dom.wrapAll(w, wrapperNode);
                });
            },

            /**
             * Wrap a node around the childNodes of each element in the set of matched elements.
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
             */
            wrapInner: function (wrappedNodes, wrapperNode) {
                wrappedNodes = Dom.query(wrappedNodes);
                wrapperNode = Dom.get(wrapperNode);
                S.each(wrappedNodes, function (w) {
                    var contents = w.childNodes;
                    if (contents.length) {
                        Dom.wrapAll(contents, wrapperNode);
                    } else {
                        w.appendChild(wrapperNode);
                    }
                });
            },

            /**
             * Remove the parents of the set of matched elements from the Dom,
             * leaving the matched elements in their place.
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             */
            unwrap: function (wrappedNodes) {
                wrappedNodes = Dom.query(wrappedNodes);
                S.each(wrappedNodes, function (w) {
                    var p = w.parentNode;
                    Dom.replaceWith(p, p.childNodes);
                });
            },

            /**
             * Replace each element in the set of matched elements with the provided newNodes.
             * @param {HTMLElement|HTMLElement[]|String} selector set of matched elements
             * @param {HTMLElement|HTMLElement[]|String} newNodes new nodes to replace the matched elements
             */
            replaceWith: function (selector, newNodes) {
                var nodes = Dom.query(selector);
                newNodes = Dom.query(newNodes);
                Dom.remove(newNodes, true);
                Dom.insertBefore(newNodes, nodes);
                Dom.remove(nodes);
            }
        });
    S.each({
        'prepend': 'prependTo',
        'append': 'appendTo',
        'before': 'insertBefore',
        'after': 'insertAfter'
    }, function (value, key) {
        Dom[key] = Dom[value];
    });
    return Dom;
}, {
    requires: ['./api']
});

/*
 2012-04-05 yiminghe@gmail.com
 - 增加 replaceWith/wrap/wrapAll/wrapInner/unwrap

 2011-05-25
 - yiminghe@gmail.com：参考 jquery 处理多对多的情形 :http://api.jquery.com/append/
 Dom.append('.multi1','.multi2');

 */
/**
 * @ignore
 * dom-offset
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('dom/base/offset', function (S, Dom, undefined) {

    var win = S.Env.host,
        UA = S.UA,
        doc = win.document,
        NodeType = Dom.NodeType,
        docElem = doc && doc.documentElement,
        getWindow = Dom.getWindow,
        CSS1Compat = 'CSS1Compat',
        compatMode = 'compatMode',
        MAX = Math.max,
        POSITION = 'position',
        RELATIVE = 'relative',
        DOCUMENT = 'document',
        BODY = 'body',
        DOC_ELEMENT = 'documentElement',
        VIEWPORT = 'viewport',
        SCROLL = 'scroll',
        CLIENT = 'client',
        LEFT = 'left',
        TOP = 'top',
        isNumber = S.isNumber,
        SCROLL_LEFT = SCROLL + 'Left',
        SCROLL_TOP = SCROLL + 'Top';

    S.mix(Dom,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {

            /**
             * Get the current coordinates of the first element in the set of matched elements, relative to the document.
             * or
             * Set the current coordinates of every element in the set of matched elements, relative to the document.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Object} [coordinates ] An object containing the properties top and left,
             * which are integers indicating the new top and left coordinates for the elements.
             * @param {Number} [coordinates.left ] the new top and left coordinates for the elements.
             * @param {Number} [coordinates.top ] the new top and top coordinates for the elements.
             * @param {window} [relativeWin] The window to measure relative to. If relativeWin
             *     is not in the ancestor frame chain of the element, we measure relative to
             *     the top-most window.
             * @return {Object|undefined} if Get, the format of returned value is same with coordinates.
             */
            offset: function (selector, coordinates, relativeWin) {
                // getter
                if (coordinates === undefined) {
                    var elem = Dom.get(selector),
                        ret;
                    if (elem) {
                        ret = getOffset(elem, relativeWin);
                    }
                    return ret;
                }
                // setter
                var els = Dom.query(selector), i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    setOffset(elem, coordinates);
                }
                return undefined;
            },

            /**
             * scrolls the first of matched elements into container view
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|HTMLElement|HTMLDocument} [container=window] Container element
             * @param {Boolean|Object} [alignWithTop=true]If true, the scrolled element is aligned with the top of the scroll area.
             * If false, it is aligned with the bottom.
             * @param {Boolean} [alignWithTop.allowHorizontalScroll=true] Whether trigger horizontal scroll.
             * @param {Boolean} [alignWithTop.onlyScrollIfNeeded=false] scrollIntoView when element is out of view
             * and set top to false or true automatically if top is undefined
             * @param {Boolean} [allowHorizontalScroll=true] Whether trigger horizontal scroll.
             * refer: http://www.w3.org/TR/2009/WD-html5-20090423/editing.html#scrollIntoView
             *        http://www.sencha.com/deploy/dev/docs/source/Element.scroll-more.html#scrollIntoView
             *        http://yiminghe.javaeye.com/blog/390732
             */
            scrollIntoView: function (selector, container, alignWithTop, allowHorizontalScroll) {
                var elem,
                    onlyScrollIfNeeded;

                if (!(elem = Dom.get(selector))) {
                    return;
                }

                if (container) {
                    container = Dom.get(container);
                }

                if (!container) {
                    container = elem.ownerDocument;
                }

                // document 归一化到 window
                if (container.nodeType == NodeType.DOCUMENT_NODE) {
                    container = getWindow(container);
                }

                if (S.isPlainObject(alignWithTop)) {
                    allowHorizontalScroll = alignWithTop.allowHorizontalScroll;
                    onlyScrollIfNeeded = alignWithTop.onlyScrollIfNeeded;
                    alignWithTop = alignWithTop.alignWithTop;
                }

                allowHorizontalScroll = allowHorizontalScroll === undefined ? true : allowHorizontalScroll;

                var isWin = S.isWindow(container),
                    elemOffset = Dom.offset(elem),
                    eh = Dom.outerHeight(elem),
                    ew = Dom.outerWidth(elem),
                    containerOffset,
                    ch,
                    cw,
                    containerScroll,
                    diffTop,
                    diffBottom,
                    win,
                    winScroll,
                    ww,
                    wh;

                if (isWin) {
                    win = container;
                    wh = Dom.height(win);
                    ww = Dom.width(win);
                    winScroll = {
                        left: Dom.scrollLeft(win),
                        top: Dom.scrollTop(win)
                    };
                    // elem 相对 container 可视视窗的距离
                    diffTop = {
                        left: elemOffset[LEFT] - winScroll[LEFT],
                        top: elemOffset[TOP] - winScroll[TOP]
                    };
                    diffBottom = {
                        left: elemOffset[LEFT] + ew - (winScroll[LEFT] + ww),
                        top: elemOffset[TOP] + eh - (winScroll[TOP] + wh)
                    };
                    containerScroll = winScroll;
                }
                else {
                    containerOffset = Dom.offset(container);
                    ch = container.clientHeight;
                    cw = container.clientWidth;
                    containerScroll = {
                        left: Dom.scrollLeft(container),
                        top: Dom.scrollTop(container)
                    };
                    // elem 相对 container 可视视窗的距离
                    // 注意边框 , offset 是边框到根节点
                    diffTop = {
                        left: elemOffset[LEFT] - (containerOffset[LEFT] +
                            (parseFloat(Dom.css(container, 'borderLeftWidth')) || 0)),
                        top: elemOffset[TOP] - (containerOffset[TOP] +
                            (parseFloat(Dom.css(container, 'borderTopWidth')) || 0))
                    };
                    diffBottom = {
                        left: elemOffset[LEFT] + ew -
                            (containerOffset[LEFT] + cw +
                                (parseFloat(Dom.css(container, 'borderRightWidth')) || 0)),
                        top: elemOffset[TOP] + eh -
                            (containerOffset[TOP] + ch +
                                (parseFloat(Dom.css(container, 'borderBottomWidth')) || 0))
                    };
                }

                if (onlyScrollIfNeeded) {
                    if (diffTop.top < 0 || diffBottom.top > 0) {
                        // 强制向上
                        if (alignWithTop === true) {
                            Dom.scrollTop(container, containerScroll.top + diffTop.top);
                        } else if (alignWithTop === false) {
                            Dom.scrollTop(container, containerScroll.top + diffBottom.top);
                        } else {
                            // 自动调整
                            if (diffTop.top < 0) {
                                Dom.scrollTop(container, containerScroll.top + diffTop.top);
                            } else {
                                Dom.scrollTop(container, containerScroll.top + diffBottom.top);
                            }
                        }
                    }
                } else {
                    alignWithTop = alignWithTop === undefined ? true : !!alignWithTop;
                    if (alignWithTop) {
                        Dom.scrollTop(container, containerScroll.top + diffTop.top);
                    } else {
                        Dom.scrollTop(container, containerScroll.top + diffBottom.top);
                    }
                }

                if (allowHorizontalScroll) {
                    if (onlyScrollIfNeeded) {
                        if (diffTop.left < 0 || diffBottom.left > 0) {
                            // 强制向上
                            if (alignWithTop === true) {
                                Dom.scrollLeft(container, containerScroll.left + diffTop.left);
                            } else if (alignWithTop === false) {
                                Dom.scrollLeft(container, containerScroll.left + diffBottom.left);
                            } else {
                                // 自动调整
                                if (diffTop.left < 0) {
                                    Dom.scrollLeft(container, containerScroll.left + diffTop.left);
                                } else {
                                    Dom.scrollLeft(container, containerScroll.left + diffBottom.left);
                                }
                            }
                        }
                    } else {
                        alignWithTop = alignWithTop === undefined ? true : !!alignWithTop;
                        if (alignWithTop) {
                            Dom.scrollLeft(container, containerScroll.left + diffTop.left);
                        } else {
                            Dom.scrollLeft(container, containerScroll.left + diffBottom.left);
                        }
                    }
                }
            },

            /**
             * Get the width of document
             * @param {window} [win=window] Window to be referred.
             * @method
             */
            docWidth: 0,
            /**
             * Get the height of document
             * @param {window} [win=window] Window to be referred.
             * @method
             */
            docHeight: 0,
            /**
             * Get the height of window
             * @param {window} [win=window] Window to be referred.
             * @method
             */
            viewportHeight: 0,
            /**
             * Get the width of document
             * @param {window} [win=window] Window to be referred.
             * @method
             */
            viewportWidth: 0,
            /**
             * Get the current vertical position of the scroll bar for the first element in the set of matched elements.
             * or
             * Set the current vertical position of the scroll bar for each of the set of matched elements.
             * @param {HTMLElement[]|String|HTMLElement|window} selector matched elements
             * @param {Number} value An integer indicating the new position to set the scroll bar to.
             * @method
             */
            scrollTop: 0,
            /**
             * Get the current horizontal position of the scroll bar for the first element in the set of matched elements.
             * or
             * Set the current horizontal position of the scroll bar for each of the set of matched elements.
             * @param {HTMLElement[]|String|HTMLElement|window} selector matched elements
             * @param {Number} value An integer indicating the new position to set the scroll bar to.
             * @method
             */
            scrollLeft: 0
        });

// http://old.jr.pl/www.quirksmode.org/viewport/compatibility.html
// http://www.quirksmode.org/dom/w3c_cssom.html
// add ScrollLeft/ScrollTop getter/setter methods
    S.each(['Left', 'Top'], function (name, i) {
        var method = SCROLL + name;

        Dom[method] = function (elem, v) {
            if (isNumber(elem)) {
                return arguments.callee(win, elem);
            }
            elem = Dom.get(elem);
            var ret,
                left,
                top,
                w,
                d;
            if (elem && elem.nodeType == NodeType.ELEMENT_NODE) {
                if (v !== undefined) {
                    elem[method] = parseFloat(v)
                } else {
                    ret = elem[method];
                }
            } else {
                w = getWindow(elem);
                if (v !== undefined) {
                    v = parseFloat(v);
                    // 注意多 window 情况，不能简单取 win
                    left = name == 'Left' ? v : Dom.scrollLeft(w);
                    top = name == 'Top' ? v : Dom.scrollTop(w);
                    w['scrollTo'](left, top);
                } else {
                    //标准
                    //chrome == body.scrollTop
                    //firefox/ie9 == documentElement.scrollTop
                    ret = w[ 'page' + (i ? 'Y' : 'X') + 'Offset'];
                    if (!isNumber(ret)) {
                        d = w[DOCUMENT];
                        //ie6,7,8 standard mode
                        ret = d[DOC_ELEMENT][method];
                        if (!isNumber(ret)) {
                            //quirks mode
                            ret = d[BODY][method];
                        }
                    }
                }
            }
            return ret;
        }
    });

// add docWidth/Height, viewportWidth/Height getter methods
    S.each(['Width', 'Height'], function (name) {
        Dom['doc' + name] = function (refWin) {
            refWin = Dom.get(refWin);
            var d = Dom.getDocument(refWin);
            return MAX(
                //firefox chrome documentElement.scrollHeight< body.scrollHeight
                //ie standard mode : documentElement.scrollHeight> body.scrollHeight
                d[DOC_ELEMENT][SCROLL + name],
                //quirks : documentElement.scrollHeight 最大等于可视窗口多一点？
                d[BODY][SCROLL + name],
                Dom[VIEWPORT + name](d));
        };

        Dom[VIEWPORT + name] = function (refWin) {
            refWin = Dom.get(refWin);
            var win = getWindow(refWin);
            var ret = win['inner' + name];
            if (UA.mobile && ret) {
                return ret;
            }
            // pc browser includes scrollbar in window.innerWidth
            var prop = CLIENT + name,
                doc = win[DOCUMENT],
                body = doc[BODY],
                documentElement = doc[DOC_ELEMENT],
                documentElementProp = documentElement[prop];
            // 标准模式取 documentElement
            // backcompat 取 body
            return doc[compatMode] === CSS1Compat
                && documentElementProp ||
                body && body[ prop ] || documentElementProp;
        };
    });

    function getClientPosition(elem) {
        var box, x , y ,
            doc = elem.ownerDocument,
            body = doc.body;

        if (!elem.getBoundingClientRect) {
            return {
                left: 0,
                top: 0
            };
        }

        // 根据 GBS 最新数据，A-Grade Browsers 都已支持 getBoundingClientRect 方法，不用再考虑传统的实现方式
        box = elem.getBoundingClientRect();

        // 注：jQuery 还考虑减去 docElem.clientLeft/clientTop
        // 但测试发现，这样反而会导致当 html 和 body 有边距/边框样式时，获取的值不正确
        // 此外，ie6 会忽略 html 的 margin 值，幸运地是没有谁会去设置 html 的 margin

        x = box[LEFT];
        y = box[TOP];

        // In IE, most of the time, 2 extra pixels are added to the top and left
        // due to the implicit 2-pixel inset border.  In IE6/7 quirks mode and
        // IE6 standards mode, this border can be overridden by setting the
        // document element's border to zero -- thus, we cannot rely on the
        // offset always being 2 pixels.

        // In quirks mode, the offset can be determined by querying the body's
        // clientLeft/clientTop, but in standards mode, it is found by querying
        // the document element's clientLeft/clientTop.  Since we already called
        // getClientBoundingRect we have already forced a reflow, so it is not
        // too expensive just to query them all.

        // ie 下应该减去窗口的边框吧，毕竟默认 absolute 都是相对窗口定位的
        // 窗口边框标准是设 documentElement ,quirks 时设置 body
        // 最好禁止在 body 和 html 上边框 ，但 ie < 9 html 默认有 2px ，减去
        // 但是非 ie 不可能设置窗口边框，body html 也不是窗口 ,ie 可以通过 html,body 设置
        // 标准 ie 下 docElem.clientTop 就是 border-top
        // ie7 html 即窗口边框改变不了。永远为 2
        // 但标准 firefox/chrome/ie9 下 docElem.clientTop 是窗口边框，即使设了 border-top 也为 0

        x -= docElem.clientLeft || body.clientLeft || 0;
        y -= docElem.clientTop || body.clientTop || 0;

        return { left: x, top: y };
    }


    function getPageOffset(el) {
        var pos = getClientPosition(el),
            w = getWindow(el);
        pos.left += Dom[SCROLL_LEFT](w);
        pos.top += Dom[SCROLL_TOP](w);
        return pos;
    }

// 获取 elem 相对 elem.ownerDocument 的坐标
    function getOffset(el, relativeWin) {
        var position = {left: 0, top: 0},

        // Iterate up the ancestor frame chain, keeping track of the current window
        // and the current element in that window.
            currentWin = getWindow(el),
            offset,
            currentEl = el;
        relativeWin = relativeWin || currentWin;

        do {
            // if we're at the top window, we want to get the page offset.
            // if we're at an inner frame, we only want to get the window position
            // so that we can determine the actual page offset in the context of
            // the outer window.
            offset = currentWin == relativeWin ?
                getPageOffset(currentEl) :
                getClientPosition(currentEl);
            position.left += offset.left;
            position.top += offset.top;
        } while (currentWin &&
            currentWin != relativeWin &&
            (currentEl = currentWin['frameElement']) &&
            (currentWin = currentWin.parent));

        return position;
    }

// 设置 elem 相对 elem.ownerDocument 的坐标
    function setOffset(elem, offset) {
        // set position first, in-case top/left are set even on static elem
        if (Dom.css(elem, POSITION) === 'static') {
            elem.style[POSITION] = RELATIVE;
        }

        var old = getOffset(elem),
            ret = { },
            current, key;

        for (key in offset) {
            current = parseFloat(Dom.css(elem, key)) || 0;
            ret[key] = current + offset[key] - old[key];
        }
        Dom.css(elem, ret);
    }

    return Dom;
}, {
    requires: ['./api']
});

/*
 2012-03-30
 - refer: http://www.softcomplex.com/docs/get_window_size_and_scrollbar_position.html
 - http://help.dottoro.com/ljkfqbqj.php
 - http://www.boutell.com/newfaq/creating/sizeofclientarea.html

 2011-05-24
 - yiminghe@gmail.com：
 - 调整 docWidth , docHeight ,
 viewportHeight , viewportWidth ,scrollLeft,scrollTop 参数，
 便于放置到 Node 中去，可以完全摆脱 Dom，完全使用 Node


 TODO:
 - 考虑是否实现 jQuery 的 position, offsetParent 等功能
 - 更详细的测试用例（比如：测试 position 为 fixed 的情况）
 */
/**
 * @ignore
 * dom/style
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/style', function (S, Dom, undefined) {
    var
        WINDOW = /**
         @ignore
         @type window
         */S.Env.host,
        UA = S.UA,
        getNodeName = Dom.nodeName,
        doc = WINDOW.document,
        STYLE = 'style',
        RE_MARGIN = /^margin/,
        WIDTH = 'width',
        HEIGHT = 'height',
        DISPLAY = 'display',
        OLD_DISPLAY = DISPLAY + S.now(),
        NONE = 'none',
        cssNumber = {
            'fillOpacity': 1,
            'fontWeight': 1,
            'lineHeight': 1,
            'opacity': 1,
            'orphans': 1,
            'widows': 1,
            'zIndex': 1,
            'zoom': 1
        },
        rmsPrefix = /^-ms-/,
    // ie9+
        R_UPPER = /([A-Z]|^ms)/g,
        EMPTY = '',
        DEFAULT_UNIT = 'px',
        NO_PX_REG = /\d(?!px)[a-z%]+$/i,
        CUSTOM_STYLES = {},
        cssProps = {
            'float': 'cssFloat'
        },
        defaultDisplay = {},
        RE_DASH = /-([a-z])/ig;

    function upperCase() {
        return arguments[1].toUpperCase();
    }

    function camelCase(name) {
        // fix #92, ms!
        return name.replace(rmsPrefix, 'ms-').replace(RE_DASH, upperCase);
    }

    function getDefaultDisplay(tagName) {
        var body,
            oldDisplay = defaultDisplay[ tagName ],
            elem;
        if (!defaultDisplay[ tagName ]) {
            body = doc.body || doc.documentElement;
            elem = doc.createElement(tagName);
            // note: do not change default tag display!
            Dom.prepend(elem, body);
            oldDisplay = Dom.css(elem, 'display');
            body.removeChild(elem);
            // Store the correct default display
            defaultDisplay[ tagName ] = oldDisplay;
        }
        return oldDisplay;
    }

    S.mix(Dom,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {
            _camelCase: camelCase,

            _CUSTOM_STYLES: CUSTOM_STYLES,

            _cssProps: cssProps,

            _getComputedStyle: function (elem, name) {
                var val = '',
                    computedStyle,
                    width,
                    minWidth,
                    maxWidth,
                    style,
                    d = elem.ownerDocument;

                name = name.replace(R_UPPER, '-$1').toLowerCase();

                // https://github.com/kissyteam/kissy/issues/61
                if (computedStyle = d.defaultView.getComputedStyle(elem, null)) {
                    val = computedStyle.getPropertyValue(name) || computedStyle[name];
                }

                // 还没有加入到 document，就取行内
                if (val === '' && !Dom.contains(d, elem)) {
                    name = cssProps[name] || name;
                    val = elem[STYLE][name];
                }

                // Safari 5.1 returns percentage for margin
                if (Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)) {
                    style = elem.style;
                    width = style.width;
                    minWidth = style.minWidth;
                    maxWidth = style.maxWidth;

                    style.minWidth = style.maxWidth = style.width = val;
                    val = computedStyle.width;

                    style.width = width;
                    style.minWidth = minWidth;
                    style.maxWidth = maxWidth;
                }

                return val;
            },

            /**
             *  Get inline style property from the first element of matched elements
             *  or
             *  Set one or more CSS properties for the set of matched elements.
             *  @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             *  @param {String|Object} name A CSS property. or A map of property-value pairs to set.
             *  @param [val] A value to set for the property.
             *  @return {undefined|String}
             */
            style: function (selector, name, val) {
                var els = Dom.query(selector),
                    k,
                    ret,
                    elem = els[0], i;
                // supports hash
                if (S.isPlainObject(name)) {
                    for (k in name) {
                        for (i = els.length - 1; i >= 0; i--) {
                            style(els[i], k, name[k]);
                        }
                    }
                    return undefined;
                }
                if (val === undefined) {
                    ret = '';
                    if (elem) {
                        ret = style(elem, name, val);
                    }
                    return ret;
                } else {
                    for (i = els.length - 1; i >= 0; i--) {
                        style(els[i], name, val);
                    }
                }
                return undefined;
            },

            /**
             * Get the computed value of a style property for the first element in the set of matched elements.
             * or
             * Set one or more CSS properties for the set of matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String|Object} name A CSS property. or A map of property-value pairs to set.
             * @param [val] A value to set for the property.
             * @return {undefined|String}
             */
            css: function (selector, name, val) {
                var els = Dom.query(selector),
                    elem = els[0],
                    k,
                    hook,
                    ret,
                    i;
                // supports hash
                if (S.isPlainObject(name)) {
                    for (k in name) {
                        for (i = els.length - 1; i >= 0; i--) {
                            style(els[i], k, name[k]);
                        }
                    }
                    return undefined;
                }

                name = camelCase(name);
                hook = CUSTOM_STYLES[name];
                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    ret = '';
                    if (elem) {
                        // If a hook was provided get the computed value from there
                        if (hook && 'get' in hook && (ret = hook.get(elem, true)) !== undefined) {
                        } else {
                            ret = Dom._getComputedStyle(elem, name);
                        }
                    }
                    return (typeof ret == 'undefined') ? '' : ret;
                }
                // setter
                else {
                    for (i = els.length - 1; i >= 0; i--) {
                        style(els[i], name, val);
                    }
                }
                return undefined;
            },

            /**
             * Display the matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
             */
            show: function (selector) {
                var els = Dom.query(selector),
                    tagName,
                    old,
                    elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    elem[STYLE][DISPLAY] = Dom.data(elem, OLD_DISPLAY) || EMPTY;
                    // 可能元素还处于隐藏状态，比如 css 里设置了 display: none
                    if (Dom.css(elem, DISPLAY) === NONE) {
                        tagName = elem.tagName.toLowerCase();
                        old = getDefaultDisplay(tagName);
                        Dom.data(elem, OLD_DISPLAY, old);
                        elem[STYLE][DISPLAY] = old;
                    }
                }
            },

            /**
             * Hide the matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
             */
            hide: function (selector) {
                var els = Dom.query(selector),
                    elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    var style = elem[STYLE],
                        old = style[DISPLAY];
                    if (old !== NONE) {
                        if (old) {
                            Dom.data(elem, OLD_DISPLAY, old);
                        }
                        style[DISPLAY] = NONE;
                    }
                }
            },

            /**
             * Display or hide the matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
             */
            toggle: function (selector) {
                var els = Dom.query(selector),
                    elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    if (Dom.css(elem, DISPLAY) === NONE) {
                        Dom.show(elem);
                    } else {
                        Dom.hide(elem);
                    }
                }
            },

            /**
             * Creates a stylesheet from a text blob of rules.
             * These rules will be wrapped in a STYLE tag and appended to the HEAD of the document.
             * if cssText does not contain css hacks, u can just use Dom.create('<style>xx</style>')
             * @param {window} [refWin=window] Window which will accept this stylesheet
             * @param {String} [cssText] The text containing the css rules
             * @param {String} [id] An id to add to the stylesheet for later removal
             */
            addStyleSheet: function (refWin, cssText, id) {

                if (typeof refWin == 'string') {
                    id = cssText;
                    cssText = /**@type String
                     @ignore*/refWin;
                    refWin = WINDOW;
                }

                var doc = Dom.getDocument(refWin),
                    elem;

                if (id && (id = id.replace('#', EMPTY))) {
                    elem = Dom.get('#' + id, doc);
                }

                // 仅添加一次，不重复添加
                if (elem) {
                    return;
                }

                elem = Dom.create('<style>', { id: id }, doc);

                // 先添加到 Dom 树中，再给 cssText 赋值，否则 css hack 会失效
                Dom.get('head', doc).appendChild(elem);

                if (elem.styleSheet) { // IE
                    elem.styleSheet.cssText = cssText;
                } else { // W3C
                    elem.appendChild(doc.createTextNode(cssText));
                }
            },

            /**
             * Make matched elements unselectable
             * @param {HTMLElement[]|String|HTMLElement} selector  Matched elements.
             */
            unselectable: function (selector) {
                var _els = Dom.query(selector),
                    elem,
                    j,
                    e,
                    i = 0,
                    excludes,
                    style,
                    els;
                for (j = _els.length - 1; j >= 0; j--) {
                    elem = _els[j];
                    style = elem[STYLE];
                    style['UserSelect'] = 'none';
                    if (UA['gecko']) {
                        style['MozUserSelect'] = 'none';
                    } else if (UA['webkit']) {
                        style['WebkitUserSelect'] = 'none';
                    } else if (UA['ie'] || UA['opera']) {
                        els = elem.getElementsByTagName('*');
                        elem.setAttribute('unselectable', 'on');
                        excludes = ['iframe', 'textarea', 'input', 'select'];
                        while (e = els[i++]) {
                            if (!S.inArray(getNodeName(e), excludes)) {
                                e.setAttribute('unselectable', 'on');
                            }
                        }
                    }
                }
            },

            /**
             * Get the current computed width for the first element in the set of matched elements, including padding but not border.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @return {Number}
             */
            innerWidth: 0,
            /**
             * Get the current computed height for the first element in the set of matched elements, including padding but not border.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @return {Number}
             */
            innerHeight: 0,
            /**
             *  Get the current computed width for the first element in the set of matched elements, including padding and border, and optionally margin.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Boolean} [includeMargin] A Boolean indicating whether to include the element's margin in the calculation.
             * @return {Number}
             */
            outerWidth: 0,
            /**
             * Get the current computed height for the first element in the set of matched elements, including padding, border, and optionally margin.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Boolean} [includeMargin] A Boolean indicating whether to include the element's margin in the calculation.
             * @return {Number}
             */
            outerHeight: 0,
            /**
             * Get the current computed width for the first element in the set of matched elements.
             * or
             * Set the CSS width of each element in the set of matched elements.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Number} [value]
             * An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
             * @return {Number|undefined}
             */
            width: 0,
            /**
             * Get the current computed height for the first element in the set of matched elements.
             * or
             * Set the CSS height of each element in the set of matched elements.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Number} [value]
             * An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
             * @return {Number|undefined}
             */
            height: 0
        });

    S.each([WIDTH, HEIGHT], function (name) {
        Dom['inner' + S.ucfirst(name)] = function (selector) {
            var el = Dom.get(selector);
            return el && getWHIgnoreDisplay(el, name, 'padding');
        };

        Dom['outer' + S.ucfirst(name)] = function (selector, includeMargin) {
            var el = Dom.get(selector);
            return el && getWHIgnoreDisplay(el, name, includeMargin ? 'margin' : 'border');
        };

        Dom[name] = function (selector, val) {
            var ret = Dom.css(selector, name, val);
            if (ret) {
                ret = parseFloat(ret);
            }
            return ret;
        };

        /**
         * @ignore
         */
        CUSTOM_STYLES[ name ] = {
            /**
             * @ignore
             */
            get: function (elem, computed) {
                var val;
                if (computed) {
                    val = getWHIgnoreDisplay(elem, name) + 'px';
                }
                return val;
            }
        };
    });

    var cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' };

    S.each(['left', 'top'], function (name) {
        CUSTOM_STYLES[ name ] = {
            get: function (el, computed) {
                var val,
                    isAutoPosition,
                    position;
                if (computed) {
                    position = Dom.css(el, 'position');
                    if (position === "static") {
                        return "auto";
                    }
                    val = Dom._getComputedStyle(el, name);
                    isAutoPosition = val === "auto";
                    if (isAutoPosition && position === "relative") {
                        return "0px";
                    }
                    if (isAutoPosition || NO_PX_REG.test(val)) {
                        val = getPosition(el)[name] + 'px';
                    }
                }
                return val;
            }
        };
    });

    function swap(elem, options, callback) {
        var old = {}, name;

        // Remember the old values, and insert the new ones
        for (name in options) {
            old[ name ] = elem[STYLE][ name ];
            elem[STYLE][ name ] = options[ name ];
        }

        callback.call(elem);

        // Revert the old values
        for (name in options) {
            elem[STYLE][ name ] = old[ name ];
        }
    }

    function style(elem, name, val) {
        var style,
            ret,
            hook;
        if (elem.nodeType === 3 || elem.nodeType === 8 || !(style = elem[STYLE])) {
            return undefined;
        }
        name = camelCase(name);
        hook = CUSTOM_STYLES[name];
        name = cssProps[name] || name;
        // setter
        if (val !== undefined) {
            // normalize unset
            if (val === null || val === EMPTY) {
                val = EMPTY;
            }
            // number values may need a unit
            else if (!isNaN(Number(val)) && !cssNumber[name]) {
                val += DEFAULT_UNIT;
            }
            if (hook && hook.set) {
                val = hook.set(elem, val);
            }
            if (val !== undefined) {
                // ie 无效值报错
                try {
                    // EMPTY will unset style!
                    style[name] = val;
                } catch (e) {
                    S.log('css set error :' + e);
                }
                // #80 fix,font-family
                if (val === EMPTY && style.removeAttribute) {
                    style.removeAttribute(name);
                }
            }
            if (!style.cssText) {
                // weird for chrome, safari is ok?
                // https://github.com/kissyteam/kissy/issues/231
                UA.webkit && (style = elem.outerHTML);
                elem.removeAttribute('style');
            }
            return undefined;
        }
        //getter
        else {
            // If a hook was provided get the non-computed value from there
            if (hook && 'get' in hook && (ret = hook.get(elem, false)) !== undefined) {

            } else {
                // Otherwise just get the value from the style object
                ret = style[ name ];
            }
            return ret === undefined ? '' : ret;
        }
    }

    // fix #119 : https://github.com/kissyteam/kissy/issues/119
    function getWHIgnoreDisplay(elem) {
        var val, args = arguments;
        // in case elem is window
        // elem.offsetWidth === undefined
        if (elem.offsetWidth !== 0) {
            val = getWH.apply(undefined, args);
        } else {
            swap(elem, cssShow, function () {
                val = getWH.apply(undefined, args);
            });
        }
        return val;
    }


    /*
     得到元素的大小信息
     @param elem
     @param name
     @param {String} [extra]  'padding' : (css width) + padding
     'border' : (css width) + padding + border
     'margin' : (css width) + padding + border + margin
     */
    function getWH(elem, name, extra) {
        if (S.isWindow(elem)) {
            return name == WIDTH ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
        } else if (elem.nodeType == 9) {
            return name == WIDTH ? Dom.docWidth(elem) : Dom.docHeight(elem);
        }
        var which = name === WIDTH ? ['Left', 'Right'] : ['Top', 'Bottom'],
            val = name === WIDTH ? elem.offsetWidth : elem.offsetHeight;

        if (val > 0) {
            if (extra !== 'border') {
                S.each(which, function (w) {
                    if (!extra) {
                        val -= parseFloat(Dom.css(elem, 'padding' + w)) || 0;
                    }
                    if (extra === 'margin') {
                        val += parseFloat(Dom.css(elem, extra + w)) || 0;
                    } else {
                        val -= parseFloat(Dom.css(elem, 'border' + w + 'Width')) || 0;
                    }
                });
            }

            return val;
        }

        // Fall back to computed then un computed css if necessary
        val = Dom._getComputedStyle(elem, name);
        if (val == null || (Number(val)) < 0) {
            val = elem.style[ name ] || 0;
        }
        // Normalize '', auto, and prepare for extra
        val = parseFloat(val) || 0;

        // Add padding, border, margin
        if (extra) {
            S.each(which, function (w) {
                val += parseFloat(Dom.css(elem, 'padding' + w)) || 0;
                if (extra !== 'padding') {
                    val += parseFloat(Dom.css(elem, 'border' + w + 'Width')) || 0;
                }
                if (extra === 'margin') {
                    val += parseFloat(Dom.css(elem, extra + w)) || 0;
                }
            });
        }

        return val;
    }

    var ROOT_REG = /^(?:body|html)$/i;

    function getPosition(el) {
        var offsetParent ,
            offset ,
            parentOffset = {top: 0, left: 0};

        if (Dom.css(el, 'position') == 'fixed') {
            offset = el.getBoundingClientRect();
        } else {
            offsetParent = getOffsetParent(el);
            offset = Dom.offset(el);
            parentOffset = Dom.offset(offsetParent);
            parentOffset.top += parseFloat(Dom.css(offsetParent, "borderTopWidth")) || 0;
            parentOffset.left += parseFloat(Dom.css(offsetParent, "borderLeftWidth")) || 0;
        }

        offset.top -= parseFloat(Dom.css(el, "marginTop")) || 0;
        offset.left -= parseFloat(Dom.css(el, "marginLeft")) || 0;

        // known bug: if el is relative && offsetParent is document.body, left %
        // should - document.body.paddingLeft
        return {
            top: offset.top - parentOffset.top,
            left: offset.left - parentOffset.left
        };
    }

    function getOffsetParent(el) {
        var offsetParent = el.offsetParent || ( el.ownerDocument || doc).body;
        while (offsetParent && !ROOT_REG.test(offsetParent.nodeName) &&
            Dom.css(offsetParent, "position") === "static") {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent;
    }

    return Dom;
}, {
    requires: ['./api']
});

/*
 2011-12-21
 - backgroundPositionX, backgroundPositionY firefox/w3c 不支持
 - w3c 为准，这里不 fix 了


 2011-08-19
 - 调整结构，减少耦合
 - fix css('height') == auto

 NOTES:
 - Opera 下，color 默认返回 #XXYYZZ, 非 rgb(). 目前 jQuery 等类库均忽略此差异，KISSY 也忽略。
 - Safari 低版本，transparent 会返回为 rgba(0, 0, 0, 0), 考虑低版本才有此 bug, 亦忽略。


 - getComputedStyle 在 webkit 下，会舍弃小数部分，ie 下会四舍五入，gecko 下直接输出 float 值。

 - color: blue 继承值，getComputedStyle, 在 ie 下返回 blue, opera 返回 #0000ff, 其它浏览器
 返回 rgb(0, 0, 255)

 - 总之：要使得返回值完全一致是不大可能的，jQuery/ExtJS/KISSY 未“追求完美”。YUI3 做了部分完美处理，但
 依旧存在浏览器差异。
 */
/**
 * @ignore
 * selector
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/selector', function (S, Dom, undefined) {

    var doc = S.Env.host.document,
        docElem = doc.documentElement,
        matches = docElem.matches ||
            docElem.webkitMatchesSelector ||
            docElem.mozMatchesSelector ||
            docElem.oMatchesSelector ||
            docElem.msMatchesSelector,
        isArray = S.isArray,
        makeArray = S.makeArray,
        isDomNodeList = Dom.isDomNodeList,
        SPACE = ' ',
        push = Array.prototype.push,
        RE_QUERY = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/,
        trim = S.trim;

    function query_each(f) {
        var els = this,
            l = els.length,
            i;
        for (i = 0; i < l; i++) {
            if (f(els[i], i) === false) {
                break;
            }
        }
    }

	// added by jayli
	// http://jsperf.com/queryselctor-vs-getelementbyclassname2
	
	function makeMatch(selector){
		if (selector.charAt(0) == '#') {
			return makeIdMatch(selector.substr(1));
		} else if (selector.charAt(0) == '.') {
			return makeClassMatch(selector.substr(1));
		} else {
			return makeTagMatch(selector.substr(0));
		}
	}

	function makeIdMatch(id) {
		return function(elem) {
			var match = document.getElementById(id);
			return match ? [ match ] : [ ];
		};
	}

	function makeClassMatch(className) {
		return function(elem) {
			return elem.getElementsByClassName(className);
		};
	}

	function makeTagMatch(tagName) {
		return function(elem) {
			return elem.getElementsByTagName(tagName);
		};
	}

	// 只涉及#id,.cls,tag的逐级选择
	// 不包括不常见的选择器语法
	// http://www.w3.org/TR/css3-selectors/#attribute-pseudo-classes
	function isSimpleSelector(selector){
		var R = /(\+|\=|\~|\[|\]|:|>|\||\$|\^|\*|\(|\)|[\w-]+\.[\w-]+|[\w-]+\#[\w-]+)/;
		if(selector.match(R)){
			return false;
		} else {
			return true;
		}
	}

    function query(selector, context) {

        var ret,
            i,
            simpleContext,
            isSelectorString = typeof selector == 'string',
            contexts = context !== undefined ? query(context) : (simpleContext = 1) && [doc],
            contextsLen = contexts.length,
			simpleSelector,
			classSelectorRE = /^\.([\w-]+)$/,
			idSelectorRE = /^#([\w-]*)$/,
			tagSelectorRE = /^([\w-])+$/,
			tagIdSelectorRE = /^[\w-]+#([\w-])+$/,
			tagClassSelectorRE = /^[\w-]+\.[\w-]+$/;

        // 常见的空
        if (!selector) {
            ret = [];
        } else if (isSelectorString) {
            selector = trim(selector);

            // shortcut
            if (simpleContext && selector == 'body') {
                ret = [ doc.body ];
			} 
			// 单层.cls
			else if (simpleContext && classSelectorRE.test(selector) && 'getElementsByClassName' in document) {
				ret = contexts[0].getElementsByClassName(RegExp.$1);
				// console.log('getElementsByClassName');
			}
			// tag.cls 情况处理
			else if (simpleContext && tagClassSelectorRE.test(selector)) {
				ret = contexts[0].querySelectorAll(selector);
				// console.log('tag.cls');
			}
			// tag#id 情况处理
			else if (simpleContext && tagIdSelectorRE.test(selector)) {
				var el = doc.getElementById(selector.replace(/^.+#/,''));
				ret = el ? [el] : [];
				// console.log('tag#id');
			}
			// 单层#id
			else if (simpleContext && idSelectorRE.test(selector)) {
				var el = doc.getElementById(selector.substr(1));
				ret = el ? [el] : [];
				// console.log('#id');
			}
			// 单层tgs
			else if (simpleContext && tagSelectorRE.test(selector) && 'getElementsByTagName' in document){
				ret = contexts[0].getElementsByTagName(selector);
				// console.log('tgs');
			}
			// 复杂的CSS3选择器
			else if(!(simpleSelector = isSimpleSelector(selector)) && 'querySelectorAll' in document && contextsLen === 1) {
				// console.log('simple querySelector');
				ret = contexts[0].querySelectorAll(selector);
			}
			// 最后进入简单选择器的多层速选,#id tgs,#id .cls...
			else if('getElementsByTagName' in document 
					&& 'getElementsByClassName' in document 
					&& simpleSelector) {
				var parts = selector.split(/\s+/);
				for (var i = 0, n = parts.length; i < n; i++) {
					parts[i] = makeMatch(parts[i]);
				}

				var parents = contexts;

				for (var i = 0, m = parts.length; i < m; i++) {
					var part = parts[i];
					var newParents = [ ];

					for (var j = 0, n = parents.length; j < n; j++) {
						var matches = part(parents[j]);
						for (var k = 0, o = matches.length; k < o; k++) {
							newParents[newParents.length++] = matches[k];
						}
					}

					parents = newParents;
				}
				// console.log('speedup');
				ret = parents ? parents : [];
				//ret = contexts[0].querySelectorAll(selector);
            } 
			// 最后降级使用KISSY 1.3.0 的做法
			else {
                ret = [];
                for (i = 0; i < contextsLen; i++) {
					if('querySelectorAll' in document){
						// console.log('chain\'s querySelector');
						ret = ret.concat(S.makeArray(contexts[i].querySelectorAll(selector)));
					} else {
						push.apply(ret, Dom._selectInternal(selector, contexts[i]));
					}
                }
                // multiple contexts unique
                if (ret.length > 1 && contextsLen > 1) {
                    Dom.unique(ret);
                }
				// console.log('normal');
            }
        }
        // 不写 context，就是包装一下
        else {
            // 1.常见的单个元素
            // Dom.query(document.getElementById('xx'))
            if (selector['nodeType'] || selector['setTimeout']) {
                ret = [selector];
            }
            // 2.KISSY NodeList 特殊点直接返回，提高性能
            else if (selector['getDOMNodes']) {
                ret = selector['getDOMNodes']();
            }
            // 3.常见的数组
            // var x=Dom.query('.l');
            // Dom.css(x,'color','red');
            else if (isArray(selector)) {
                ret = selector;
            }
            // 4.selector.item
            // Dom.query(document.getElementsByTagName('a'))
            // note:
            // document.createElement('select').item 已经在 1 处理了
            // S.all().item 已经在 2 处理了
            else if (isDomNodeList(selector)) {
                ret = makeArray(selector);
            } else {
                ret = [ selector ];
            }

            if (!simpleContext) {
                var tmp = ret,
                    ci,
                    len = tmp.length;
                ret = [];
                for (i = 0; i < len; i++) {
                    for (ci = 0; ci < contextsLen; ci++) {
                        if (Dom._contains(contexts[ci], tmp[i])) {
                            ret.push(tmp[i]);
                            break;
                        }
                    }
                }
            }
        }

        // attach each method
        ret.each = query_each;

        return ret;
    }

    function hasSingleClass(el, cls) {
        // consider xml
        var className = el && (el.className || getAttr(el, 'class'));
        return className && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1;
    }

    function getAttr(el, name) {
        var ret = el && el.getAttributeNode(name);
        if (ret && ret.specified) {
            return ret.nodeValue;
        }
        return undefined;
    }

    function isTag(el, value) {
        return value == '*' || el.nodeName.toLowerCase() === value.toLowerCase();
    }

    S.mix(Dom,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {
            _compareNodeOrder: function (a, b) {
                if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                    return a.compareDocumentPosition ? -1 : 1;
                }

                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
            },

            _getSimpleAttr: getAttr,

            _isTag: isTag,

            _hasSingleClass: hasSingleClass,

            _matchesInternal: function (str, seeds) {
                var ret = [],
                    i = 0,
                    n,
                    len = seeds.length;
                for (; i < len; i++) {
                    n = seeds[i];
                    if (matches.call(n, str)) {
                        ret.push(n);
                    }
                }
                return ret;
            },

            _selectInternal: function (str, context) {
                return makeArray(context.querySelectorAll(str));
            },

            /**
             * Accepts a string containing a CSS selector which is then used to match a set of elements.
             * @param {String|HTMLElement[]} selector
             * A string containing a selector expression.
             * or
             * array of HTMLElements.
             * @param {String|HTMLElement[]|HTMLDocument|HTMLElement} [context] context under which to find elements matching selector.
             * @return {HTMLElement[]} The array of found HTMLElements
             * @method
             */
            query: query,

            /**
             * Accepts a string containing a CSS selector which is then used to match a set of elements.
             * @param {String|HTMLElement[]} selector
             * A string containing a selector expression.
             * or
             * array of HTMLElements.
             * @param {String|HTMLElement[]|HTMLDocument|HTMLElement|window} [context] context under which to find elements matching selector.
             * @return {HTMLElement} The first of found HTMLElements
             */
            get: function (selector, context) {
                return query(selector, context)[0] || null;
            },

            /**
             * Sorts an array of Dom elements, in place, with the duplicates removed.
             * Note that this only works on arrays of Dom elements, not strings or numbers.
             * @param {HTMLElement[]} The Array of Dom elements.
             * @method
             * @return {HTMLElement[]}
             * @member KISSY.DOM
             */
            unique: (function () {
                var hasDuplicate,
                    baseHasDuplicate = true;

                // Here we check if the JavaScript engine is using some sort of
                // optimization where it does not always call our comparison
                // function. If that is the case, discard the hasDuplicate value.
                // Thus far that includes Google Chrome.
                [0, 0].sort(function () {
                    baseHasDuplicate = false;
                    return 0;
                });

                function sortOrder(a, b) {
                    if (a == b) {
                        hasDuplicate = true;
                        return 0;
                    }

                    return Dom._compareNodeOrder(a, b);
                }

                // 排序去重
                return function (elements) {

                    hasDuplicate = baseHasDuplicate;
                    elements.sort(sortOrder);

                    if (hasDuplicate) {
                        var i = 1, len = elements.length;
                        while (i < len) {
                            if (elements[i] === elements[ i - 1 ]) {
                                elements.splice(i, 1);
                                --len;
                            } else {
                                i++;
                            }
                        }
                    }

                    return elements;
                };
            })(),

            /**
             * Reduce the set of matched elements to those that match the selector or pass the function's test.
             * @param {String|HTMLElement[]} selector Matched elements
             * @param {String|Function} filter Selector string or filter function
             * @param {String|HTMLElement[]|HTMLDocument} [context] Context under which to find matched elements
             * @return {HTMLElement[]}
             * @member KISSY.DOM
             */
            filter: function (selector, filter, context) {
                var elems = query(selector, context),
                    id,
                    tag,
                    match,
                    cls,
                    ret = [];

                if (typeof filter == 'string' &&
                    (filter = trim(filter)) &&
                    (match = RE_QUERY.exec(filter))) {
                    id = match[1];
                    tag = match[2];
                    cls = match[3];
                    if (!id) {
                        filter = function (elem) {
                            var tagRe = true,
                                clsRe = true;

                            // 指定 tag 才进行判断
                            if (tag) {
                                tagRe = isTag(elem, tag);
                            }

                            // 指定 cls 才进行判断
                            if (cls) {
                                clsRe = hasSingleClass(elem, cls);
                            }

                            return clsRe && tagRe;
                        };
                    } else if (id && !tag && !cls) {
                        filter = function (elem) {
                            return getAttr(elem, 'id') == id;
                        };
                    }
                }

                if (S.isFunction(filter)) {
                    ret = S.filter(elems, filter);
                } else {
                    ret = Dom._matchesInternal(filter, elems);
                }

                return ret;
            },

            /**
             * Returns true if the matched element(s) pass the filter test
             * @param {String|HTMLElement[]} selector Matched elements
             * @param {String|Function} filter Selector string or filter function
             * @param {String|HTMLElement[]|HTMLDocument} [context] Context under which to find matched elements
             * @member KISSY.DOM
             * @return {Boolean}
             */
            test: function (selector, filter, context) {
                var elements = query(selector, context);
                return elements.length && (Dom.filter(elements, filter, context).length === elements.length);
            }
        });

    return Dom;
}, {
    requires: ['./api']
});
/**
 * yiminghe@gmail.com - 2013-03-26
 * - refactor to use own css3 selector engine
 */

/**
 * @ignore
 * dom-traversal
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('dom/base/traversal', function (S, Dom, undefined) {

    var NodeType = Dom.NodeType,
        CONTAIN_MASK = 16;

    S.mix(Dom,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {

            _contains: function (a, b) {
                return !!(a.compareDocumentPosition(b) & CONTAIN_MASK);
            },

            /**
             * Get the first element that matches the filter,
             * beginning at the first element of matched elements and progressing up through the Dom tree.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function|String[]|Function[]} filter Selector string or filter function or array
             * @param {HTMLElement|String|HTMLDocument|HTMLElement[]} [context] Search bound element
             * @return {HTMLElement|HTMLElement[]}
             *  if filter is array, return all ancestors (include this) which match filter.
             *  else return closest parent (include this) which matches filter.
             */
            closest: function (selector, filter, context, allowTextNode) {
                return nth(selector, filter, 'parentNode', function (elem) {
                    return elem.nodeType != NodeType.DOCUMENT_FRAGMENT_NODE;
                }, context, true, allowTextNode);
            },

            /**
             * Get the parent of the first element in the current set of matched elements, optionally filtered by a selector.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function|String[]|Function[]} [filter] Selector string or filter function or array
             * @param {HTMLElement|String|HTMLDocument|HTMLElement[]} [context] Search bound element
             * @return {HTMLElement|HTMLElement[]}
             *  if filter is array, return all ancestors which match filter.
             *  else return closest parent which matches filter.
             */
            parent: function (selector, filter, context) {
                return nth(selector, filter, 'parentNode', function (elem) {
                    return elem.nodeType != NodeType.DOCUMENT_FRAGMENT_NODE;
                }, context, undefined);
            },

            /**
             * Get the first child of the first element in the set of matched elements.
             * If a filter is provided, it retrieves the next child only if it matches that filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement}
             */
            first: function (selector, filter, allowTextNode) {
                var elem = Dom.get(selector);
                return nth(elem && elem.firstChild, filter, 'nextSibling',
                    undefined, undefined, true, allowTextNode);
            },

            /**
             * Get the last child of the first element in the set of matched elements.
             * If a filter is provided, it retrieves the previous child only if it matches that filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement}
             */
            last: function (selector, filter, allowTextNode) {
                var elem = Dom.get(selector);
                return nth(elem && elem.lastChild, filter, 'previousSibling',
                    undefined, undefined, true, allowTextNode);
            },

            /**
             * Get the immediately following sibling of the first element in the set of matched elements.
             * If a filter is provided, it retrieves the next child only if it matches that filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement}
             */
            next: function (selector, filter, allowTextNode) {
                return nth(selector, filter, 'nextSibling', undefined,
                    undefined, undefined, allowTextNode);
            },

            /**
             * Get the immediately preceding  sibling of the first element in the set of matched elements.
             * If a filter is provided, it retrieves the previous child only if it matches that filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement}
             */
            prev: function (selector, filter, allowTextNode) {
                return nth(selector, filter, 'previousSibling',
                    undefined, undefined, undefined, allowTextNode);
            },

            /**
             * Get the siblings of the first element in the set of matched elements, optionally filtered by a filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement[]}
             */
            siblings: function (selector, filter, allowTextNode) {
                return getSiblings(selector, filter, true, allowTextNode);
            },

            /**
             * Get the children of the first element in the set of matched elements, optionally filtered by a filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement[]}
             */
            children: function (selector, filter) {
                return getSiblings(selector, filter, undefined);
            },

            /**
             * Get the childNodes of the first element in the set of matched elements (includes text and comment nodes),
             * optionally filtered by a filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement[]}
             */
            contents: function (selector, filter) {
                return getSiblings(selector, filter, undefined, 1);
            },

            /**
             * Check to see if a Dom node is within another Dom node.
             * @param {HTMLElement|String} container The Dom element that may contain the other element.
             * @param {HTMLElement|String} contained The Dom element that may be contained by the other element.
             * @return {Boolean}
             */
            contains: function (container, contained) {
                container = Dom.get(container);
                contained = Dom.get(contained);
                if (container && contained) {
                    return Dom._contains(container, contained);
                }
                return false;
            },
            /**
             * search for a given element from among the matched elements.
             * @param {HTMLElement|String} selector elements or selector string to find matched elements.
             * @param {HTMLElement|String} s2 elements or selector string to find matched elements.
             */
            index: function (selector, s2) {
                var els = Dom.query(selector),
                    c,
                    n = 0,
                    p,
                    els2,
                    el = els[0];

                if (!s2) {
                    p = el && el.parentNode;
                    if (!p) {
                        return -1;
                    }
                    c = el;
                    while (c = c.previousSibling) {
                        if (c.nodeType == NodeType.ELEMENT_NODE) {
                            n++;
                        }
                    }
                    return n;
                }

                els2 = Dom.query(s2);

                if (typeof s2 === 'string') {
                    return S.indexOf(el, els2);
                }

                return S.indexOf(els2[0], els);
            },

            /**
             * Check to see if a Dom node is equal with another Dom node.
             * @param {HTMLElement|String} n1
             * @param {HTMLElement|String} n2
             * @return {Boolean}
             * @member KISSY.DOM
             */
            equals: function (n1, n2) {
                n1 = Dom.query(n1);
                n2 = Dom.query(n2);
                if (n1.length != n2.length) {
                    return false;
                }
                for (var i = n1.length; i >= 0; i--) {
                    if (n1[i] != n2[i]) {
                        return false;
                    }
                }
                return true;
            }
        });

    // 获取元素 elem 在 direction 方向上满足 filter 的第一个元素
    // filter 可为 number, selector, fn array ，为数组时返回多个
    // direction 可为 parentNode, nextSibling, previousSibling
    // context : 到某个阶段不再查找直接返回
    function nth(elem, filter, direction, extraFilter, context, includeSef, allowTextNode) {
        if (!(elem = Dom.get(elem))) {
            return null;
        }
        if (filter === 0) {
            return elem;
        }
        if (!includeSef) {
            elem = elem[direction];
        }
        if (!elem) {
            return null;
        }
        context = (context && Dom.get(context)) || null;

        if (filter === undefined) {
            // 默认取 1
            filter = 1;
        }
        var ret = [],
            isArray = S.isArray(filter),
            fi,
            filterLength;

        if (S.isNumber(filter)) {
            fi = 0;
            filterLength = filter;
            filter = function () {
                return ++fi === filterLength;
            };
        }

        // 概念统一，都是 context 上下文，只过滤子孙节点，自己不管
        while (elem && elem != context) {
            if ((
                elem.nodeType == NodeType.ELEMENT_NODE ||
                    elem.nodeType == NodeType.TEXT_NODE && allowTextNode
                ) &&
                testFilter(elem, filter) &&
                (!extraFilter || extraFilter(elem))) {
                ret.push(elem);
                if (!isArray) {
                    break;
                }
            }
            elem = elem[direction];
        }

        return isArray ? ret : ret[0] || null;
    }

    function testFilter(elem, filter) {
        if (!filter) {
            return true;
        }
        if (S.isArray(filter)) {
            var i, l = filter.length;
            if (!l) {
                return true;
            }
            for (i = 0; i < l; i++) {
                if (Dom.test(elem, filter[i])) {
                    return true;
                }
            }
        } else if (Dom.test(elem, filter)) {
            return true;
        }
        return false;
    }

    // 获取元素 elem 的 siblings, 不包括自身
    function getSiblings(selector, filter, parent, allowText) {
        var ret = [],
            tmp,
            i,
            el,
            elem = Dom.get(selector),
            parentNode = elem;

        if (elem && parent) {
            parentNode = elem.parentNode;
        }

        if (parentNode) {
            tmp = S.makeArray(parentNode.childNodes);
            for (i = 0; i < tmp.length; i++) {
                el = tmp[i];
                if (!allowText && el.nodeType != NodeType.ELEMENT_NODE) {
                    continue;
                }
                if (el == elem) {
                    continue;
                }
                ret.push(el);
            }
            if (filter) {
                ret = Dom.filter(ret, filter);
            }
        }

        return ret;
    }

    return Dom;
}, {
    requires: ['./api']
});

/*
 2012-04-05 yiminghe@gmail.com
 - 增加 contents 方法

 2011-08 yiminghe@gmail.com
 - 添加 closest , first ,last 完全摆脱原生属性

 NOTES:
 - jquery does not return null ,it only returns empty array , but kissy does.

 - api 的设计上，没有跟随 jQuery. 一是为了和其他 api 一致，保持 first-all 原则。二是
 遵循 8/2 原则，用尽可能少的代码满足用户最常用的功能。
 */
/**
 * @ignore
 * dom
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/base', function (S, Dom) {
    S.mix(S, {
        // compatibility
        DOM:Dom,
        get: Dom.get,
        query: Dom.query
    });

    return Dom;
}, {
    requires: [
        './base/api',
        './base/attr',
        './base/class',
        './base/create',
        './base/data',
        './base/insertion',
        './base/offset',
        './base/style',
        './base/selector',
        './base/traversal'
    ]
});
// debug for jayli
KISSY.use('dom/base',{
	sync:true	
});

﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 16 12:06
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 node/base
 node/attach
 node/override
 node/anim
 node
*/

/**
 * @ignore
 * definition for node and nodelist
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('node/base', function (S, Dom, Event, undefined) {

    var AP = Array.prototype,
        slice = AP.slice,
        NodeType = Dom.NodeType,
        push = AP.push,
        makeArray = S.makeArray,
        isNodeList = Dom.isDomNodeList;

    /**
     * The NodeList class provides a {@link KISSY.DOM} wrapper for manipulating Dom Node.
     * use KISSY.all/one to retrieve NodeList instances.
     *
     *  for example:
     *      @example
     *      KISSY.all('a').attr('href','http://docs.kissyui.com');
     *
     * is equal to
     *      @example
     *      KISSY.DOM.attr('a','href','http://docs.kissyui.com');
     *
     * @class KISSY.NodeList
     */
    function NodeList(html, props, ownerDocument) {
        var self = this,
            domNode;

            push.apply(self, makeArray(html));
            return self;

        if (!(self instanceof NodeList)) {
            return new NodeList(html, props, ownerDocument);
        }

        // handle NodeList(''), NodeList(null), or NodeList(undefined)
        if (!html) {
            return self;
        }

        else if (typeof html == 'string') {
            // create from html
            domNode = Dom.create(html, props, ownerDocument);
            // ('<p>1</p><p>2</p>') 转换为 NodeList
            if (domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) { // fragment
                push.apply(this, makeArray(domNode.childNodes));
                return self;
            }
        }

        else if (S.isArray(html) || isNodeList(html)) {
            push.apply(self, makeArray(html));
            return self;
        }

        else {
            // node, document, window
            domNode = html;
        }

        self[0] = domNode;
        self.length = 1;
        return self;
    }

    NodeList.prototype = {

        constructor: NodeList,

        isNodeList: true,

        /**
         * length of nodelist
         * @type {Number}
         */
        length: 0,


        /**
         * Get one node at index
         * @param {Number} index Index position.
         * @return {KISSY.NodeList}
         */
        item: function (index) {
            var self = this;
            if (S.isNumber(index)) {
                if (index >= self.length) {
                    return null;
                } else {
                    return new NodeList(self[index]);
                }
            } else {
                return new NodeList(index);
            }
        },

        /**
         * return a new NodeList object which consists of current node list and parameter node list.
         * @param {KISSY.NodeList} selector Selector string or html string or common dom node.
         * @param {KISSY.NodeList|Number} [context] Search context for selector
         * @param {Number} [index] Insert position.
         * @return {KISSY.NodeList} a new nodelist
         */
        add: function (selector, context, index) {
            if (S.isNumber(context)) {
                index = context;
                context = undefined;
            }
            var list = NodeList.all(selector, context).getDOMNodes(),
                ret = new NodeList(this);
            if (index === undefined) {
                push.apply(ret, list);
            } else {
                var args = [index, 0];
                args.push.apply(args, list);
                AP.splice.apply(ret, args);
            }
            return ret;
        },

        /**
         * Get part of node list.
         * @param {Number} start Start position.
         * @param {number} end End position.
         * @return {KISSY.NodeList}
         */
        slice: function (start, end) {
            // ie<9 : [1,2].slice(-2,undefined) => []
            // ie<9 : [1,2].slice(-2) => [1,2]
            // fix #85
            return new NodeList(slice.apply(this, arguments));
        },

        /**
         * Retrieves the DOMNodes.
         */
        getDOMNodes: function () {
            return slice.call(this);
        },

        /**
         * Applies the given function to each Node in the NodeList.
         * @param {Function} fn The function to apply. It receives 3 arguments:
         * the current node instance, the node's index,
         * and the NodeList instance
         * @param [context] An optional context to
         * apply the function with Default context is the current NodeList instance
         * @return {KISSY.NodeList}
         */
        each: function (fn, context) {
            var self = this;

            S.each(self, function (n, i) {
                n = new NodeList(n);
                return fn.call(context || n, n, i, self);
            });

            return self;
        },
        /**
         * Retrieves the DOMNode.
         * @return {HTMLElement}
         */
        getDOMNode: function () {
            return this[0];
        },

        /**
         * return last stack node list.
         * @return {KISSY.NodeList}
         */
        end: function () {
            var self = this;
            return self.__parent || self;
        },

        /**
         * return new NodeList which contains only nodes which passes filter
         * @param {String|Function} filter
         * @return {KISSY.NodeList}
         */
        filter: function (filter) {
            return new NodeList(Dom.filter(this, filter));
        },

        /**
         * Get node list which are descendants of current node list.
         * @param {String} selector Selector string
         * @return {KISSY.NodeList}
         */
        all: function (selector) {
            var ret,
                self = this;
            if (self.length > 0) {
                ret = NodeList.all(selector, self);
            } else {
                ret = new NodeList();
            }
            ret.__parent = self;
            return ret;
        },

        /**
         * Get node list which match selector under current node list sub tree.
         * @param {String} selector
         * @return {KISSY.NodeList}
         */
        one: function (selector) {
            var self = this,
                all = self.all(selector),
                ret = all.length ? all.slice(0, 1) : null;
            if (ret) {
                ret.__parent = self;
            }
            return ret;
        }
    };

    S.mix(NodeList, {
        /**
         * Get node list from selector or construct new node list from html string.
         * Can also called from KISSY.all
         * @param {String|KISSY.NodeList} selector Selector string or html string or common dom node.
         * @param {String|KISSY.NodeList} [context] Search context for selector
         * @return {KISSY.NodeList}
         * @member KISSY.NodeList
         * @static
         */
        all: function (selector, context) {
            // are we dealing with html string ?
            // TextNode 仍需要自己 new Node
            if (typeof selector == 'string' &&
                (selector = S.trim(selector)) &&
                selector.length >= 3 &&
                S.startsWith(selector, '<') &&
                S.endsWith(selector, '>')) {
                if (context) {
                    if (context['getDOMNode']) {
                        context = context[0];
                    }
                    context = context['ownerDocument'] || context;
                }
                return new NodeList(selector, undefined, context);
            }
            return new NodeList(Dom.query(selector, context));
        },

        /**
         * Get node list with length of one
         * from selector or construct new node list from html string.
         * @param {String|KISSY.NodeList} selector Selector string or html string or common dom node.
         * @param {String|KISSY.NodeList} [context] Search context for selector
         * @return {KISSY.NodeList}
         * @member KISSY.NodeList
         * @static
         */
        one: function (selector, context) {
            var all = NodeList.all(selector, context);
            return all.length ? all.slice(0, 1) : null;
        }
    });

    /**
     * Same with {@link KISSY.DOM.NodeType}
     * @member KISSY.NodeList
     * @property NodeType
     * @static
     */
    NodeList.NodeType = NodeType;

    NodeList.KeyCode = Event.KeyCode;

    NodeList.Gesture = Event.Gesture;

    NodeList.REPLACE_HISTORY = Event.REPLACE_HISTORY;

    return NodeList;
}, {
    requires: ['dom', 'event/dom']
});


/*
 Notes:
 2011-05-25
 - yiminghe@gmail.com：参考 jquery，只有一个 NodeList 对象，Node 就是 NodeList 的别名

 2010.04
 - each 方法传给 fn 的 this, 在 jQuery 里指向原生对象，这样可以避免性能问题。
 但从用户角度讲，this 的第一直觉是 $(this), kissy 和 yui3 保持一致，牺牲
 性能，以易用为首。
 - 有了 each 方法，似乎不再需要 import 所有 dom 方法，意义不大。
 - dom 是低级 api, node 是中级 api, 这是分层的一个原因。还有一个原因是，如果
 直接在 node 里实现 dom 方法，则不大好将 dom 的方法耦合到 nodelist 里。可
 以说，技术成本会制约 api 设计。
 */
/**
 * @ignore
 * import methods from Dom to NodeList.prototype
 * @author yiminghe@gmail.com
 */
KISSY.add('node/attach', function (S, Dom, Event, NodeList, undefined) {

    var NLP = NodeList.prototype,
        makeArray = S.makeArray,
    // Dom 添加到 NP 上的方法
    // if Dom methods return undefined , Node methods need to transform result to itself
        DOM_INCLUDES_NORM = [
            'nodeName',
            'isCustomDomain',
            'getEmptyIframeSrc',
            'equals',
            'contains',
            'index',
            'scrollTop',
            'scrollLeft',
            'height',
            'width',
            'innerHeight',
            'innerWidth',
            'outerHeight',
            'outerWidth',
            'addStyleSheet',
            // 'append' will be overridden
            'appendTo',
            // 'prepend' will be overridden
            'prependTo',
            'insertBefore',
            'before',
            'after',
            'insertAfter',
            'test',
            'hasClass',
            'addClass',
            'removeClass',
            'replaceClass',
            'toggleClass',
            'removeAttr',
            'hasAttr',
            'hasProp',
            // anim override
//            'show',
//            'hide',
//            'toggle',
            'scrollIntoView',
            'remove',
            'empty',
            'removeData',
            'hasData',
            'unselectable',

            'wrap',
            'wrapAll',
            'replaceWith',
            'wrapInner',
            'unwrap'
        ],
    // if return array ,need transform to nodelist
        DOM_INCLUDES_NORM_NODE_LIST = [
            'getWindow',
            'getDocument',
            'filter',
            'first',
            'last',
            'parent',
            'closest',
            'next',
            'prev',
            'clone',
            'siblings',
            'contents',
            'children'
        ],
    // if set return this else if get return true value ,no nodelist transform
        DOM_INCLUDES_NORM_IF = {
            // dom method : set parameter index
            'attr': 1,
            'text': 0,
            'css': 1,
            'style': 1,
            'val': 0,
            'prop': 1,
            'offset': 0,
            'html': 0,
            'outerHTML': 0,
            'outerHtml': 0,
            'data': 1
        },
    // Event 添加到 NP 上的方法
        EVENT_INCLUDES = [
            'on',
            'detach',
            'fire',
            'fireHandler',
            'delegate',
            'undelegate'
        ];

    NodeList.KeyCode = Event.KeyCode;

    function accessNorm(fn, self, args) {
        args.unshift(self);
        var ret = Dom[fn].apply(Dom, args);
        if (ret === undefined) {
            return self;
        }
        return ret;
    }

    function accessNormList(fn, self, args) {
        args.unshift(self);
        var ret = Dom[fn].apply(Dom, args);
        if (ret === undefined) {
            return self;
        }
        else if (ret === null) {
            return null;
        }
        return new NodeList(ret);
    }

    function accessNormIf(fn, self, index, args) {

        // get
        if (args[index] === undefined
            // 并且第一个参数不是对象，否则可能是批量设置写
            && !S.isObject(args[0])) {
            args.unshift(self);
            return Dom[fn].apply(Dom, args);
        }
        // set
        return accessNorm(fn, self, args);
    }

    S.each(DOM_INCLUDES_NORM, function (k) {
        NLP[k] = function () {
            var args = makeArray(arguments);
            return accessNorm(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_NODE_LIST, function (k) {
        NLP[k] = function () {
            var args = makeArray(arguments);
            return accessNormList(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_IF, function (index, k) {
        NLP[k] = function () {
            var args = makeArray(arguments);
            return accessNormIf(k, this, index, args);
        };
    });

    S.each(EVENT_INCLUDES, function (k) {
        NLP[k] = function () {
            var self = this,
                args = makeArray(arguments);
            args.unshift(self);
            Event[k].apply(Event, args);
            return self;
        }
    });

}, {
    requires: ['dom', 'event/dom', './base']
});

/*
 2011-05-24
 - yiminghe@gmail.com：
 - 将 Dom 中的方法包装成 NodeList 方法
 - Node 方法调用参数中的 KISSY NodeList 要转换成第一个 HTML Node
 - 要注意链式调用，如果 Dom 方法返回 undefined （无返回值），则 NodeList 对应方法返回 this
 - 实际上可以完全使用 NodeList 来代替 Dom，不和节点关联的方法如：viewportHeight 等，在 window，document 上调用
 - 存在 window/document 虚节点，通过 S.one(window)/new Node(window) ,S.one(document)/new NodeList(document) 获得
 */
/**
 * @ignore
 * overrides methods in NodeList.prototype
 * @author yiminghe@gmail.com
 */
KISSY.add('node/override', function (S, Dom,NodeList) {

    var NLP = NodeList.prototype;

    /**
     * Insert every element in the set of newNodes to the end of every element in the set of current node list.
     * @param {KISSY.NodeList} newNodes Nodes to be inserted
     * @return {KISSY.NodeList} this
     * @method append
     * @member KISSY.NodeList
     */

    /**
     * Insert every element in the set of newNodes to the beginning of every element in the set of current node list.
     * @param {KISSY.NodeList} newNodes Nodes to be inserted
     * @return {KISSY.NodeList} this
     * @method prepend
     * @member KISSY.NodeList
     */


        // append(node ,parent) : 参数顺序反过来了
        // appendTo(parent,node) : 才是正常
    S.each(['append', 'prepend', 'before', 'after'], function (insertType) {
        NLP[insertType] = function (html) {
            var newNode = html, self = this;
            // 创建
            if (typeof newNode == 'string') {
                newNode = Dom.create(newNode);
            }
            if (newNode) {
                Dom[insertType](newNode, self);
            }
            return self;
        };
    });

    S.each(['wrap', 'wrapAll', 'replaceWith', 'wrapInner'], function (fixType) {
        var orig = NLP[fixType];
        NLP[fixType] = function (others) {
            var self = this;
            if (typeof others == 'string') {
                others = NodeList.all(others, self[0].ownerDocument);
            }
            return orig.call(self, others);
        };
    })

}, {
    requires: ['dom', './base']
});

/*
 2011-04-05 yiminghe@gmail.com
 - 增加 wrap/wrapAll/replaceWith/wrapInner/unwrap/contents

 2011-05-24
 - yiminghe@gmail.com：
 - 重写 NodeList 的某些方法
 - 添加 one ,all ，从当前 NodeList 往下开始选择节点
 - 处理 append ,prepend 和 Dom 的参数实际上是反过来的
 - append/prepend 参数是节点时，如果当前 NodeList 数量 > 1 需要经过 clone，因为同一节点不可能被添加到多个节点中去（NodeList）
 */
/**
 * @ignore
 * anim-node-plugin
 * @author yiminghe@gmail.com,
 *         lifesinger@gmail.com,
 *         qiaohua@taobao.com,
 *
 */
KISSY.add('node/anim', function (S, Dom, Anim, Node, undefined) {

    var FX = [
        // height animations
        [ 'height', 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom' ],
        // width animations
        [ 'width', 'margin-left', 'margin-right', 'padding-left', 'padding-right' ],
        // opacity animations
        [ 'opacity' ]
    ];

    function getFxs(type, num, from) {
        var ret = [],
            obj = {};
        for (var i = from || 0; i < num; i++) {
            ret.push.apply(ret, FX[i]);
        }
        for (i = 0; i < ret.length; i++) {
            obj[ret[i]] = type;
        }
        return obj;
    }

    S.augment(Node, {
        /**
         * animate for current node list.
         * @param var_args see {@link KISSY.Anim}
         * @chainable
         * @member KISSY.NodeList
         */
        animate: function (var_args) {
            var self = this,
                originArgs = S.makeArray(arguments);
            S.each(self, function (elem) {
                var args = S.clone(originArgs),
                    arg0 = args[0];
                if (arg0.to) {
                    arg0.node = elem;
                    Anim(arg0).run();
                } else {
                    Anim.apply(undefined, [elem].concat(args)).run();
                }
            });
            return self;
        },
        /**
         * stop anim of current node list.
         * @param {Boolean} [end] see {@link KISSY.Anim#static-method-stop}
         * @param [clearQueue]
         * @param [queue]
         * @chainable
         * @member KISSY.NodeList
         */
        stop: function (end, clearQueue, queue) {
            var self = this;
            S.each(self, function (elem) {
                Anim.stop(elem, end, clearQueue, queue);
            });
            return self;
        },
        /**
         * pause anim of current node list.
         * @param {Boolean} end see {@link KISSY.Anim#static-method-pause}
         * @param queue
         * @chainable
         * @member KISSY.NodeList
         */
        pause: function (end, queue) {
            var self = this;
            S.each(self, function (elem) {
                Anim.pause(elem, queue);
            });
            return self;
        },
        /**
         * resume anim of current node list.
         * @param {Boolean} end see {@link KISSY.Anim#static-method-resume}
         * @param queue
         * @chainable
         * @member KISSY.NodeList
         */
        resume: function (end, queue) {
            var self = this;
            S.each(self, function (elem) {
                Anim.resume(elem, queue);
            });
            return self;
        },
        /**
         * whether one of current node list is animating.
         * @return {Boolean}
         * @member KISSY.NodeList
         */
        isRunning: function () {
            var self = this;
            for (var i = 0; i < self.length; i++) {
                if (Anim.isRunning(self[i])) {
                    return true;
                }
            }
            return false;
        },
        /**
         * whether one of current node list 's animation is paused.
         * @return {Boolean}
         * @member KISSY.NodeList
         */
        isPaused: function () {
            var self = this;
            for (var i = 0; i < self.length; i++) {
                if (Anim.isPaused(self[i])) {
                    return true;
                }
            }
            return false;
        }
    });

    /**
     * animate show effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method show
     */

    /**
     * animate hide effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method hide
     */

    /**
     * toggle show and hide effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method toggle
     */

    /**
     * animate fadeIn effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method fadeIn
     */

    /**
     * animate fadeOut effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method fadeOut
     */

    /**
     * toggle fadeIn and fadeOut effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method fadeToggle
     */

    /**
     * animate slideUp effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method slideUp
     */

    /**
     * animate slideDown effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method slideDown
     */

    /**
     * toggle slideUp and slideDown effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method slideToggle
     */

    S.each({
            show: getFxs('show', 3),
            hide: getFxs('hide', 3),
            toggle: getFxs('toggle', 3),
            fadeIn: getFxs('show', 3, 2),
            fadeOut: getFxs('hide', 3, 2),
            fadeToggle: getFxs('toggle', 3, 2),
            slideDown: getFxs('show', 1),
            slideUp: getFxs('hide', 1),
            slideToggle: getFxs('toggle', 1)
        },
        function (v, k) {
            Node.prototype[k] = function (duration, complete, easing) {
                var self = this;
                // 没有参数时，调用 Dom 中的对应方法
                if (Dom[k] && !duration) {
                    Dom[k](self);
                } else {
                    S.each(self, function (elem) {
                        Anim(elem, v, duration, easing, complete).run();
                    });
                }
                return self;
            };
        });

}, {
    requires: ['dom', 'anim', './base']
});
/*
 2011-11-10
 - 重写，逻辑放到 Anim 模块，这边只进行转发

 2011-05-17
 - yiminghe@gmail.com：添加 stop ，随时停止动画
 */
/**
 * @ignore
 * node
 * @author yiminghe@gmail.com
 */
KISSY.add('node', function (S, Node) {
    S.mix(S, {
        Node: Node,
        NodeList: Node,
        one: Node.one,
        all: Node.all
    });
    return Node;
}, {
    requires: [
        'node/base',
        'node/attach',
        'node/override',
        'node/anim'
    ]
});
// debug for jayli
/*
KISSY.use('node',{
	sync:true	
});
*/

﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:48
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 base/attribute
 base
*/

/**
 * @ignore
 * attribute management
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('base/attribute', function (S, CustomEvent, undefined) {

    // atomic flag
    Attribute.INVALID = {};

    var INVALID = Attribute.INVALID;

    var FALSE = false;

    function normalFn(host, method) {
        if (typeof method == 'string') {
            return host[method];
        }
        return method;
    }

    function whenAttrChangeEventName(when, name) {
        return when + S.ucfirst(name) + 'Change';
    }

    // fire attribute value change
    function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
        attrName = attrName || name;
        return self.fire(whenAttrChangeEventName(when, name), S.mix({
            attrName: attrName,
            subAttrName: subAttrName,
            prevVal: prevVal,
            newVal: newVal
        }, data));
    }

    /**
     * @ignore
     * @param obj
     * @param name
     * @param [doNotCreate]
     * @returns {*}
     */
    function ensureNonEmpty(obj, name, doNotCreate) {
        var ret = obj[name];
        if (!doNotCreate && !ret) {
            obj[name] = ret = {};
        }
        return ret || {};
    }

    function getAttrs(self) {
        /*
         attribute meta information
         {
         attrName: {
         getter: function,
         setter: function,
         // 注意：只能是普通对象以及系统内置类型，而不能是 new Xx()，否则用 valueFn 替代
         value: v, // default value
         valueFn: function
         }
         }
         */
        return ensureNonEmpty(self, '__attrs');
    }


    function getAttrVals(self) {
        /*
         attribute value
         {
         attrName: attrVal
         }
         */
        return ensureNonEmpty(self, '__attrVals');
    }

    /*
     o, [x,y,z] => o[x][y][z]
     */
    function getValueByPath(o, path) {
        for (var i = 0, len = path.length;
             o != undefined && i < len;
             i++) {
            o = o[path[i]];
        }
        return o;
    }

    /*
     o, [x,y,z], val => o[x][y][z]=val
     */
    function setValueByPath(o, path, val) {
        var len = path.length - 1,
            s = o;
        if (len >= 0) {
            for (var i = 0; i < len; i++) {
                o = o[path[i]];
            }
            if (o != undefined) {
                o[path[i]] = val;
            } else {
                s = undefined;
            }
        }
        return s;
    }

    function getPathNamePair(name) {
        var path;

        if (name.indexOf('.') !== -1) {
            path = name.split('.');
            name = path.shift();
        }

        return {
            path: path,
            name: name
        };
    }

    function getValueBySubValue(prevVal, path, value) {
        var tmp = value;
        if (path) {
            if (prevVal === undefined) {
                tmp = {};
            } else {
                tmp = S.clone(prevVal);
            }
            setValueByPath(tmp, path, value);
        }
        return tmp;
    }

    function prepareDefaultSetFn(self, name) {
        var defaultBeforeFns = ensureNonEmpty(self, '__defaultBeforeFns');
        if (defaultBeforeFns[name]) {
            return;
        }
        defaultBeforeFns[name] = 1;
        var beforeChangeEventName = whenAttrChangeEventName('before', name);
        self.publish(beforeChangeEventName, {
            defaultFn: defaultSetFn
        });
    }

    function setInternal(self, name, value, opts, attrs) {
        var path,
            subVal,
            prevVal,
            pathNamePair = getPathNamePair(name),
            fullName = name;

        name = pathNamePair.name;
        path = pathNamePair.path;
        prevVal = self.get(name);

        prepareDefaultSetFn(self, name);

        if (path) {
            subVal = getValueByPath(prevVal, path);
        }

        // if no change, just return
        // pass equal check to fire change event
        if (!opts.force) {
            if (!path && prevVal === value) {
                return undefined;
            } else if (path && subVal === value) {
                return undefined;
            }
        }

        value = getValueBySubValue(prevVal, path, value);

        var beforeEventObject = S.mix({
            attrName: name,
            subAttrName: fullName,
            prevVal: prevVal,
            newVal: value,
            _opts: opts,
            _attrs: attrs,
            target: self
        }, opts.data);

        // check before event
        if (opts['silent']) {
            if (FALSE === defaultSetFn.call(self, beforeEventObject)) {
                return FALSE;
            }
        } else {
            if (FALSE === self.fire(whenAttrChangeEventName('before', name), beforeEventObject)) {
                return FALSE;
            }
        }

        return self;
    }

    function defaultSetFn(e) {
        // only consider itself, not bubbling!
        if (e.target !== this) {
            return undefined;
        }
        var self = this,
            value = e.newVal,
            prevVal = e.prevVal,
            name = e.attrName,
            fullName = e.subAttrName,
            attrs = e._attrs,
            opts = e._opts;

        // set it
        var ret = self.setInternal(name, value);

        if (ret === FALSE) {
            return ret;
        }

        // fire after event
        if (!opts['silent']) {
            value = getAttrVals(self)[name];
            __fireAttrChange(self, 'after', name, prevVal, value, fullName, null, opts.data);
            if (attrs) {
                attrs.push({
                    prevVal: prevVal,
                    newVal: value,
                    attrName: name,
                    subAttrName: fullName
                });
            } else {
                __fireAttrChange(self,
                    '', '*',
                    [prevVal], [value],
                    [fullName], [name],
                    opts.data);
            }
        }

        return undefined;
    }

    /**
     * @class KISSY.Base.Attribute
     * @private
     * Attribute provides configurable attribute support along with attribute change events.
     * It is designed to be augmented on to a host class,
     * and provides the host with the ability to configure attributes to store and retrieve state,
     * along with attribute change events.
     *
     * For example, attributes added to the host can be configured:
     *
     *  - With a setter function, which can be used to manipulate
     *  values passed to attribute 's {@link #set} method, before they are stored.
     *  - With a getter function, which can be used to manipulate stored values,
     *  before they are returned by attribute 's {@link #get} method.
     *  - With a validator function, to validate values before they are stored.
     *
     * See the {@link #addAttr} method, for the complete set of configuration
     * options available for attributes.
     *
     * NOTE: Most implementations will be better off extending the {@link KISSY.Base} class,
     * instead of augmenting Attribute directly.
     * Base augments Attribute and will handle the initial configuration
     * of attributes for derived classes, accounting for values passed into the constructor.
     */
    function Attribute() {
    }

    // for S.augment, no need to specify constructor
    S.augment(Attribute, CustomEvent.Target, {

        /**
         * get un-cloned attr config collections
         * @return {Object}
         * @private
         */
        getAttrs: function () {
            return getAttrs(this);
        },

        /**
         * get un-cloned attr value collections
         * @return {Object}
         */
        getAttrVals: function () {
            var self = this,
                o = {},
                a,
                attrs = getAttrs(self);
            for (a in attrs) {
                o[a] = self.get(a);
            }
            return o;
        },

        /**
         * Adds an attribute with the provided configuration to the host object.
         * @param {String} name attrName
         * @param {Object} attrConfig The config supports the following properties
         * @param [attrConfig.value] simple object or system native object
         * @param [attrConfig.valueFn] a function which can return current attribute 's default value
         * @param {Function} [attrConfig.setter] call when set attribute 's value
         * pass current attribute 's value as parameter
         * if return value is not undefined,set returned value as real value
         * @param {Function} [attrConfig.getter] call when get attribute 's value
         * pass current attribute 's value as parameter
         * return getter's returned value to invoker
         * @param {Function} [attrConfig.validator]  call before set attribute 's value
         * if return false,cancel this set action
         * @param {Boolean} [override] whether override existing attribute config ,default true
         * @chainable
         */
        addAttr: function (name, attrConfig, override) {
            var self = this,
                attrs = getAttrs(self),
                attr,
                cfg = S.clone(attrConfig);
            if (attr = attrs[name]) {
                S.mix(attr, cfg, override);
            } else {
                attrs[name] = cfg;
            }
            return self;
        },

        /**
         * Configures a group of attributes, and sets initial values.
         * @param {Object} attrConfigs  An object with attribute name/configuration pairs.
         * @param {Object} initialValues user defined initial values
         * @chainable
         */
        addAttrs: function (attrConfigs, initialValues) {
            var self = this;
            S.each(attrConfigs, function (attrConfig, name) {
                self.addAttr(name, attrConfig);
            });
            if (initialValues) {
                self.set(initialValues);
            }
            return self;
        },

        /**
         * Checks if the given attribute has been added to the host.
         * @param {String} name attribute name
         * @return {Boolean}
         */
        hasAttr: function (name) {
            return getAttrs(this).hasOwnProperty(name);
        },

        /**
         * Removes an attribute from the host object.
         * @chainable
         */
        removeAttr: function (name) {
            var self = this;

            if (self.hasAttr(name)) {
                delete getAttrs(self)[name];
                delete getAttrVals(self)[name];
            }

            return self;
        },


        /**
         * Sets the value of an attribute.
         * @param {String|Object} name attribute 's name or attribute name and value map
         * @param [value] attribute 's value
         * @param {Object} [opts] some options
         * @param {Boolean} [opts.silent] whether fire change event
         * @param {Function} [opts.error] error handler
         * @return {Boolean} whether pass validator
         */
        set: function (name, value, opts) {
            var self = this;
            if (S.isPlainObject(name)) {
                opts = value;
                opts = opts || {};
                var all = Object(name),
                    attrs = [],
                    e,
                    errors = [];
                for (name in all) {
                    // bulk validation
                    // if any one failed,all values are not set
                    if ((e = validate(self, name, all[name], all)) !== undefined) {
                        errors.push(e);
                    }
                }
                if (errors.length) {
                    if (opts['error']) {
                        opts['error'](errors);
                    }
                    return FALSE;
                }
                for (name in all) {
                    setInternal(self, name, all[name], opts, attrs);
                }
                var attrNames = [],
                    prevVals = [],
                    newVals = [],
                    subAttrNames = [];
                S.each(attrs, function (attr) {
                    prevVals.push(attr.prevVal);
                    newVals.push(attr.newVal);
                    attrNames.push(attr.attrName);
                    subAttrNames.push(attr.subAttrName);
                });
                if (attrNames.length) {
                    __fireAttrChange(self,
                        '',
                        '*',
                        prevVals,
                        newVals,
                        subAttrNames,
                        attrNames,
                        opts.data);
                }
                return self;
            }
            opts = opts || {};
            // validator check
            e = validate(self, name, value);

            if (e !== undefined) {
                if (opts['error']) {
                    opts['error'](e);
                }
                return FALSE;
            }
            return setInternal(self, name, value, opts);
        },

        /**
         * internal use, no event involved, just set.
         * override by model
         * @protected
         */
        setInternal: function (name, value) {
            var self = this,
                setValue = undefined,
            // if host does not have meta info corresponding to (name,value)
            // then register on demand in order to collect all data meta info
            // 一定要注册属性元数据，否则其他模块通过 _attrs 不能枚举到所有有效属性
            // 因为属性在声明注册前可以直接设置值
                attrConfig = ensureNonEmpty(getAttrs(self), name),
                setter = attrConfig['setter'];

            // if setter has effect
            if (setter && (setter = normalFn(self, setter))) {
                setValue = setter.call(self, value, name);
            }

            if (setValue === INVALID) {
                return FALSE;
            }

            if (setValue !== undefined) {
                value = setValue;
            }

            // finally set
            getAttrVals(self)[name] = value;

            return undefined;
        },

        /**
         * Gets the current value of the attribute.
         * @param {String} name attribute 's name
         * @return {*}
         */
        get: function (name) {
            var self = this,
                dot = '.',
                path,
                attrVals = getAttrVals(self),
                attrConfig,
                getter, ret;

            if (name.indexOf(dot) !== -1) {
                path = name.split(dot);
                name = path.shift();
            }

            attrConfig = ensureNonEmpty(getAttrs(self), name, 1);
            getter = attrConfig['getter'];

            // get user-set value or default value
            //user-set value takes privilege
            ret = name in attrVals ?
                attrVals[name] :
                getDefAttrVal(self, name);

            // invoke getter for this attribute
            if (getter && (getter = normalFn(self, getter))) {
                ret = getter.call(self, ret, name);
            }

            if (!(name in attrVals) && ret !== undefined) {
                attrVals[name] = ret;
            }

            if (path) {
                ret = getValueByPath(ret, path);
            }

            return ret;
        },

        /**
         * Resets the value of an attribute.just reset what addAttr set
         * (not what invoker set when call new Xx(cfg))
         * @param {String} name name of attribute
         * @param {Object} [opts] some options
         * @param {Boolean} [opts.silent] whether fire change event
         * @chainable
         */
        reset: function (name, opts) {
            var self = this;

            if (typeof name == 'string') {
                if (self.hasAttr(name)) {
                    // if attribute does not have default value, then set to undefined
                    return self.set(name, getDefAttrVal(self, name), opts);
                }
                else {
                    return self;
                }
            }

            opts = /**@type Object
             @ignore*/(name);

            var attrs = getAttrs(self),
                values = {};

            // reset all
            for (name in attrs) {
                values[name] = getDefAttrVal(self, name);
            }

            self.set(values, opts);
            return self;
        }
    });

    // get default attribute value from valueFn/value
    function getDefAttrVal(self, name) {
        var attrs = getAttrs(self),
            attrConfig = ensureNonEmpty(attrs, name, 1),
            valFn = attrConfig.valueFn,
            val;

        if (valFn && (valFn = normalFn(self, valFn))) {
            val = valFn.call(self);
            if (val !== /**
             @ignore
             @type Function
             */undefined) {
                attrConfig.value = val;
            }
            delete attrConfig.valueFn;
            attrs[name] = attrConfig;
        }

        return attrConfig.value;
    }

    function validate(self, name, value, all) {
        var path, prevVal, pathNamePair;

        pathNamePair = getPathNamePair(name);

        name = pathNamePair.name;
        path = pathNamePair.path;

        if (path) {
            prevVal = self.get(name);
            value = getValueBySubValue(prevVal, path, value);
        }
        var attrConfig = ensureNonEmpty(getAttrs(self), name),
            e,
            validator = attrConfig['validator'];
        if (validator && (validator = normalFn(self, validator))) {
            e = validator.call(self, value, name, all);
            // undefined and true validate successfully
            if (e !== undefined && e !== true) {
                return e;
            }
        }
        return undefined;
    }

    return Attribute;
}, {
    requires: ['event/custom']
});

/*
 2011-10-18
 get/set sub attribute value ,set('x.y',val) x 最好为 {} ，不要是 new Clz() 出来的
 add validator
 */
/**
 * @ignore
 * attribute management and event in one
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('base', function (S, Attribute) {

    /**
     * @class KISSY.Base
     * @mixins KISSY.Event.Target
     * @mixins KISSY.Base.Attribute
     *
     * A base class which objects requiring attributes and custom event support can
     * extend. attributes configured
     * through the static {@link KISSY.Base#static-ATTRS} property for each class
     * in the hierarchy will be initialized by Base.
     */
    function Base(config) {
        var self = this,
            c = self.constructor;
        if (!(self instanceof Base)) {
            S.error('should use new to create class instance: ');
        }
        // save user config
        self.userConfig = config;
        // define
        while (c) {
            addAttrs(self, c['ATTRS']);
            c = c.superclass ? c.superclass.constructor : null;
        }
        // initial
        initAttrs(self, config);
    }


    /**
     * The default set of attributes which will be available for instances of this class, and
     * their configuration
     *
     * By default if the value is an object literal or an array it will be 'shallow' cloned, to
     * protect the default value.
     *
     *      for example:
     *      @example
     *      {
     *          x:{
     *              value: // default value
     *              valueFn: // default function to get value
     *              getter: // getter function
     *              setter: // setter function
     *          }
     *      }
     *
     * @property ATTRS
     * @member KISSY.Base
     * @static
     * @type {Object}
     */


    function addAttrs(host, attrs) {
        if (attrs) {
            for (var attr in attrs) {
                // 子类上的 ATTRS 配置优先
                // 父类后加，父类不覆盖子类的相同设置
                // 属性对象会 merge
                // a: {y: {getter: fn}}, b: {y: {value: 3}}
                // b extends a
                // =>
                // b {y: {value: 3, getter: fn}}
                host.addAttr(attr, attrs[attr], false);
            }
        }
    }

    function initAttrs(host, config) {
        if (config) {
            for (var attr in config) {
                // 用户设置会调用 setter/validator 的，但不会触发属性变化事件
                host.setInternal(attr, config[attr]);
            }
        }
    }

    S.augment(Base, Attribute);

    Base.Attribute = Attribute;

    S.Base = Base;

    return Base;
}, {
    requires: ['base/attribute', 'event/custom']
});

