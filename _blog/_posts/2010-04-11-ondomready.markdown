---
title: 'yui源码学习笔记（二）ondomready模拟'
layout: post
guid: urn:uuid:a479a26e-bd0c-4c44-a607-6c4c3068c7d6
tags:
---

在刚完成的项目中，由于页面是通过嵌套来实现，而如果iframe嵌套页面是通过js动态构造的话，在ie下会不执行js。后来发现是ondomready 的实现有一些猫腻。我们知道传统的方法是通过doScroll方法来模拟onDomReady，且在jquery和yui中都使用这个方法。因为我们通常认为只有dom完全建立且被浏览器正确解析时，才会发生ondomready，在ie中有些方法比如doScroll只有在文档完全加载后才会被初始化，因此在ie中通常通过检测doScroll来判断文档dom是否加载完成。在yui2.7中是这样实现的：

	var n = document.createElement(‘p’);
	EU._dri = setInterval(function() {
		try {
			// throws an error if doc is not ready
			n.doScroll(‘left’);
			clearInterval(EU._dri);
			EU._dri = null;
			EU._ready();
			n = null;
		} catch (ex) {
		}
	}, EU.POLL_INTERVAL);

可以看到，这是一个定时器，循环执行doScroll，如果执行成功，则可以执行ready()了。

但这个方法有一个隐患，就是如果页面是在iframe中嵌套的话就会不准了。iframe中的ondomready会提前执行，而不会等待dom完全加载完成。因此如果iframe页面是通过js构造的，在还未load完js文件的时候就提前执行了ondomready，所以程序也无法启动。在yui2.8 中修复了这个bug，yui通过检测document.readyState来模拟iframe中的ondomready。yui2.8中是这样实现的：

	if (self !== self.top) {
		document.onreadystatechange = function() {
			if (document.readyState == ‘complete’) {
				document.onreadystatechange = null;
				_ready();
			}
		};
	} else {

		GLOBAL_ENV._dri = setInterval(function() {
			try {
				// throws an error if doc is not ready
				document.documentElement.doScroll(‘left’);
				clearInterval(GLOBAL_ENV._dri);
				GLOBAL_ENV._dri = null;
				_ready();
			} catch (ex) {
			}
		}, POLL_INTERVAL);
	}

在yui3.0.0中也沿用了这种方法，而在yui3beta中仍然存在这个bug。
