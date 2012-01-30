
---
title: '将你的 KISSY 程序移植到服务器端 – nodejs-kissy 项目简介'
layout: post
guid: urn:uuid:73850b0d-7217-475b-b665-1034ca71b2dd
tags:
---
如果你还不了解 NodeJS，请参照 <a href="http://nodejs.org/" target="_blank">NodeJS.org</a>，简言之：

<blockquote>Node.js 是服务器端的 JavaScript 运行环境，它具有<a href="http://en.wikipedia.org/wiki/Non-blocking_algorithm" target="_blank">无阻塞</a>(non-blocking)和<a href="http://en.wikipedia.org/wiki/Event-driven_programming" target="_blank">事件驱动</a>(event-driven)等的特色，Node.js 采用 <a href="http://code.google.com/p/v8/" target="_blank">V8</a> 引擎，同样，Node.js 实现了类似 <a href="http://apache.org/" target="_blank">Apache</a> 和 <a href="http://nginx.org/" target="_blank">nginx</a> 的web服务，让你可以通过它来搭建基于 JavaScript 的 Web App。</blockquote>
你可以通过我们前些天 team 内的一个分享来了解下 NodeJS

<iframe src='http://www.slideshare.net/slideshow/embed_code/5576953' width='500' height='410' border=0></iframe>

<strong>nodejs-kissy 项目</strong>

<a href="http://github.com/kissyteam/kissy" target="_blank">KISSY</a> 是淘宝网开发的一款轻巧灵活的JS框架，如今已经是1.1.5版本，并在淘宝网广泛应用，在浏览器端给我们带来更加清新的体验，今天让我们更进一步，我们发起了<a href="http://github.com/kissyteam/nodejs-kissy" target="_blank">nodejs-kissy</a> 项目，你的 KISSY 程序可以无缝移植到服务器端了

<a href="http://ued.taobao.com/blog/wp-content/uploads/2010/11/nodejs-sombrero.png"></a><a href="http://ued.taobao.com/blog/wp-content/uploads/2010/11/未标题-1.png"><img class="alignnone size-full wp-image-2689" src="http://ued.taobao.com/blog/wp-content/uploads/2010/11/未标题-1.png" alt="" width="323" height="86" /></a>

<strong>从这里开始 nodejs-kissy</strong>

得益于 KISSY 轻巧的设计，核心模块可以很充分的解偶，所以对 KISSY 作简单hack就能够运行在 NodeJS 上。但开始之前应该首先准备好预装了 <a href="http://npmjs.org/" target="_blank">npm</a> 的服务器(linux/FreeBSD/MacOS/cygwin)，npm 是 NodeJS 软件包管理器，类似yum 和 apt-get，通过他来安装 NodeJS 的软件包会非常方便。

准备 npm：

	curl http://npmjs.org/install.sh | sh

如果你的账户没有权限则先准备好目录权限：

	sudo chown -R $USER /usr/local

安装成功后就可以通过 `"npm install package_name"` 命令来安装 NodeJS 软件包了

安装 Nodejs-KISSY 的依赖：服务器端没有浏览器环境，要运行js需要模拟真实的浏览器环境，因此 KISSY 需要依赖一些包：

	npm install jsdom
	npm install htmlparser
	npm install express
	npm install connect

安装Nodejs-kissy：

	npm install kissy

运行 “hello world”：

新建文件 helloworld.js

	var S = require('kissy').KISSY;
	S.ready(function(S){
			S.log('hello world!');
	});

运行：

	node helloworld.js

<strong>更方便的移植?</strong>

你可能会好奇，服务器端没有浏览器，为什么KISSY能如此轻松的运行在服务器端？这主要是因为KISSY的模块加载机制是脱离浏览器环境的，也就是说KISSY.use、KISSY.add、KISSY.app是和环境无关的，它只关系到你组织代码的方式和风格，另外，得益于足够原生态的KISSY-DOM实现，KISSY只调用到domjs（domjs的高层api是面向YUI3设计的）的基础方法，所以DOM相关操作依然可以无缝嫁接到服务器端，相对于YUI3核心模块的深层次耦合，KISSY的移植实在是太轻松了。

<strong>策略上的取舍</strong>

KISSY 基于“one for all”理念的core和粗粒度的widget，使得KISSY可以使用更少的"引入文件"来执行程序，而非必要一定采用combo(即使采用combo性能未必提高多少)，这样使得require的逻辑策略更简便。

<strong>所见即所得</strong>

和YUI3一样，KISSY-Loader 也可以非常方便的引入外部脚本，不管脚本是存放在服务器上，还是通过http请求到，开发者只要require fullpath即可，非常低碳，比如我可以这样运行：

	var S = require('kissy').KISSY;
	S.add({
		'menu':{
			fullpath:'http://cdn/menu.js'
		}
	}).use('menu',function(S){
		new S.Menu('ID');
	});

总之，你在浏览器端怎么用 KISSY，你就在服务器端怎么写，接下来，nodejs-kissy 项目的主要工作是更多的测试和提高其健壮性。nodejs-kissy 和 KISSY 一样基于 <a href="http://github.com/kissyteam/kissy/blob/master/LICENSE.md" target="_blank">MIT</a> 协议，你可以通过 <a href="https://github.com/kissyteam/nodejs-kissy" target="_blank">fork github</a> 上的项目来参与 nodejs-kissy 的开发。
