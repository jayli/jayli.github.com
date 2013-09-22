<style>
h3 {
	color:blue;
}
</style>
# lang 

> lang 是一套`underscore`风格的工具集，提供一些常用的工具函数，`lang` 模块内嵌在 `seed.js` 内，无需额外引入，这些函数直接挂载在 KISSY 全局对象上。

### augment()  `<static>`

`augment(r, s1 [, s2 , ...], ov = true, wl) => Function`

将 s1,s2.... 的 `prototype` 属性的成员复制到 `r.prototype` 上。这时被复制的成员来自于一个Fucntion对象，这个对象一般被称为掺元类（mixin class）。比如 KISSY 里的 CustemEvent 就是一个掺元类。掺元类只是被扩充用的。参数说明：

#### parameters

- r (function) – 将要扩充的函数
- `...s1` (function|object) – 扩充来源函数或对象. 非函数对象时复制的就是 s 的成员.
- ov (boolean) – 是否覆盖 r.prototype 同名属性.
- whitelist (Array<string>) – 属性来源对象的属性白名单, 仅在名单中的属性进行复制.

#### return

- `r`（function），即将要扩充的函数

#### Example


	var S = KISSY,
	Shoutable = {
		shout: function() { alert('I am ' + this.name + '.'); }
	};

	function Dog(name) { this.name = 'Dog ' + name; }
	function Pig(name) { this.name = 'Pig ' + name; }

	S.augment(Dog, Shoutable);
	S.augment(Pig, Shoutable);

	new Dog('Jack').shout(); // => I am Dog Jack.
	new Pig('Mary').shout(); // => I am Pig Mary.

augment 方法在 KISSY 里非常基础非常重要. 传统 OO 语言里, 可以通过继承或接口来实现共性方法. 在 JavaScript 里, 通过 mixin 特性, 一切变得更简单. augment 是动态语言 mixin 特性的体现, 灵活运用, 能让代码非常优雅简洁.

### available()  `<static>`

`available (id,fn) => void`

监听某个节点是否处于可用状态，如果可用，执行回调，此函数一般在要监听的DOM节点执行之前绑定到节点。

#### parameters

- id (string) – 页面元素 id
- fn (function) – 回调函数, 在 id 元素可用时立刻执行.

### bind()  `<static>`

`bind (fn , context[, arg1[, arg2[, ...]]]) => Function`

创建一个新函数，该函数可以在固定的上下文以及传递部分固定参数放在用户参数前面给原函数并执行

#### parameters

- fn (function) – 需要固定上下文以及固定部分参数的函数
- context (object) – 执行 fn 时的 this 值. 如果新函数用于构造器则该参数无用.

#### return

- Function，符合需求的新函数

#### Example 1，改变运行上下文

bind 最简单的用法是生成一个新的函数，无论它如何调用，都运行在一个固定的 this 值中，入门者常犯的错误时从一个对象获得一个方法引用， 然后在后面的调用中期望这个方法的this就是原来的对象(eg.g 把这个方法用在某个回调中). 如果没有特例，那么这个原始对象就丢失了. 但是如果从原方法中得到一个绑定原始对象的函数，这个问题就解决了！

	var x = 9;
	var module = {
		x: 81,
		getX: function() { return this.x; }
	};

	module.getX(); // 81

	var getX = module.getX;
	getX(); // 9, 这里，this 指向全局Global对象

	// 创建一个新函数，函数的上下文this绑定至module
	var boundGetX = KISSY.bind(getX,module);
	boundGetX(); // 81

#### Example 2，Currying

bind 的下一个简单用法是产生一个具备默认参数的函数. 这些参数跟在 context 后面，无论何时调用绑定函数， 当绑定函数调用目标函数时会把它们放在参数列表开头，然后才是传递给绑定函数的用户参数.

	function list() {
		return Array.prototype.slice.call(arguments);
	}

	var list1 = list(1, 2, 3); // [1, 2, 3]

	// 使用当前参数创建一个新函数
	var leadingZeroList = KISSY.bind(list,undefined, 37);

	var list2 = leadingZeroList(); // [37]
	var list3 = leadingZeroList(1, 2, 3); // [37, 1, 2, 3]

### buffer()  `<static>`

`buffer (fn, ms, context)`

将 fn 缓存一段时间后, 再被调用执行

#### parameters

- fn (Function) – 要缓存的函数;
- ms (Number) – 要缓存多长时间后执行, 默认是 150 ms;
- context (Object) – 函数 fn 要执行时的上下文环境, 默认是 this;

#### return

- Function，返回缓存后的函数对象

> 此方法为了避免在 ms 段时间内, 执行 fn 多次. 常用于 resize , scroll , mousemove 等连续性事件中；当 ms 设置为 -1, 表示立即执行 fn, 即和直接调用 fn 一样;

#### Example

	self.__onResize = S.buffer(doResize, 100, this);
	$(window).on("resize", self.__onResize);

### clone()  `<static>`

`clone (o[,filter]) => Object`

创建一个 普通对象 或数组的深拷贝, 并且返回.

#### parameters

- o (object|Array) – 待深拷贝的对象或数组.
- filter – 过滤函数, 返回 false 不拷贝该元素. 传入参数为:
	- 待克隆值为数组, 参数同 KISSY.filter() , 上下文对象为全局 window
	- 待克隆值为普通对象, 参数为对象的每个键, 每个键对应的值, 当前对象, 上下文对象为当前对象.

#### return

- Object，拷贝后的新对象

> DOM 节点的克隆请用 dom.clone()

#### example

	var S = KISSY;
	var a={x:{y:{z:1}}}
	var b=S.clone(a); // => b={x:y:{z:1}} , b!==a
	var c=S.clone(a,function(v,k){if(k=="z") return false;}) // => c={x:{y:{}}}

### each()  `<static>`

`each ( o, fn[, context] )`

遍历数组中的每一项, 执行指定方法.

#### parameters

- o (Array|object) – 需要遍历的数组或对象
- fn (function) – 执行时, 接收 3 个参数：
	- 当 o 为数组时, 参数为当前数组单项值, 当前 index, 数组 o
	- 当 o 为对象时, 参数为当前值 (value), 当前键 (key), 对象 o
- context (object) – fn 的上下文对象, 不指定为全局 window


	var S = KISSY,
	arr = [1, 2, 3, 4, 5],
	obj = {
		'hi': 'kissy',
		'bye': 'world'
	},
	sum = 0;

	S.each(arr, function(item) {
		sum += item;
	});
	S.log(sum); // => 15


	S.each(obj, function(v,k) {
		S.log([v,k]);
	});

### endsWith()  `<static>`

`endsWith (str,suffix) => Boolean`

判断 str 是否以 suffix 结尾

#### parameters

- str (string) – 查找字符串
- suffix (string) – 后缀字符串

#### return

- Boolean，str 是否以 suffix 结尾

### error()   `<static>`

`error (msg) => void`

#### parameters

- msg(string) - 异常信息

> 只有在 debug 模式下, 才会抛出异常. debug 模式的说明请参考 Config

### escapeHTML()  `<static>`

`escapeHTML (str) => String`

将字符串经过 html 转义得到适合在页面中显示的内容, 例如替换 `<` 为 `&lt;`

#### parameters

- str (string) – 要显示在页面中的真实内容

#### return

- string，经过 html 转义后的字符串

#### example

	KISSY.escapeHTML("<a>x</a>"); // =>  "&lt;a&gt;x&lt;/a&gt;"

> 此函数只会对以下符号进行 escape：`& > < / " '`&prime; 等

### extend()  `<static>`

`extend (r,s[,px,sx]) => Function`

让函数对象 r 继承函数对象 s

#### paramters

- r (function) – receiver,将要继承的子类函数
- s (function|object) – supplier,继承自的父类函数
- px (object) – prototype members, 需要添加/覆盖的原型成员
- sx (object) – static members, 需要添加/覆盖的静态成员.

#### return

- r（Function）

#### Example

	var S = KISSY;

	function Bird(name) { this.name = name; }
	Bird.prototype.fly = function() { alert(this.name + ' is flying now!'); };

	function Chicken(name) {
		Chicken.superclass.constructor.call(this, name);
	}
	S.extend(Chicken, Bird,{
		fly:function(){
			Chicken.superclass.fly.call(this)
			alert("it's my turn");
		}
	});

	new Chicken('kissy').fly();

extend 方法是 KISSY 里类继承的实现方式. 书写 JavaScript 代码时, 请忘记传统 OO 里的继承体系. 还 JavaScript 本色, 给代码一身轻松.

> 子类方法中可通过 superclass 来访问父类函数的原型, 进而调用父类方法.

### filter()  `<static>`

`filter (arr,fn[,context]) => Array`

遍历数组, 过滤出符合条件的数组项.

#### parameters

- arr (Array) – 需要遍历的数组.
- fn (function) – 过滤函数. 执行时, 接收 3 个参数：当前项、当前 index, 数组.
- context (object) – fn 执行的上下文对象

#### returns

返回符合过滤函数的新数组

#### Example

	var S = KISSY,
	arr = [1, 2, 3, 4, 5];

	var ret = S.filter(arr, function(item) {
		return item % 2 === 0;
	});
	S.log(ret); // => [2, 4]

### fromUnicode()  `<static>`

`fromUnicode (str) => String`

将 str 中 unicode 转义的字符替换成真实字符. 主要用于 taobao 用户名 cookie 读取.

#### parameters

str (string) – 包含 unicode 转义的字符串

#### return

unicode 转义后的字符串

#### Example

	KISSY.fromUnicode("\\u627F\\u7389") // => "承玉"

### globalEval()  `<static>`

`globalEval(code) => void`

在全局作用域下执行代码字符串, 避免 eval 的作用域链

#### parameters

code (string) – 代码字符串

### guid()  `<static>`

`guid(prefix) => String`

生成全局唯一 id.

#### parameters

prefix (string) – 唯一 id 前缀

#### example


	var S = KISSY;
	for(var i=0;i<5;i++){
		alert(S.guid('pre')); 
		// => 输出 prex,pre(x+1),pre(x+2),pre(x+3),pre(x+4)
		// x 表示一个不确定的数字 ,(x+1) 表示对该数字运算得到的表达式
		// 例如可能的结果：pre10,pre11,pre12,pre13,pre14					  
	}

### inArray()  `<static>`

`inArray (elem,arr) => Boolean`

判断元素 elem 是否在数组 arr 中.

#### parameters

- elem – 任意对象
- arr – 数组

### indexOf()  `<static>`

`indexof (elem,arr)`

返回元素 elem 在数组 arr 中的序号.

#### parameters

- elem – 任意对象
- arr – 数组

#### return

elem 在数组 arr 中的序号，类型为Number

#### example

	var S = KISSY;
	function IndexDemo(){
		var arry1 = [1,2,3,4,5,6];
		var s = KISSY.indexOf(5,arry1);
		return(s);  // => 4
	}

### isArray()  `<static>`

`isArray (o) => Boolean`

判断o是否为数组

### isBoolean()  `<static>`

`isBoolean (o) => Boolean`

判断o是否为布尔值

### isDate()  `<static>`

`isDate(o) => Boolean`

判断o是否为Date

### isEmptyObject()  `<static>`

`isEmptyObject(o) => Boolean`

判断是否空对象(没有任何可遍历的属性).

#### example

	var S = KISSY;

	S.isEmptyObject({}); // => true
	S.isEmptyObject([]); // => true
	S.isEmptyObject({ a: 'a' }); // => false

### isFunction()  `<static>`

`isFunction(o) => Boolean`

判断o是否为Function

### isNull()  `<static>`

`isNull(o) => Boolean`

判断o是否为null

### isNumber()  `<static>`

`isNumber(o) => Boolean`

判断o是否为Number

> NaN 和 Infinity 也返回 true

### isObject()  `<static>`

`isObject(o) => Boolean`

判断o是否为Object

### isPlainObject()  `<static>`

`isPlainObject(o) => Boolean`

判断是否是普通对象, 通过 {} 或 new FunctionClass/Object() 创建的, 不包括内置对象以及宿主对象.

#### example

	var S = KISSY;

	S.isPlainObject({}); // => true
	S.isPlainObject(new Date()); // => false
	S.isPlainObject(document.body); // => false

### isRegExp()  `<static>`

`isRegExp(o) => Boolean`

判断o是否为正则表达式

### isString()  `<static>`

`isString(o) => Boolean`

判断o是否为String

### isUndefined()  `<static>`

`isUndefined(o) => Boolean`

判断o是否为undefined

### Window()  `<static>`

`Window(o) => Boolean`

判断o是否为Window对象

目前的实现是:

	isWindow: function(o) {
		return S.type(o) === 'object'
			&& 'setInterval' in o
			&& 'document' in o
			&& o.document.nodeType == 9;
	}

有更好的实现, 欢迎提出.

### keys()  `<static>`

`keys(o) => Object`

将对象的所有属性名作为数组返回

#### parameters

o ({object}) – 需要遍历的对象

#### return

属性名数组

#### example

	var S = KISSY,
	var o= { x:1, y:2 };
	S.keys(o) => ["x","y"]

### lastIndexOf()  `<static>`

`lastIndexOf (elem,arr) => Number`

返回元素 elem 在数组 arr 中最后出现的序号.	

#### parameters

- elem – 任意对象
- arr – 数组

#### return

elem 在数组 arr 中最后出现的序号.

### later()  `<static>`

`later ( fn[, when, periodic, o, data] ) => Object`

延迟执行指定函数 fn

#### parameters

- fn (function) – 延迟执行的函数.
- when (number) – 延迟时间, 单位是毫秒.
- periodic (boolean) – 是不是周期性执行. 默认为 false.
- o (object) – fn 上下文对象
- data (Array) – 传递的参数. 可以为单个对象, 最后会转换成数组, 依次传递给执行函数.

#### return

timer 对象，类型为Object. 包含下面这些属性:

- interval 是否周期执行
- cancel  取消定时器

#### example

	var S = KISSY;

	S.later(function(data) {
		S.log(data);
	}, 0, false, null, 'I am later data.');

### log()  `<static>`

`log (msg[,cat=’log’,src]) => void`

输出调试信息	

#### parameters

- msg (string) – 调试信息
- cat (string) – 调试信息类别. 可以取 info, warn, error, dir, time 等 console 对象的方法名, 默认为 log.
- src (string) – 调试代码所在的源信息

只有在 debug 模式下, 才会输出调试信息. 

### makeArray()  `<static>`

`makeArray (o) => Array`

将对象 o 转换为数组.

#### parameters

o – arguments, NodeList 等 array-like 对象或单个对象

#### return

可以代表 o 的新数组

#### example

	var S = KISSY;

	S.makeArray('str'); // => ['str']
	S.makeArray(S.query('.div')); // => 由所有 div 元素组成的数组
	S.makeArray(null); // => []

### map()  `<static>`

`map (arr,fn[,context])	 => Array`

创建一个新数组, 数组结果是在对每个原数组元素调用指定函数的返回值.

#### parameter

- arr (Array) – 需要遍历的数组.
- fn (function) – 能够根据原数组当前元素返回新数组元素的函数.
- context (object) – 执行 fn 时的 this 值.

原数组保持不变

#### return

返回符合根据指定函数调用得到新数组，类型为Array

#### example

	function makePseudoPlural(single) {
		return single.replace(/o/g, "e");
	}

	var singles = ["foot", "goose", "moose"];
	var plurals = S.map(singles, makePseudoPlural);  // => ["feet", "geese", "meese"]

	var a = S.map("Hello World",function(x) {
		return x.charCodeAt(0);
	}); // => [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]


### merge()  `<static>`

`merge (s1,s2[,...]) => Object`

将多个对象的成员合并到一个新对象上. 参数中, 后面的对象成员会覆盖前面的.

#### parameters

- s1 (object) – 属性源
- s2 (object) – 属性源

#### return

合并属性后的新对象.

#### example

	var S = KISSY,
	a = { a: 'a' },
	b = { b: 'b' },
	c = { b: 'b2', c: 'c' };

	var o = S.merge(a, b, c);
	S.log(o.a); // => 'a'
	S.log(o.b); // => 'b2'
	S.log(o.c); // => 'c'

简单情况下 merge 方法常用来合并配置信息. 推荐使用 Base 处理属性配置.

### mix()  `<static>`

`mix (receiver , supplier [ , overwrite = true , whitelist , deep ]) => Object`

将 supplier 对象的成员复制到 receiver 对象上.

#### parameter

- receiver (object) – 属性接受者对象.
- supplier (object) – 属性来源对象.
- overwrite (boolean) – 是否覆盖接受者同名属性.
- whitelist (Array<string>) – 属性来源对象的属性白名单, 仅在名单中的属性进行复制.
- deep (boolean) – 是否进行深度 mix (deep copy)

#### return

receiver 属性接受者对象，类型为Object

> receiver 会被改变，如果想要保留原始的 receiver ，可以使用 KISSY.merge()
	
	var object=S.merge(object1,object2);

S.mix 默认不是递归进行的. 如果其中一个属性为对象或者数组，那么他将会被接下来对象的同名属性对应的值所代替，即值不会被合并。 如果设置了参数 deep = true ，那么会对数组和简单对象`KISSY.isPlainObject()`递归合并.

supplier undefined 的属性值不会被复制，不过对象从原型继承下来下的值则会被复制.	

> 该方法仅适用于 javascript 对象，不要再浏览器对象上调用，例如 node.style

#### example

简单 mix

	var S = KISSY,
	r = { a: 'a', b: 'b' };

	S.mix(r, { c: 'c' });
	S.log(r.c); // => 'c'

	S.mix(r, { a: 'a2' }, false);
	S.log(r.a); // => 'a'

	S.mix(r, { e: 'e', f: 'f' }, true, ['f']);
	S.log(r.e); // => undefined
	S.log(r.f); // => 'f'

深度mix

	var object1 = {
	  apple: 0,
	  banana: {weight: 52, price: 100},
	  cherry: 97
	};
	var object2 = {
	  banana: {price: 200},
	  durian: 100
	};

	/* merge object2 into object1, recursively */
	S.mix(object1,object2,undefined,undefined,true);

	S.log(object1); // => { apple: 0, banana: { weight: 52, price: 200 }, cherry: 97, durian: 100 }

默认选项机制

常用于组件配置，不过推荐用 base 替代

	var defaults = { validate: false, limit: 5, name: "foo" };
	var options = { validate: true, name: "bar" };

	/* merge defaults and options, without modifying defaults */
	var settings = S.merge(defaults, options);

	S.log(settings); // => { validate: true, limit: 5, name: bar }

该方法在 KISSY 里具有非常重要的地位. JavaScript 是一门动态语言, 利用 mixin 特性, 可以很方便的实现特性的静态复制和动态修改.


### namespace()  `<static>`

`namespace (n1[,....,global=false]) =>	Object`

根据参数创建命名空间对象

#### parameters

- n1 (string) – 命名空间字符串, 如 "fp.search" 或 "KISSY.fp.ad"
- global (boolean) – 是否第一个点之前的字符串作为全局变量, 默认 false 添加到 KISSY

#### return

最后创建的命名空间对象

#### example

	var S = KISSY;

	S.namespace('app', 'test'); // 创建 KISSY.app 和 KISSY.test 对象
	S.namespace('app.Shop'); // 创建 KISSY.app.Shop 对象
	S.namespace("TC.mods",true); //创建 window.TC.mods 对象

namespace 方法提供了最基本的命名空间管理. 但对于模块的命名空间推荐采用 kissy 1.4的 loader 机制，详情参阅[KISSY模块规范](../kmd.html).

### now()  `<static>`

`now () => Date`

返回`new Date().getTime()`

### param()  `<static>`

`param (o[ ,sep=’&’,eq=’=’,arr=true ]) => String`

将对象 o 转换为参数字符串, 用于发送 http 请求.

#### parameter

- o (object) – 参数键值对对象
- seq (string) – 参数间分隔符, 默认 &
- eq (string) – 参数与参数值间的分隔符, 默认 =
- arr (boolean) – 参数值为数组时, 参数键是否加 [] 即 %5B%5D , 默认 true

#### return

可用于发送请求的参数字符串

#### example

	var S = KISSY;
	
	S.param({ foo: 1, bar: 2 }); // => foo=1&bar=2
	S.param({ foo: 1, bar: [2, 3] }); // => foo=1&bar%5B%5D=2&bar%5B%5D=3
	S.param({ foo: 1, bar: [2, 3] },'&','=',false); // => foo=1&bar=2&bar=3
	S.param({ foo: '', bar: 2 }); // => foo=&bar=2
	S.param({ foo: undefined, bar: 2 }); // => foo&bar=2

> 实现同[Jquery.param](http://api.jquery.com/jQuery.param/)

### parseXML()  `<static>`

`parseXML (str) => String`

#### parameter

str (string) – 有效的 xml 文档字符串

#### return

xml 文档

> KISSY.parseXML 使用原生的浏览器机制进行 xml 解析。结果 xml 文档可以像 html dom 一样进行选择器查找。 默认 kissy 对于 xml 文档仅支持 tag 选择器. 载入 sizzle 后可对返回的 xml 文档进行全面遍历.

#### example

	var xml = "<rss version='2.0'><channel><title>RSS Title</title></channel></rss>";
	var xmlDoc=KISSY.all(KISSY.parseXML(xml));
	alert(xmlDoc.one("title").text()); // => RSS Title

### ready()  `<static>`

`ready (fn) => void`

DomReady时的回调

#### parameter

fn (function) – 回调函数, 在 DOM 加载完毕时执行.

#### example

	KISSY.ready(function(S) {
		// code
	});

这是 KISSY 外部代码的基本调用方式. 为了保证代码执行时, 依赖的 DOM 结构已准备好, 推荐尽可能的将代码写在通过 ready 注册的函数里.

> 在 DOM 加载完毕后, 依旧可以通过 ready 添加函数, 此时会立刻执行.

### reduce()  `<static>`

`reduce (arr,fn[,initialValue]) => Array`

从左向右对每个数组元素调用给定函数，并把返回值累积起来

#### parameter

- arr (Array) – 需要遍历的数组.
- fn (function) – 在每个数组元素上执行的函数.
- initialValue (object) – 初次执行 fn 时的第一个参数值，如果不指定则为第一个元素值，后续从第二个元素开始遍历

#### return

累计值

reduce 对数组中的每个元素执行 fn 函数，该 fn 接受四个参数：initialValue (或者上次调用 fn 的返回值)， 数组的当前元素，数组的当前位置以及用于遍历的数组.调用 reduce 类似于：

	KISSY.reduce([],function(previousValue, currentValue, index, array){
		// Your cod	e
	});

当第一次调用 fn 时 :

- 如果调用 reduce 时没有设定 initialValue，previousValue 和 currentValue 是数组的前两个值.
- 如果调用 reduce 时设定了 initialValue，那么 previousValue 和 initialValue 相等 ，而 currentValue 则和数组的第一个元素相等.

比如：

	KISSY.reduce([0,1,2,3,4],function(previousValue, currentValue, index, array){
	  return previousValue + currentValue;
	});

	// First call
	previousValue = 0, currentValue = 1, index = 1

	// Second call
	previousValue = 1, currentValue = 2, index = 2

	// Third call
	previousValue = 3, currentValue = 3, index = 3

	// Fourth call
	previousValue = 6, currentValue = 4, index = 4

	// array is always the object [0,1,2,3,4] upon which reduce was called

	// Return Value: 10

提供了 initialValue

	KISSY.reduce([0,1,2,3,4],function(previousValue, currentValue, index, array){
	  return previousValue + currentValue;
	}, 10);

	// First call
	previousValue = 10, currentValue = 0, index = 0

	// Second call
	previousValue = 10, currentValue = 1, index = 1

	// Third call
	previousValue = 11, currentValue = 2, index = 2

	// Fourth call
	previousValue = 13, currentValue = 3, index = 3

	// Fifth call
	previousValue = 16, currentValue = 4, index = 4

	// array is always the object [0,1,2,3,4] upon which reduce was called

	// Return Value: 20

得到数组的值总和

	var total = KISSY.reduce([0, 1, 2, 3],function(a, b){ return a + b; });
	// total == 6

嵌套数组平坦化

	var flattened = KISSY.reduce([[0,1], [2,3], [4,5]],function(a,b) {
	  return a.concat(b);
	});
	// flattened is [0, 1, 2, 3, 4, 5]



### startsWith()  `<static>`

`startsWith (str,prefix) => Boolean`

判断 str 是否以 prefix 开头

#### parameter

- str (string) – 查找字符串
- prefix (string) – 前缀字符串


### substitute()  `<static>`

`substitute (str,o) => String`

将字符串中的占位符替换为对应的键值.

#### parameter

- str (String) – 包含数据占位符的模板字符串, 占位符用 {} 包起来.
- o (Object) – 数据

#### return

将模板和数据结合起来的最终字符串

#### example

	var S = KISSY,
	str = '{name} is {prop_1} and {prop_2}.',
	obj = {name: 'Jack Bauer', prop_1: 'our lord', prop_2: 'savior'};

	S.substitute(str, obj); // => 'Jack Bauer is our lord and savior.'


### throttle()  `<static>`

`throttle (fn, ms, context) => Function `

ms 时间内只执行 fn 一次, 即使这段时间内 fn 被调用多次.

#### parameter

- fn (Function) – 要缓存的函数;
- ms (Number) – 要缓存多长时间后执行, 默认是 150 ms;
- context (Object) – 函数 fn 要执行时的上下文环境, 默认是 this;

#### return

返回缓存后的函数对象;

> 当 ms 设置为 -1, 表示立即执行 fn, 即和直接调用 fn 一样;
> 
> throttle 和 buffer 的区别在于, 前者表示间隔内的函数触发被忽略, 后者表示间隔内的触发被放到下个间隔触发

#### example

	 function sayHi() {
		alert('hi');
	 }

	say = S.throttle(sayHi, 300, this);
	say();              // 忽略
	S.later(say, 200);  // 忽略
	S.later(say, 350);  // 超过300ms后, 终于执行



### trim()  `<static>`

`trim (str) => String`

去除字符串两端的空白字符.

### type()  `<static>`

`type(o) => String`

返回o的数据类型

### unEscapeHTML()  `<static>`

`unEscapeHTML (str) => String`

将字符串中的 html 实体字符替换成对应字符，也可以写成`unEscapeHtml`

#### example
	
	KISSY.unEscapeHTML("&lt;a&gt;x&lt;/a&gt;"); // =>  "<a>x</a>"

该函数只会 unescape 以下字符序列（正则式）
	
	&amp; &lt; &gt; &#x60; &#x2F; &quot; &#x27; &#\d{1,5}

### unique()  `<static>`

`unique (arr[,keepLast=false]) => Array`

返回一个新数组, 仅包含 arr 去重后的值

#### parameter

- arr (Array) – 包含重复元素的数组
- keepLast (boolean) – 遇到重复值是保留第一次出现还是保留最后一次出现的元素

#### return

包含 arr 去重后的数组

#### example

	KISSY.unique(['a', 'b', 'a'],true) => ['b', 'a']
	KISSY.unique(['a', 'b', 'a']) => ['a', 'b']

### unparam()  `<static>`

`unparam (str[ ,sep=’&’,eq=’=’ ]) => Object`

将参数字符串 str 还原为对象.

#### parameter

- o (object) – 参数字符串
- seq (string) – 参数间分隔符, 默认 `&`	
- eq (string) – 参数与参数值间的分割符, 默认 `=`

#### return

参数的对象表示

> key 可以不加 `[]` 如 `v=1&v=2` => `{v:[1,2]}`

参数值如果是 gbk 编码的, 则不会解码出对应的真实值. (用的原生 decodeURIComponent, 请修改参数值为 utf-8 编码).

	var S = KISSY;

	S.unparam('foo=1&bar=2'); // => { foo: 1, bar: 2 }
	S.unparam('foo=%81%47'); // gbk 编码 => { foo: "%81%47" } 而不是 {foo: "丢"}
	S.unparam('foo=1&bar=2&bar=3'); // => { foo: 1, bar: [2, 3] }
	S.unparam('foo=1&bar%5B%5D=2&bar%5B%5D=3'); // => { foo: 1, bar: [2, 3] }

### version()  `<static>`

`version() => String`

返回 KISSY 类库的版本号. 可通过 KISSY.version 获取.
