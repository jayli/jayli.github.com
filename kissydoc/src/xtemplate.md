# xtemplate

XTemplate 是富逻辑的 KISSY 模板引擎，和[Mustache](http://mustache.github.io/)以及[juicer](http://juicer.name/)类似，Xtemplate 面向更复杂的业务逻辑场景，同时保持高性能和丰富的配置方法，是易学易懂的模板语言。

一个典型的XTemplate模板实例：

	Hello {{name}}
	You have just won ${{value}}!
	{{#if data}}
		{{#each data}}
			{{name}}-{{xindex}}/{{xcount}}
		{{/each}}
	{{/if}}

对应要填充的JSON：

	{
		name:'Kissy',
		value:'10000',
		data:[
			{name:1},
			{name:2}
		]
	}

拼装结果：

	Hello Kissy You have just won $10000! 1-0/2 2-1/2 

XTemplate 可以放置于HTML、配置文件、程序代码中，核心机制就是把模板中的标签替换为JSON对象给定的值，并同时具有一定的模板语言逻辑。模板中除了提供最简单的变量替换，还提供if、else和foreach等常见功能。所谓标签，指的是双花括号包含的一个标记，`{{name}}`就是一个标签，`{{#name}}`也是一个标签。XTemplate模板语言是抽象的，可以有多种编程语言的实现，KISSY 的`xtemplate`模块实现了 XTemplate 标记语言。

这样来引入xtemplate模块：

	KISSY.use('xtemplate',function(S,XTemplate){
		// use XTemplate
	});

如何通过KISSY来解析XTemplate模板？先看一个简单的例子，实现变量替换：

	KISSY.use('xtemplate', function (S, XTemplate) {

		var tpl = 'this is {{title}}!';

		var data = {
			title: 'o'
		};
		var render = new XTemplate(tpl).render(data);

		alert(render);// => "this is o!"
	});

更多例子：[KISSY XTemplate Demos](http://docs.kissyui.com/docs/html/demo/component/xtemplate/index.html)

----------------------------------

## KISSY XTemplate 语法

### `{{key}}`变量替换

使用`{{key}}`输出变量值，`key`表示要替换的JSON中的key，替换为JSON中key对应的value。比如XTemplate：

	this is {{title}}!

要填充的JSON对象：
	
	{
		title:'Kissy'
	}

拼装结果为：

	this is Kissy!

### `{{if condition}}`条件语句

使用`{{if condition}}`来实现条件判断，`condition`表示要判断的值，判断是否存在、为空、是否为falsy。比如模板为：

	{{#if title}}
		has title
	{{/if}}
	{{@if title2}}
		has title2
	{{else}}
		not has title2
	{{/if}}

要填充的JSON对象：

	{
		title:'kissy',
		title2:''
	}

填充结果为：

	has title 
	not has title2 

其中`{{#if}}`和`{{@if}}`完全等价，在某些环境中（比如velocity）里`#`有特殊语义，这时可以用`@`作为`if`前缀。

此外，`title`的取值不为这些值时被认为是真值：`0`，`null`，`''`，`false`，`NaN`，`undefined`。当取值为空数组`[]`或空对象'{}'时，则认为是真值。

### `{{^if condition}}`条件非语句

使用`{{^if condition}}`来实现条件非，如果`condition`值为空或者假值（`0`， `null`， `''`， `false`， `NaN`， `undefined`），则此语句为 true。如果`condition`有值且是真值，语句为 false。比如这段 XTemplate 模板：

	{{^if title}}
		do not has title
	{{/if}}
	{{^if title2}}
		do not has title2
	{{else}}
		has title2
	{{/if}}

填充的JSON为：

	{
		title:undefined,
		title2:''
	}

填充结果为：

	do not has title 
	do not has title2 

### `{{#each}}`循环语句

#### 循环对象数组

使用`{{#each data}}`表示循环，`data`表示循环的对象，数组类型，每个item为一个对象，比如这段 XTemplate：

	{{#each data}}
		{{name}}-{{xindex}}/{{xcount}}
	{{/each}}

如果填充的JSON为数组类型：

	{
		data:[
			{name:1},
			{name:2}
		]
	}

渲染结果为：

	1-0/2
	2-1/2

这时循环内的`{{xindex}}`表示循环的索引值，`{{xcount}}`表示循环的总次数，`{{name}}`是数组中每个对象的属性`name`，替换为属性的值

#### 循环单数组

循环的`data`为数组类型，每个item为一个值，而非对象，比如这段XTemplate：

	{{#each data}}
		{{this}}-{{xindex}}/{{xcount}}
	{{/each}}

要填充的JSON对象为：

	{
		data:['jayli','yiminghe']
	}

渲染结果为：

	jayli-0/2
	yiminghe-1/2

其中循环内的`{{this}}`表示当前循环的item值，`{{xindex}}`和`{{xcount}}`含义同上

#### each中数据层次相对位置的访问

循环体内可以获取JSON对象上的其他属性，同过相对位置写法获得，比如这段XTemplate：

	{{#each data}}
		{{this}}-{{../total}}
	{{/each}}

要填充的JSON对象为：

	{
		data: [1, 2],
		total: 3
	}

填充结果为：

	1-3
	2-3

其中，`{{../total}}`表示从循环体内跳出到`data`属性所在的层级，去查找`data`属性的兄弟属性`total`的值。同样，`{{#each}}`可以被`{{@each}}`代替。

### `{{#with}}`语句

类似 JavaScript 中的`with`语法，with 语句是为逐级的对象访问提供命名空间式的速写方式。我们在 XTemplate 中增加了类似的功能。比如`{{#with data}}...{{/with}}`,中间可以直接调用对象`data`里的属性，输出对应的值。

比如这段 XTemplate

	{{#with data}}
		{{name}}-{{age}}
	{{/with}}

要填充的JSON为：

	{
		data:{
			name:'jayli',
			age:'2'
		}
	}

填充结果为：

	jayli-2

其中`{{#with}}`可以用`{{@with}}`代替

#### 支持 with 中数据层次间的相对位置访问

同`{{#each}}`一样，with 语句中也可以用相对路径写法来访问对象其他层级的属性，比如这段模板：

	{{#with data}}
		{{#with p}}
			{{name}}-{{age}}-{{../l2}}-{{../../l1}}
		{{/with}}
	{{/with}}

要填充的JSON为：

	{
		l1: 1,
		data: {
			l2: 2,
			p: {
				name: 'h',
				age: 2
			}
		}
	}

填充结果为：

	h-2-2-1

### `{{!comment}}` 注释

XTemplate的注释写法为`{{!comment}}`，其中comment为注释内容，注释将会被忽略。

### `\\{{prop}}` 标签的转义

如果想直接输出`{{prop}}`的内容，而不想被解析为标签，则用转义写法`\\{{prop}}`，比如模板：

	output \\{{name}} as {{name}}

要填充的JSON为：

	{name:'jay'}

输出结果为：

	output {{name}} as jay

### `{{{prop}}}` html 标签转义

如果输出的内容中包含字符`<`和`>`，在普通标签`{{prpp}}`中会被转义为`&lt;`和`&gt;`，如果不想被转义，需使用`{{{prop}}}`，比如这段模板：

	my {{title}} is {{{title}}}

要填充的JSON为：

	{
		title:'<a>'
	}

输出结果为：

	my &lt;a&gt; is <a>

### 用表达式作为变量

目前支持的表达式为`+`，`-`，`*`，`/`，`%`。比如这段模板：

	{{n+3*4/2}}

填充JSON为

	{n:1}

输出结果为：

	7

### 关系表达式

目前支持目前支持 `===` `!==` `>` `>=` `<` `<=`，比如这段模板：

	{{#if n > n2+4/2}}
		{{n+1}}
	{{else}}
		{{n2+1}}
	{{/if}}

要填充的JSON：

	{
		n:5,
		n2:2
	}

输出结果为：

	6

### each 循环中的关系表达式

直接看例子，看这段模板：

	{{#each data}}
		{{#if this > ../limit+1}}
			{{this+1}}-{{xindex+1}}-{{xcount}}
		{{/if}}
	{{/each}}
	
要填充的JSON

	{
		data: [11, 5, 12, 6, 19, 0],
		limit: 10
	}

填充结果：

	13-3-6
	20-5-6

### with 中的关系表达式

直接看例子，看这段模板：

	{{#with data}}
		{{#if n > ../limit/5}}
			{{n+1}}
		{{/if}}
	{{/with}}

填充JSON为：

	{
		data: {
			n: 5
		},
		limit: 10
	}

输出结果为：

	6

### `{{set}}`设置变量

通过`{{set expression}}`来设置变量的值，可以设置多个，赋值表达式之间用空格分隔，比如这段模板：

	{{#each data}}
		{{set n2=this*2 n3=this*3}}
		{{n2}}-{{n3}}
	{{/each}}

填充JSON：

	{
		data: [1, 2]
	}

结果为：

	2-3
	4-6

### 对 mustache 对象的兼容

XTemplate 支持对 [mustache](http://mustache.github.io/) 形式的对象的兼容，比如这段模板：

	{{#data}}{{name}}-{{age}}{{/data}}

填充JSON为：

	{
		data: {
			name: 'h',
			age: 2
		}
	}

输出结果为

	h-2

### 对 mustache 数组的兼容

XTemplate 支持对 [mustache](http://mustache.github.io/) 形式的数组的兼容，比如这段模板：

	{{#data}}
		{{name}}-{{xindex}}/{{xcount}}
	{{/data}}

填充JSON：

	{
		data: [
			{name: 1},
			{name: 2}
		]
	}

输出结果为：

	1-0/2
	2-1/2





	
-------------------------------------------------------

## KISSY XTemplate 附加功能

以上语法可以在不同语言中实现，在 JavaScript 环境中得益于 JS 语言的动态性，KISSY 为 XTemplate 提供了更多的浏览器端的渲染策略和工具。这些功能只在 JavaScript 的实现中可用，如果你的模板可同时被JavaScript渲染也会被其他语言渲染（比如在后台被Java渲染），请尽可能避免这种用法。

### 函数模板

支持 JavaScript 函数作为模板，XTemplate模板为：

	var tpl = function (scopes) {
		return 'this is ' + scopes[0].title + '!';
	};

对应的JSON如下

	var data = {
		title:'kissy'
	};

拼装结果为：

	this is kissy!

完整的代码为：

	var tpl = function (scopes) {
		return 'this is ' + scopes[0].title + '!';
	};

	var data = {
		title: 'kissy'
	};

	var render = new XTemplate(tpl).render(data);

	alert(render);// => this is kissy!

### 全局行内单个标签扩展

如果我想扩展 XTemplate 中的标签个数，需要自定义扩展标签，使用`XTemplate.addCommand()`实现全局行内命令扩展，比如这样一段扩展（自定义一个单个标签，无配对出现）：

	XTemplate.addCommand('global', function (scopes, option) {
		return 'global-' + option.params[0];
	});

这样这段模板就可以渲染出来：

	my {{global title}}

如果JSON为`{title:'1'}`，那么渲染结果为：

	my global-1

### 全局块状标签扩展

除了扩展单个标签，还可以扩展块状标签，例子：

	 XTemplate.addCommand('global', function (scopes, option) {
		return 'global-' + option.fn(scopes);
	});
	
对于这段模板就可以被识别：

	{{#global}}
		{{title}}
	{{/global}}

如果JSON对象为`{title:1}`，渲染结果为：

	global-1

### 删除全局标签的定义

用`removeCommand()`方法来删除自定义的全局标签，调用格式为：`XTemplate.removeCommand(commandName,fn)`。

### 局部行内标签扩展

如果要把标签扩展不做成全局，可以临时定义针对一段模板的标签扩展，做法是在`XTemplage()`函数中传入第二个配置参数：

	var render = new XTemplate(tpl, {
		commands: {
			'global': function (scopes, option) {
				return 'global-' + option.params[0];
			}
		}
	}).render(data);

### 局部块状标签扩展

类似行内标签扩展，块状标签扩展需要用`option.fn(scopes)`来激活，参照上文，做法是：

	var render = new XTemplate(tpl, {
		commands: {
			'global': function (scopes, option) {
				return 'global-' + option.fn(scopes);
			}
		}
	}).render(data);

### 局部后缀名判断标签扩展

参照标签的扩展规则，再来看一个更复杂的例子，我们可以自定义条件判断的规则：

	var render = new XTemplate(tpl, {
		commands: {
			'endsWith': function (scopes, option) {
				return S.endsWith(option.params[0], 
							option.params[1]) ? option.fn(scopes) : '';
			}
		}
	}).render(data);

这里扩展了自定义标签`endsWith`，对于这段模板：

	{{d}} ends with {{#endsWith d "jpg"}}jpg{{/endsWith}}
	{{#endsWith d "gif"}}gif{{/endsWith}}

JSON对象为`{d:'x.jpg'}`，输出结果为：

	x.jpg ends with jpg


