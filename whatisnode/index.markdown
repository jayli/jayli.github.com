![cover](http://img03.taobaocdn.com/tps/i3/T15q4UXa4CXXXXXXXX-320-419.jpg)

# 什么是Node？

## Node不是万能药！但的确能解决一些关键问题。

学习Node不是一件轻松事儿，但你所收到的回报是对得起你的付出的。因为当下Web应用开发中的诸多难题唯有JavaScript才能解决。

作者：Brett McLaughlin ，译者：[拔赤](http://jayli.github.com)

### 目录

- 专家门的警告！
- Node：几个小例子
- Node不是JavaScript，Node可以运行JavaScript
- 和Node服务器的交互
- 快速入门手册
- 四不像
- 大型Web应用
- Node的用武之地

“你够酷吗？来用我吧！” Node.js 为最新潮的编程语言提供了一系列很酷的API和工具箱，它可以直接应用于传统的Rails、Ajax、Hadoop、甚至可以某种程度上用于iPhone开发和HTML5。如果你参加过一些大型技术会议，你总是会听到一些关于Node.js的主题演讲，尽管这些话题对普通的开发者来说依然有些难以企及。

你可能已经听说Node.js（有时我们将其简称为“Node”）是一个服务器端的解决方案，它可以运行JavaScript，并可以作为Web服务来处理HTTP请求。如果这些东东还不至于让你晕头转向的话，转眼间关于端口、sockets和线程的讨论就又成了当下最热门的话题，你会觉得这些东西让你眼花缭乱。这些内容真的属于JavaScript的范畴吗？为什么世界上那么多人宁愿将JavaScript脱离浏览器而运行，更不用说将JavaScript运行于服务器端了？

好消息是，你所听到的（所想到的）关于Node的一切都是正确的。Node的的确确是属于网络编程的范畴，用以处理服务器端的请求和响应。坏消息是和之前的Rails、Ajax和Hadoop一样，真正实用的技术资料实在太少。等到基于Node的“优秀的”框架成熟之后，技术资料一定会跟得上的，但何必要等到技术书籍和教程都出来之后再去尝试使用Node呢？现在就使用Node，说不定会给你的代码带来意想不到的改观，甚至让你的程序变得更易实现。

## 专家门的警告！

和大多数技术一样，Node也是新瓶装旧酒：它看起来不透明而且很怪异，但独受小开发团队的青睐。如果你没有接触过Node，则需要学习一些很容易上手的服务器端脚本。你需要化时间来搞清楚Node，因为即便是运行于服务器端的JavaScript，它和客户端JavaScript也极为不同。实际情况是，你不得不自己给自己洗脑，以便重新学习理解围绕JavaScript的事件处理机制、异步IO和一些网络基础知识。

不幸的是，这意味着如果你已经用Node作开发超过两年时间的话，你会觉得这篇文章内容很单调乏而且过于简单。你会开始寻找新的“刺激”，比如将Node运行于客户端，或者开始尝试事件I/O、反射器模式和npm。你会发现Node的世界是如此有趣，甚至很多Node高级技术具有某种史诗般的美感，而这些东西对于初学者来说依然是难于企及的。因此，或许你应该将你掌握的知识分享给你的同伴，尤其是对于那些不了解Node的同学，当他们开始对Node感兴趣时，给他们分享传授Node高级技术。

## Node：几个小例子

首先，你应当意识到Node是用于运行独立的JavaScript程序的，而不是运行于浏览器中的某个HTML片段里。它是存放在文件系统中的真实存在的文件，由Node程序执行，以一种守护进程的模式运行，同时打开对某些端口的监听。

### 跳过 hello world

最经典的例子当然是“Hello World“，在Node官网（http://nodejs.org/docs/latest）上有源码。几乎每个人都是从Hello World开始接触Node的。现在让我们跳过这个最简单的例子，来看一些更有趣的例子：实现一个可以从服务器发送文件到客户端的程序（而不仅仅是发送一段文本到客户端）。

	var sys = require("sys"),
	http = require("http"),
	url = require("url"),
	path = require("path"),
	fs = require("fs");
	http.createServer(function(request, response) {
		var uri = url.parse(request.url).pathname;
		var filename = path.join(process.cwd(), uri);
		path.exists(filename, function(exists) {
			if(!exists) {
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.end("404 Not Found\n");
				return;
			}
			fs.readFile(filename, "binary", function(err, file) {
				if(err) {
					response.writeHead(500, {"Content-Type": "text/plain"});
					response.end(err + "\n");
					return;
				}
				response.writeHead(200);
				response.end(file, "binary");
			});
		});
	}).listen(8080);
	console.log("Server running at http://localhost:8080/");

感谢Mike Amundsen，他给出了这段代码的相似的实现。这个例子是由Devon Govett在Nettuts+上提交的一段代码，尽管已经根据新版本的Node作了更新，但Devon的[整个帖子](http://net.tutsplus.com/tutorials/javascript-ajax/learning-serverside-javascript-with-Node-js/)是一个非常好的入门学习教材，对于初学者来说更是如此。

如果你是一个新手，你可以将上述代码保存到一个文本文件中，命名为NodeFileServer.js。在运行之前你需要一个Node运行环境，最新的Node版本可以从[官网](http://Nodejs.org/)下载[这个文件](http://Nodejs.org/docs/latest/#download)或者从[github上](https://github.com/joyent/Node)将源码取下来。你需要编译源码，如果你没有用过Unix、对make和configure不甚熟悉，则需要查阅在[线编译手册](https://github.com/joyent/Node/wiki/Installation)来寻求帮助。

## Node不是JavaScript，Node可以运行JavaScript

刚刚你将NodeFileServer.js存成了某个文件，别担心，我们等下会回过头来运行它的。现在，让我们移步到现实当中来，在Unix中执行典型的配置和编译命令：

	./configure
	make
	make install

这让我们确信一个事实：Node不是JavaScript，Node是一个可以运行JavaScript的程序，但Node绝对不是JavaScript。实际上，Node是基于C写的程序。可以通过ls来查看Node/src目录中的文件，可以看到Node的源码：

![png](http://img04.taobaocdn.com/tps/i4/T1rtxUXjNzXXXXXXXX-500-335.png)

大多数人会以为，JavaScript是一门糟糕的语言，更不用说用它来实现服务器端的功能了，其实你只对了一半。不错，对于操作系统级别的Socket和网络编程来说，JavaScript可能并不能胜任。但Node并不是JavaScript实现的。它是基于C实现的，C语言是可以完美的胜任任意量级的网络编程的。而JavaScript则完全有能力将指令传递给C程序，然后由C程序来操控操作系统“地下城”。实际上，和C语言相比，JavaScript更容易被开发者们接触到，这是值得引起注意的地方，如果你想用Node进行一些严肃的编程的话，这个原因会被一再提及。


