# FAQ

### Q:DOM 和 Node 有什么区别？

Dom 是面向原生节点的第一层封装，主要是处理浏览器兼容和功能差异，Node 是对节点的第二层封装，主要是整合节点的功能并提供标准的API。

	var btn = KISSY.DOM.get('#btn');// 得到原生节点
	var btn = KISSY.Node.one('#btn');// 得到包装后的节点

### Q:`*-min.js`和`*.js`的区别

`*-min.js`是对应js的压缩版本，开发阶段引用`*.js`方便调试，发布到线上引用`*-min.js`减少文件体积。通常在URL中带入参数`?ks-debug`开打开KISSY的debug模式。`*-min.js`一般不需要手动生成，需要用工具来生成。

### Q:`rich-base`和`base`模块我应该用哪个？

在1.4.0以及后续版本中，`rich-base`模块已经不存在，只有`base`模块，这里的base模块包含RichBase的功能，在1.3.0及以前版本中，需要引用`rich-base`来加载`富组件模板`。1.3.x 及以前版本推荐直接使用`rich-base`，1.4.0及后续版本，只需使用base即可。

### Q:KISSY 载入没有通过`add`注册的模块时不执行回调，如何解决？

比如:

	// a.js
	var a = 1;

主程序use这个"模块":

	KISSY.use('a',function(){
		// 不执行回调	
	});

`KISSY.use`只有一层含义："执行已经注册过的模块并触发回调"。执行的过程中会探测模块是否已经加载，这里的加载外部模块是正常逻辑，不是独立的一个功能。因此，通过KISSY加载外部“模块”时（外部模块不是[kmd](kmd.html)格式），会认为不存在名为a的模块，因此不会执行回调。这样作的好处是依赖关系始终很清晰、不会混淆文件模块和非文件模块。坏处就是`KISSY.use`只能用于满足kmd规范的模块。KISSY 的设计遵循“约定高于配置“，用易于理解的约定代替一语双关的函数用法的多态。

`YUI().use()`具有两层含义："加载外部模块并触发回调"、"执行模块逻辑并触发回调"。因此`YUI().use()`可以加载非格式化的外部模块。这样作的好处是API统一，坏处是需要根据代码上下文搞清楚`use()`到底承担哪种角色。

KISSY 载入外部"文件模块"时，推荐使用`KISSY.getScript()`。

### Q:如果`use()`的模块过多，回调参数需要和模块列表一一对应，有没有更简单的办法？

经常看到这种代码：

	// use 的模块太多，一不小心就和 function() 里的回调不对应了
	KISSY.use('a,b,c,d,e,f,g',function(S,A,B,C,D,E,F,G){
		// Your code...
	});

有没有办法不用去肉眼找模块和变量的对应关系？有方法，KISSY 1.4.0 提供了`require`语法糖

	KISSY.use('a,b,c,d,e,f,g',function(S){
		var A = S.require('a');
		var B = S.require('b');
		var C = S.require('c');
		// Your code...
	});

### Q:淘宝 CDN 的 Combo 功能很酷，我可以自己部署吗？

淘宝 CDN 基于 Nginx，CDN Combo 是 Nginx 的一个模块，项目开源，参照这里：[HTTP Concatenation module for Nginx](https://github.com/alibaba/nginx-http-concat)

