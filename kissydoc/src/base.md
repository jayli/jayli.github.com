# Base

阅读之前先通读[KISSY 中的面向对象](oo.html)。

有了 S.augment，我们可以很方便得扩展类的原型；有了 S.extend，我们可以很方便地继承；那么 KISSY 对属性 getter、setter 的实现，是基于Base完成的。

顾名思义，Base 是个基础类；他包含除了getter和setter之外，还包含自定义事件和插件机制。因此Base包括：

1. `getter`和`setter`方法实现：Attribute
2. 自定义事件机制：CustomEvent
3. 代码插拔机制：Plugin

![](http://gtms04.alicdn.com/tps/i4/T1a55UFbtaXXbsDJoj-389-190.png)

这三类功能被封装在`base`模块中，这样来载入base；

	KISSY.use('base',function(S,Base){
		// Your Code...
	});

> 在KISSY 1.3.x 中有一个别名RichBase，1.4.0 及以后版本将统一为Base，在实现上，Base 使用了自定义事件掺元对象`CustomEvent.Target`和内置的掺元对象`Attribute`。

我们来分别看下Base的这几个特性

## 1，属性管理：Attribute

Base 的属性配置来自 Attribute 模块，它提供如下方法：

- addAttr()
- addAttrs()
- hasAttr()
- get()
- getAttrVals()
- set()
- reset()

通过 get() 与 set() 这一层包装，Base 允许类在定义自己时，配置 getter、setter 方法，用法如下：

	// 生成一个类Dog
	var Dog = Base.extend({
		initializer:function(){
			var self = this;

			// Your Code
			alert('ok');
		}
	},{
		ATTRS: {
			name:{
				value:'abc'
			}
		}
	});

这时Dog的实例具有Attr特性

	var dog1 = new Dog(); //new Dog的时候自动调用initializer方法
	dog1.set('name','dommy');// 设置这只小狗的名字
	alert(dog1.get('name'));

Attr的好处是，可以检查存入值的合法性，同时可以触发'值改变'的自定义事件。方便对值的状态进行监听。

上段代码提到，初始化一个实例的时候，会自动调用一个初始化函数来构造实例。通常是在定义这个类的时候就设定构造函数：

	var Dog = Base.extend({
		initializer:function(){
			// 构造函数
		},
		destructor: function() {
			// 析构函数
		}
	},{/*ATTRS*/});

其中析构函数是实例对象在调用`.destroy()`时触发的。

可以用关联矩阵(associative array)的方式定义类的属性和配置参数,

	var Dog = Base.extend({
		_onSetName:function(){
			// name 属性发生改变时的回调
		}
	},{
		ATTRS: {
			name: {
				value:'value',
				valueFn:function(){
				},
				setter:function(){
					// 这里可以对值进行校验
				},
				getter: function(s) {
				}
			}
		}
	});


实例化Dog类并设置attr属性值

	var dog = new Dog({name:1});
	dog.set('name',2);

Base提供了对属性值初始化的同步以及变化的事件监听。上面的实例化和设置属性值，都会同步调用到类中定义的`_onSet{驼峰写法的属性名}`函数。但这里的`_onSetAttr`看上去是个内部方法，我们可以使用绑定事件的形式来监听值的变化，事件有：

- beforeAttrNameChange
- afterAttrNameChange
- *Change

注意此处的 AttrName 是个示例名称，例如 breed 的相应事件名称是：

- beforeBreedChange
- afterBreedChange


	dog.on('afterBreedChange', function(e) {
		console.log('我要从' + e.prevVal + '变成' + e.newVal + '啦！')
	})

如何让一个已有的类获得Attr特性？

	// Dog 是一个已有的类
	S.extend(Dog, Base, {
		bark: function() {
			this.fire('bark', {
				message: 'Woof! I just barked!'
			})
		}
	})

	// 这时Dog类就具有了Base特性
	var dog = new Dog();

	dog.on('bark', function(e) {
		console.log(e.message)      // ==> 'Woof! I just barked!'
	});

如果Dog没有被定义过，我想直接定义一个类，这样做（是上一段代码的另一种写法）：

	// 直接定义一个类 Dog 
	var Dog = S.Base.extend({
		initializer:function(){
			var self = this;
		},
		bark:function(){
			this.fire('bark', {
				message: 'Woof! I just barked!'
			});
		}
	},{/*ATTRS*/});

	var dog = new Dog();


## 2，自定义事件 CustomEvent

继承自Base的对象可以分发自定义事件，即实例上有`fire()`方法。比如上一段代码，bark() 函数中触发了一个自定义事件`bark`，绑定这个事件即可收到这个事件。具体用法可参照[Event自定义事件部分](event.html)。

## 3，插件机制：Plugin

ATTR 的作用是给类本身新增特性，完成类与类之间的代码共享。对于要给实例动态增加新特性，就需要新的机制，插件机制。Base提供了一个配置（plugins）和三个函数（plug、unplug和getPlugin）用来管理插件。在正式讲解之前，读者一定要明白，插件的本质是"代码注入"，即安装和卸载的行为分别执行一段外部脚本。

插件实际上是一个简单对象，在类实例化的时候可以实例化plugin，也可以在实例化后插入plugin，当载入插件时，调用 plugin 的 pluginInitializer 初始化函数。在销毁插件的时候调用 pluginDestructor 析构函数。用法是调用实例的`plug(plugin)`方法。

参数plugin可以是类，也可以是实例，如果是类则无参实例化plugin。 两者都会调用plugin的pluginInitializer初始化函数。推荐以实例的形式写插件。

一个插件对象：

	var PluginA = {	
		pluginInitializer:function(){},
		pluginDestructor:function(){}
	};

直接传实例化的示例代码：

	new Editor().plug({
		pluginInitializer:function(){},
		pluginDestructor:function(){}
	})

与之对应的方法是`unplug(plugin)`，从plugins数组中移除plugin，并调用pluginDestructor析构函数。

第三个方法`getPlugin(id)`是通过类plugin定义的的`p.get('pluginIn') || p.pluginId`来拿到plugin的实例。

实现一个简单的plugin：

	// 实现一个简单的插件
	var PluginA = {
		pluginInitializer:function(){
			alert('插件运行');
			// 插入插件时调用
		},
		pluginDestructor:function(){
			// 拔出插件时调用
		}
	};

	var Dog = Base.extend({
		initializer:function(){
			//  Dog构造函数 
		}
	},{});

	// 实例化一个Dog
	var dog = new Dog();

	dog.plug(PluginA);// 弹出'插件运行'

也可以直接在初始化的时候传入plugin.

	var dog = new Dog({
		plugins:[PluginA]	
	});	

卸载插件的方法：

	dog.unplug(PluginA);

如果定义插件时指定了插件id，可以通过插件id来卸载插件

	var PluginA = {
		// 定义插件id
		pluginId:'myname',
		pluginInitializer:function(){
			alert('插件运行');
			// 插入插件时调用
		},
		pluginDestructor:function(){
			// 拔出插件时调用
		}
	};

	dog.plug(PluginA);// 装载插件
	dog.unplug('myname');// 通过插件id来卸载插件

插件是一种注入代码的方法，利用好插件特性，可以让你的代码架构更加清晰，比如editor就大量使用了插件机制。





