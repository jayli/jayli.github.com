

### S.add()

`add(name,fn[,config]) ⇒ void`

KISSY 添加模块/逻辑片段的函数，config为配置对象，包括`config.requries`，给出当前模块的依赖模块。模块返回一个对象，通过引用它的时候来调用到。

当模块名称 name 为[包内模块](#loader_config)时, 则requires的模块名称可使用相对路径来引用包内其他模块，比如`package/a`来引用`package/a.js`，也可以用`./a`来引用`package/a.js`

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

本地开发时，模块名称可留空，不过在部署阶段需要使用[Kissy Mobule Compiler](https://github.com/daxingplay/ModuleCompiler)生成模块依赖关系表，或者直接生成合并后的文件。

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

> *Changed in version 1.3+*: KISSY.add 表示模块定义, fn 并不会执行, 只有在 use 时才执行, 懒加载原则.
