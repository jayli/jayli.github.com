# KISSY 模块定义规范（KMD）

--------------------------------

模块：即一段独立成文件的代码单元。最常见的浏览器端 JavaScript 单元是：

	// within a file
	(function(doc){
		// 模块代码
	})(document);

这段代码用闭包来约束执行上下文，避免对全局命名空间的污染。随着代码复杂度增加，模块格式开始融入团队协作和性能要求，模块格式也从单纯的`匿名闭包函数`演变为`模块定义规范`。

首先要明确，模块化的目标是：

1. 代码单元冠以命名，增强代码段的辨识度
2. 建立代码之间的依赖关系，降低代码段之间的耦合
3. 命名空间和上下文管理，减少代码段之间的相互冲突
4. 形成模块规范，提高代码段的复用性

因此，一个完整的模块应当包含这几个属性

1. 模块名
1. 实现逻辑
1. 返回值
1. 所依赖的模块

KISSY 在诞生之初就确立了模块化的架构，以此抽象出现在的 KISSY 模块定义规范（KISSY Module Defination，简称 KMD）。这份规范明确了 KISSY 所遵循的书写格式和基本交互。

# API 规范

## add() `Function`

`add`函数挂载在全局对象`KISSY`上，用来定义模块。

	add(name?,factory?,deps)

其中字符串`name`表示模块的注册名称，`factory`表示模块的主内容/逻辑，`deps`是一个对象，表示模块依赖

### add(name,factory)

`add`函数第一个参数是`name`，表示要注册模块的名字，`factory`可以是函数，也可以是对象或字符串。

`factory`为函数时，表示模块的实现逻辑，回调函数回传第一个参数总是`KISSY`全局对象，约定写为`S`，该函数的返回值即为模块的返回值，该返回值将会传入调用这个模块的沙箱中：

	add('module-name',function(S){
		// 模块代码
		return {
			'foo':'bar'
		};
	});

`factory`为对象或者字符串是，只表示该模块的内容就是此对象或字符串：

	add('module-name','I am a template, My Name is {{module-name}}');
	add('module-name',{
		'foo':'bar'	
	});

### add(name,factory,deps)

当给`add`函数传入最后一个参数`deps`，这时`deps`表示该模块的依赖，其中`requries`属性是一个数组，数组元素可以是其他模块的名字`name`，也可以是指向模块的路径，`factory`如果是函数，则函数中的回传参数除第一个`S`（全局对象 KISSY）外依次对应每个模块的返回值：

	add('module-name',function(S,A,B,C){
		// 模块代码	
		return sth;
	},{
		requires:[
			'mod-a','mod-b','mod-c'
		]
	});

### add(factory,deps)

`name`参数可以省略，但仅限于一个 JS 文件包含一个`add()`（这时文件名可以用作模块名），如果一个文件包含多个`add()`，则必须为每个`add()`指定模块名，即`name`参数不可省略，比如：

	// a.js，这里的add()没有指定name
	add(function(S){
		// A 模块逻辑
	});

	// b.js
	add(function(S,A){
		// B 模块逻辑
	},{
		requires:['path/to/a.js']	
	});

而这种用法是错误的：

	// a.js，一个 JS 文件中包含了两段add()，且都没有指定模块名
	add(function(S){
		// 逻辑段1
	});
	add(function(S){
		// 逻辑段2
	});

一个文件带有多个`add()`时，必须补全每个`add()`的`name`，比如正确的写法是：

	// a.js 一个 JS 文件包含多段add()，必须补全每个模块名称
	add('mod-a',function(S){
		// 逻辑段A
	});
	add('mod-b',function(S){
		// 逻辑段B
	});

## require() `Function`

### require(name)

获取已经注册的模块的返回值，这里注意，要保证所有依赖的模块都已经注册过，`require()`函数才会正确返回，如果有未注册的模块，`require()`不会计算依赖并动态加载。该函数只是针对已经注册过模块起作用，是一种快捷调用模块返回值的方法：

	// 注册模块
	add('a',{
		'foo':'bar'	
	});
	
	// 获取已经注册模块的值
	require('a'); // => {'foo':'bar'}

## use() `Function`

异步调用模块，并在模块加载完成后运行沙箱逻辑。

### use(name,sandbox)

`name`是一个字符串，表示要载入模块的名字（列表），如果有多个名字，则中间用逗号分隔，函数`sandbox`为加载并注册完成这些模块后的回调逻辑，带入第一个参数为`KISSY`全局对象，默认缩写为`S`，其他参数依次带入所载入的模块返回的对象。

	use('mod-a, mod-b',function(S,ModA,ModB){
		// 沙箱逻辑
	});

其中，`name`字段中的每个单元，可以用模块名称表示，也可以用模块文件对应的路径表示，这时，模块定义时的名称也应当和这里的路径保持一致，比如：

	use('path/to/mod-a, path/to/mod-b',function(S,ModA,ModB){
		// 沙箱逻辑	
	});

例子中的模块 A 和模块 B 在注册模块名时的书写方法请参照`add()`。

## config() `Function`

全局配置函数，用以读写全局配置项，包括注册**包**、预注册**模块**名称，模块文件的引用规则等等。

### config(name,pkg)

写配置项，`name`表示配置项名称，`pkg`表示配置项的值，其中配置项包括：

- modules，JSON 对象，预注册的模块关系依赖
- combine，Boolean值，是否开启动态合并
- comboMaxFileNum，数字类型，最动态合并文件最大个数
- packages，JSON 对象，包配置
- tag，字符串，异步加载文件时所带的时间戳
- debug，Boolean值，是否开启debug模式，不开启，将默认加载`'-min'`文件
- charset，字符串，指示所有模块文件编码格式，默认为`utf-8`
- base，字符串，类库所在的URL

**注册包**：包是一个名字，用来映射某个URL地址，方便记忆和引用，比如：

	// 配置包
	config('packages',{
		'pkg-name':{
			base:'http://path/to/project/'
		}
	});

	// 使用包下辖的模块，载入了 http://path/to/project/pkg-name/a.js
	use('pkg-name/a',function(S,A){
		// 沙箱逻辑	
	});

使用`ignorePackageNameInUri`属性来说明是否在请求模块路径中省去`pkg-name`，比如下面代码也是正确的：

	// 配置包
	config('packages',{
		'pkg-name':{
			base:'http://path/to/project/pkg-name/',
			ignorePackageNameInUri:true
		}
	});

	// 使用包下辖的模块，载入了 http://path/to/project/pkg-name/a.js
	use('pkg-name/a',function(S,A){
		// 沙箱逻辑	
	});

当开启了`combine:true`，可使用`group`属性来配置多个包之间的合并请求：

	// 配置包，并给定分组名 group
	config('packages',{
		'pkg-a':{
			base:'http://path/to/project/pkg-a/',
			group:'my'
		},
		'pkg-b':{
			base:'http://path/to/project/pkg-b/',
			group:'my'
		},
	});

	// 使用包下辖的模块
	use('pkg-a/mod1,pkg-b/mod2',function(S){
		// 沙箱逻辑	
	});

开启`combine:true`后，这条`use()`语句将只会发起一个 HTTP 请求，而非两个。

`pkg-name`也可以用于`add()`函数，比如：

	// 注册模块文件 
	// http://path/to/project/pkg-name/a.js
	add('pkg-name/a',function(S){
		// 模块 A 的逻辑	
	});
	
**预注册模块**：由于浏览器端加载脚本都是异步，因此如果模块之间有依赖，主逻辑只能在加载 A 模块后才知道并加载 A 的依赖。因此加载过程为串行。为了降低串行的性能损耗，`config()`可以预先注册模块的依赖关系，一次性加载模块和与之关联的依赖，比如

	// 预注册模块依赖
	config('modules',{
		'mod-a':{
			requires:['mod-b','mod-c']
		},
		'mod-b':{
			requries:['mod-d','mod-e']
		}
	});

	// use() 模块时，在配置了 combine:true 后，将会合并载入模块及其依赖
	use('mod-a, mod-b', function(S,ModA,ModB){
		// 沙箱逻辑	
	});

**模块别名**：在定义模块时，可以通过`alias`来定义模块别名

	// 定义模块的别名
	config('modules',{
		'mod-a':{
			alias:['mod-b/1.2'] // 数组长度为1
		}
	});

	// 正常使用模块
	use('mod-a',function(S){});

### config(cfg)

写配置项的另外一种写法，即传入一个JSON对象`cfg`：

	config({
		modules:{
			// 模块依赖关系Map
		},
		packages:{
			// 包配置
		},
		combine:true,
		charset:'utf-8',
		debug:false
		//...
	});

### config(name)

读配置项

	// 获取当前的全局配置
	var combine = config('combine');


## 小结

以上为 KMD 模块定义规范的全部内容，经常使用的 API 只有 `use`、`add`、`config`。

KMD 规范诞生之初还未有[CommonJS规范](http://wiki.commonjs.org/wiki/CommonJS)以及[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) 和 [CMD](https://github.com/seajs/seajs/issues/242)。经典的 [YUI3 Loader](http://yuilibrary.com/yui/docs/yui/loader.html) 受限于单一的业务场景（门户网站），至今未完全形成规范。KMD 作为一个完整的模块规范，崇尚约定，保持简单，并在 Loader 的实现过程中，新增了别名、包配置、动态combo等实际工作中常用的功能，即有别于 AMD 和 CMD 的过于纯粹，又不同于 YUILoader 的繁杂配置，保持其易用和实用。

