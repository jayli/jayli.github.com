# KISSY 中的面向对象

JavaScript 语言自成体系，自有一套代码重用的模式，这些常见的代码重用模式可以在《Javascript 设计模式》、《JavaScript 编程模式》中找到理论基础。KISSY 即是实践了这些典型的代码重用模式，并作为 KISSY 代码库的面向对象的核心，向高层代码提供语言的完备性支撑。

这些理论基础大都来自["javascript 编程模式"](https://speakerdeck.com/lijing00333/javascript-patterns)一书：

![](http://gtms01.alicdn.com/tps/i1/T1mumMFdBdXXXMOITY-406-251.png)

KISSY 中面向对象的范畴包含两个方面，本篇讲解第一方面

- 语言层面：JS 语言特有的编程模式
	- 面向对象相关的模式
	- JS 语言增强的工具函数
- 最佳实践：KISSY 对于面向UI、模块生命周期的封装，包括组件模式、插件模式等

## 概要

JavaScript 语言没有原生类的概念，对象之间共享方法的关键渠道是通过原型。而具备某一类原型方法的'模板对象'，通常被称作基类，子类除了调用基类的构造器（手动调用）外，最重要的就是要拥有基类的行为能力（继承基类原型上的方法）。这个过程中涉及到五种典型的行为：

- 混合 mix
- 克隆 clone
- 扩充 augment
- 继承 extend
- 合并 merge

对比下YUI和KISSY的这几个方法名的差别

<table class="table table-condensed">
<thead>
	<tr>
		<th>
			<strong>YUI</strong>
		</th>
		<th>
			<strong>KISSY</strong>
		</th>
	</tr>
</thead>
<tbody>
	<tr>
		<td>
			augmentObject
		</td>
		<td>
			mix
		</td>
	</tr>
	<tr>
		<td>
			augmentProto
		</td>
		<td>
			augment
		</td>
	</tr>
	<tr>
		<td>
			merge
		</td>
		<td>
			merge
		</td>
	</tr>
	<tr>
		<td>
			extend
		</td>
		<td>
			extend
		</td>
	</tr>
	<tr>
		<td>
			clone
		</td>
		<td>
			clone
		</td>
	</tr>
</tbody>
</table>

以 kissy 的 API 为例，merge 和 augment 都是基于 mix 方法，本质上利用了 JS 的动态特性，在运行时为对象增减成员；

extend 方法的实现比较典型，总体思路是子构造器的原型对象指向父构造器的一个实例，具体有一些细节问题要处理。类继承体系中继承的是对象的模板（即类），JS 没有对于对象的更高一层的抽象数据结构，即使有 constructor 这种东西，它本身也只是 function 对象而已。

### mix

`mix (receiver , supplier [ , overwrite = true , whitelist , deep ]) => Object`

将 supplier 对象的成员复制到 receiver 对象上。参数：

- receiver (object) – 属性接受者对象.
- supplier (object) – 属性来源对象.
- overwrite (boolean) – 是否覆盖接受者同名属性.
- whitelist (Array<string>) – 属性来源对象的属性白名单, 仅在名单中的属性进行复制.
- deep (boolean) – 是否进行深度 mix (deep copy)

mix 默认不是递归进行的. 如果其中一个属性为对象或者数组，那么他将会被接下来对象的同名属性对应的值所代替，即值不会被合并。 如果设置了参数 deep = true ，那么会对数组和简单对象`KISSY.isPlainObject()`递归合并.

supplier undefined 的属性值不会被复制，不过对象从原型继承下来下的值则会被复制.	

> 该方法仅适用于 javascript 对象，不要再浏览器对象上调用，例如 node.style

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

mix是最自然也是最简单的为 JS 对象添加特性的方式，具体实现就是将一个对象的（所有或指定）属性指向给另一个对象，在静态语言中是无能为力的。

虽然 Yahoo 将这种方式学院式地命名为“augmentObject”并且声称使用它的合适场合是在“扩充一个‘静态类’”时。所谓“静态类”这种说法，只能说是中静态类语言的遗毒太深，什么概念都要一一映射至其上。事实上，“静态类”对应 JS 中的概念是“非构造器对象”，比如字面量对象。而之所以 Yahoo 强调“静态类”，那是因为“静态类”和构造器之间间有一个显区别，前者没有 prototype 属性。

补充一点，“静态类”也可以是构造器，只不过它的 prototype 没有多大意义（比如指向 {}）。

事实上，这个方法是 augment 和 merge 的基础。可以看到，JS 中直接对对象进行各种操作其实非常方便，类什么的都是浮云。

### merge

`merge (s1,s2[,...]) => Object`

将多个对象的成员合并到一个新对象上. 参数中, 后面的对象成员会覆盖前面的。如果用mix混合对象时，receiver 会被改变，如果想要保留原始的 receiver ，可以使用 KISSY.merge()
	
	var object=S.merge(object1,object2);

简单例子：

	var S = KISSY,
	a = { a: 'a' },
	b = { b: 'b' },
	c = { b: 'b2', c: 'c' };

	var o = S.merge(a, b, c);
	S.log(o.a); // => 'a'
	S.log(o.b); // => 'b2'
	S.log(o.c); // => 'c'

简单情况下 merge 方法常用来合并配置信息. 推荐使用 Base 处理属性配置.


### extend

`extend (r,s[,px,sx]) => Function`

让函数对象 r 继承函数对象 s，参数

- r (function) – receiver,将要继承的子类函数
- s (function|object) – supplier,继承自的父类函数
- px (object) – prototype members, 需要添加/覆盖的原型成员
- sx (object) – static members, 需要添加/覆盖的静态成员.


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

extend 方法是 KISSY 里类继承的实现方式. 书写 JavaScript 代码时, 请忘记传统 OO 里的继承体系。子类方法中可通过 superclass 来访问父类函数的原型, 进而调用父类方法.

S.extend 像 Node.js 里的 util.inherits，就是用于声明两个类的继承关系，与 util.inherits 相比，它更为贴心，还会维护 superclass 和 superclass.constructor。

注意构造函数体内，通过 Chicken 类上的 superclass 属性，子类不再需要显式写明父类的名称， 只需要直接调 `SubClass.superclass.constructor.call(this, attrs)` 即可。

而在方法内，也可以通过 SubClass.superclass 拿到父类上的方法，类似其他编程语言中的 super 之类。

### augment

`augment(r, s1 [, s2 , ...], ov = true, wl) => Function`

将 s1,s2.... 的 `prototype` 属性的成员复制到 `r.prototype` 上。这时被复制的成员来自于一个Fucntion对象，这个对象一般被称为掺元类（mixin class）。比如 KISSY 里的 CustemEvent 就是一个掺元类。掺元类只是被扩充用的。参数说明：

- r (function) – 将要扩充的函数
- `...s1` (function|object) – 扩充来源函数或对象. 非函数对象时复制的就是 s 的成员.
- ov (boolean) – 是否覆盖 r.prototype 同名属性.
- whitelist (Array<string>) – 属性来源对象的属性白名单, 仅在名单中的属性进行复制.


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

YUI 中的叫法很长，augmentProto 只扩充 prototype 中的属性，因此扩充的对象必须是“类”。扩充者和被扩充者之间没有半分钱关系，降低了 extend 体系中的复杂耦合，这和“组合优于继承”的 OO 原则是一致的。

### clone

对象的值的拷贝，绕过引用的拷贝。

参照 [lang](lang.html#clone)。

----------------------------------------

有了 S.augment，我们可以很方便得扩展类的原型；有了 S.extend，我们可以很方便地继承；那么 KISSY 对属性 getter、setter 有什么好的解决方案么？答案自然是 Base。

顾名思义，Base 是个基础类；而这个类，也是通过 S.augment 等搞定的。在[Base](base.html)小节讲解。
