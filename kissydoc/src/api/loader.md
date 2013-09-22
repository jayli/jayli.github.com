# loader

> loader 是脚本加载器的实现， 弥补了 javascript 语言机制的不足, 提供类似其他语言原生的模块化机制。KISSY loader 实现了 [KISSY 模块规范](../kmd.html)。

### add()  `<static>`

`add(name,fn[,config]) ⇒ void`

#### parameters

- name (string) – 模块名。可选。
- fn (function) – 模块定义函数
- config (object) – 模块的一些格外属性, 是JSON对象，包含属性：
	- requires (Array<String>) – 模块的一些依赖项, 如果需要载入 css 则, 数组项为 `.css` 结尾名字

KISSY 添加模块/逻辑片段的函数，config为配置对象，包括`config.requries`，给出当前模块的依赖模块。模块返回一个对象，通过引用它的时候来调用到。

当模块名称 name 为[包内模块](#config)时, 则requires的模块名称可使用相对路径来引用包内其他模块，比如`package/a`来引用`package/a.js`，也可以用`./a`来引用`package/a.js`

	// package/a.js
	KISSY.add('package/a',function(S){
		return ObjA;
	},{
		// 当前逻辑依赖一个包内的文件b，一个全局模块node，一个同目录下的css文件
		requries:['package/b','node','./mod.css']	
	});

使用该模块

	KISSY.use('package/a',function(S,ObjA){
		// 可引用ObjA
	});

本地开发时，模块名称可留空，不过在部署阶段需要使用[Kissy Mobule Compiler](https://github.com/daxingplay/ModuleCompiler) 生成模块依赖关系表，或者直接生成合并后的文件。

	// package/a.js
	KISSY.add(function(S){
		return ObjA;
	},{
		requries:['./b','./mod.css']	
	});


`add()`中的函数回调可以调用它依赖的模块所返回的对象

	// package/a.js
	KISSY.add(function(S,Node,ObjB){
		// 使用 Node 和 ObjB
	},{
		requries:['node','./b']	
	});

当模块名称 name 为包内模块< 参见 下文包配置 >时, 则requires的模块名称可使用相对路径 refer 包内其他模块

	// tc/mods/mod1 依赖于 tc/mods/mod2
	KISSY.add("tc/mods/mod1",function(){
		// Your code...
	},{requires:['./mod2']});

> *Changed in version 1.3+*: KISSY.add 表示模块定义, fn 并不会执行, 只有在 use 时才执行, 懒加载原则.

### config()  `<static>`

* `config(config) ⇒ void`
* `config(name,value) ⇒ void`，name：参数名，value：参数值
* `config(name) ⇒ data`，返回参数名的值

#### parameters

全局配置函数，用以读写全局配置项，包括注册包、预注册模块名称，模块文件的引用规则等等。其中配置项包括这些字段，`modules`和`packages`是JSON对象：

- **modules**，JSON 对象，预注册的模块关系依赖
- **packages**，JSON 对象，包配置
- combine，Boolean值，是否开启动态合并
- comboMaxFileNum，数字类型，最动态合并文件最大个数
- tag，字符串，异步加载文件时所带的时间戳
- debug，Boolean值，是否开启debug模式，不开启，将默认加载'-min'文件
- charset，字符串，指示所有模块文件编码格式，默认为utf-8
- base，字符串，类库所在的URL
- comboMaxUrlLength，Number，Combo url 的最长长度，默认 1024
- comboPrefix，String，Combo 前缀，默认 ”??”
- comboSep，String， Combo 分隔符，默认 ”,”

**modules**：

以单个模块为键，单个模块配置对象为值的键值对对象。单个模块配置对象包括：

- requries，字符串组成的数组`String[]`，该模块的依赖模块名数组。当设置 combine 为 true 时需要配置，否则不建议配置.
- tag，类型 String，单个模块的时间戳。仅在 combine 为 false 时生效。 combine:true 时取对应包的 tag.

**packages**：

以单个包名为键，单个包配置对象为值的键值对对象。单个包配置对象包括：

- name，字符串, 表示包名
- group，字符串, 表示包所属的组名。
- debug， Boolean, 包内的脚本请求是是否加 -min 后缀，默认和 `KISSY.config(“debug”)` 相同.
- tag，字符串, 最好为时间戳, 用于刷新客户端本包的模块文件缓存
- combine，Boolean, 如果总和 combine 设置为 true，但是单个包 combine 设置为 false，则该包内文件不进行自动 combo
- ignorePackageNameInUri，Boolean, 默认 false. 是否在请求的模块路径中省去包名. 例如 `use('xx/a')` 配置 `xx` package 的 base 为 `http://test.com/` 则设置 `ignorePackageNameInUri` 后请求地址为： `http://test.com/a.js`。
- base，字符串, 表示包所在的 url 路径, 相对路径表示相对于当前页面路径, 如果需要相对于当前执行脚本路径, 则需要自己处理：<br />`var scripts=document.getElementsByTagName("script");`<br />`alert(scripts[scripts.length-1].src);`
- charset，字符串, 表示宝贝所有模块定义文件的编码格式, 默认 utf-8

#### Example

配置项可以在脚本引用时带入，比如：

	<script src='seed.js' data-config='{combine:true}'></script>

完整的配置样例：

	KISSY.config({
		// 开启自动 combo 模式
		combine:true,
		// kissy 库内置模块的时间戳
		tag:'2012',
		// kissy 的基准路径
		base:'http://x.com/a',
		packages:{
			x:{
				// x 包的基准路径
				base:'http://x.com/biz/',
				// x 包的时间戳
				tag:'x',
				// 开启 x 包 debug 模式
				debug:true
			},
			y:{
			   // y 包的基准路径
			   base:'http://x.com/biz/',
			   // y 包不开启自动 combo
			   combine:false
			   // 不配置 tag，则取 kissy 内置模块的时间戳
			}
		},
		modules:{
			"x/b1":{
				// "x/b1" 模块的依赖信息
				requires:["x/b2","x/b3"]
			},
			"y/b2":{
				// y/b2 模块单独的时间戳
				tag:'234'
			}
		}
	});

packages 范例: 包配置

	KISSY.config({
		packages:[
			{
				name:"tc", // 包名
				tag:"20110323", // 动态加载包内的模块js文件时,
								// 自动加上 ?t=20110323, 用于文件更新
				path:"../", // 包对应路径, 相对路径指相对于当前页面路径
				charset:"gbk" // 包里模块文件编码格式
			}
		]
	});

当要在包内添加模块时, 必须遵守一些约定：

- 一个模块的文件必须放在以包名命名的目录中
- 一个包下的所有目录的代码都应属于这个包，即包之间不能有重合目录。例如下面这样的包配置是错误的（在 ie 下会有包名不确定问题）：
    - tc 的 `path` 为 `http://x.com/y/`
    - tm 的 `path` 为 `http://x.com/`
- 模块的名字必须取名从包目录开始到当前模块文件的文件路径名称, 例如 `mod1.js` 位于 `tc/mods` 下, 则 `mod1.js` 的模块取名：


	KISSY.add("tc/mods/mod1",function(){
		// 模块代码
	});

> 模块名也可以省略, 不过部署阶段需要使用 [KISSY Module Compiler](https://github.com/daxingplay/ModuleCompiler) 静态打包。

### getScript()  `<static>`

- `getScript(url,config) ⇒ HTMLElement`
- `getScript(url,success,charset) ⇒ HTMLElement`，简写写法

动态加载目标地址的资源文件，config 为JSON对象，返回值为HTMLElement，为创建的link或者script节点，参数如下：

#### parameters

- url（string），js/css 资源地址
- config，JSON 对象，包含属性有：
	- charset（string），资源文件的字符编码
	- success（function），资源加载成功后回调函数.
	- error（function），超时或发生错误时回调函数. 当资源文件为 css 文件时不支持
	- timeout（Number），单位为秒, 默认无限大. 超时后触发 error 回调. 当资源文件为 css 文件是不支持

#### return

`HTMLElement` 返回创建的link或者script节点

#### Example

简写写法`getScript(url,success,charset)`中，`success`为回调函数，`charset`为编码类型。相当于：

	 KISSY.getScript(url , { 
		 success : success , 
		 charset : charset 
	});

### use()  `<static>`

`use (modNames[,callback]) ⇒  void`

载入并运行模块,和`add`一起使用，详细用法参照[KISSY 模块规范](../kmd.html)，`callback`类型可以是function也可以是object。参数说明：

#### parameters

- modNames (String|String[]) – 以逗号（`,`）分割的模块名称,例如 `KISSY.use("custommod,custommod2")`
- callback (function|Object) – 当 `modNames` 中所有模块载入并执行完毕后执行的函数或者对象描述，当callback类型为Object时，可传入两个属性：
	- success (function) – 当 `modNames` 中所有模块加载完毕后执行的函数
	- error (function) – 当前 use 失败时调用的函数，参数为失败的模块对象

#### Example

callback为函数时

	KISSY.use("depMod1,depMod2",function(S,DepMod1,DepMod2){
		// Your code...
	});

callback为对象时

	KISSY.use("depMod1,depMod2",{
		success:function(S,DepMod1,DepMod2){
			// Your code
		},
		error:function(){
			var errorMods = KISSY.makeArray(arguments);
		}
	});

> 如果使用经过配置的包内的模块, 则这些包内模块不需要事先注册, 直接 use 即可, 如果模块名以 `/` 结尾, 则自动加后缀 `index` , 例如 `use("mods/m1/")` 相当于 `use("mods/m1/index")` , 即自动加载 `m1` 目录下的 `index.js`

### importStyle()  `<static>`

`importStyle (modNames) => void`

阻塞加载 css 模块或 js 模块依赖的 css 模块, 和 KISSY.add 中的 require 配置一起使用.

#### parameter

modNames (String|String[]) – 以` , `分割的 js 模块或 css 模块名称集合字符串,例如 `KISSY.use("mod1,mod2/xx.css")`;