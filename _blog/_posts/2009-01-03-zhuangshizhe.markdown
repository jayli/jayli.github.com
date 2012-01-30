---
title: 'YUI3中的“装饰者”，以及其基于“装饰者”的继承'
layout: post
guid: urn:uuid:1f0a0059-5d04-4930-b492-5e3c3269a864
tags:
---

和 YUI2相比，YUI3的模块粒度远远高于YUI2，高粒度可以使得基于yui的程序按需加载yui文件。比如yui2的connection组件在 yui3中就变成io组件，和yui2中单独一个12k的connection.js相比，yui3中的ajax组件被拆分成了io-base.js、 io-form.js、io-queue.js、io-upload-iframe.js和io-xdr.js每个文件平均3k多，那么如果开发者只要实现简单的ajax只使用io-base.js就够了，相比YUI2，页面所需要的js文件体积从12k降低到3.43K。

在这些`io-*.js`功能极其相似有用处不同的文件中，YUI3使用一种极其简单的方法来管理这些相互依赖又功能不同的文件：妆饰者。装饰者模式是经典23 种设计模式中最常用的模式之一，其作用是降低相似模块之间的耦合，典型做法是在已有的功能性代码基础上，在不修改基础代码的前提下，有效扩展原有功能并继续保持原有类的高内聚。是替代“修改基础类”的一种高效的方法。类似yui2中的extend。yui3的装饰者是使用Y.mix来实现的，比如：

	var A = {
		a:1,b:2
	};
	Y.mix(A,{
		c:0
	});

这里的A就被增加了c的属性，而A原有的属性没有被改变。在yui3中大量使用了这种简单的装饰，是一种简化的继承和扩展。这样的话，io- form.js就可以基于io-base.js使用这种方式进行扩展，因此，io-form.js就可以包含io-base.js的所有功能，同时扩展出了form的功能，此外，io-base.js还可以被xdr、upload等进行功能性的扩展，使得代码具有很高的灵活性。在sns产品模块化的过程中，这种方法是很有启发的。

外一篇：

我在blueidea上发表的一篇：“js设计模式之装饰者模式”

http://bbs.blueidea.com/thread-2906913-1-1.html
