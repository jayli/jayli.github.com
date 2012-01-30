---
title: 'js观察者模式以及基于YUI中的实现'
layout: post
guid: urn:uuid:6ec83167-c315-41de-aca2-aa89a7b355e7
tags:
---

观察者模式是一种典型的设计模式，不论基于什么语言研讲的设计模式都包含它。概括讲，观察者模式就是“当A事件发生的时候自动执行B事件”，这是我们所期望的结果，但这句话是如此之概括以至于很多关键细节被忽略掉了，更进一步讲，观察者模式是对“事件联动性”行为的模拟，这种模拟是如此之抽象，以至于我们在类似js这种事件满天飞的语言中忽视“事件”的细节。从这个角度讲，的确不利于我们理解js中的事件。

js依赖于浏览器，浏览器在启动的时候会为我们做很多事情，因此我们才可以通过一个简单的a.onclick = function(e){…}来实现当点击事件发生时要做的事情。但从设计模式的角度讲，这只是浏览器对click事件实现了观察者模式，即当用鼠标左键单击某个元素并致使元素状态改变时发生“点击”事件。之所以如此罗嗦的使用“用鼠标点击左键单击某个元素并致使元素状态改变”这种晦涩的语言来描述这，是因为这样才能比较准确完整的描述一个“事件”所应具备的特征，从而方便我们能模仿这个过程来做自定义事件。而‘单击左键’或‘元素状态改变’这些逻辑是被浏览器”捕捉”并”处理”，我们是看不到这些细节的。也就是说，浏览器将它认为常用的事件的定义、注册、监听行为都捆绑在浏览器运行时之中，只有事件需要绑定的句柄需要在js中给出。但如果我想使用浏览器没有默认提供的事件，比如元素尺寸改变、或者左键三击事件，又该如何做呢?

先让我们分析一下简单的点击事件：
通常，绑定点击事件我们使用：

	el.onclick = function(e){
		//dosth here
	}

el 表示要点击的对象，我们称之为宿主，onclick表示事件类型，与此同时，浏览器在无时无刻的监听元素上发生的事情，并判断el状态是否发生改变，以此判断是否发生了某类事件，比如点击事件，进而开始执行用户为该元素的onclick句柄所指向的函数。由此看出，是否触发用户给 el.onclick绑定的函数是由浏览器判断完成的，浏览器承担了甄别事件类型和宿主并触发绑定函数的角色。而所谓“甄别事件类型和宿主”则是对一个 “事件”的抽象理解，自定义事件则需要实现这个抽象的“事件”逻辑。

以上，可以得出，一个事件的发生依赖与2个重要属性，宿主和状态，宿主用来判断事件发生地，状态用来判断是否fire用户绑定的事件。所有的事件都包含这两者。只是在浏览器原生事件的宿主和状态只被浏览器捕捉，对开发者不可见。

有了抽象的事件逻辑，有了事件的状态和宿主，还需要”事件注册”，只有“注册过”的事件才可以被识别和使用，或者说被大规模使用而不用重写代码，事件逻辑是固定的，不固定的只是宿主和事件发生后fire的函数。对于宿主的“状态”的监听，有两种方式，每个固定的时间间隔进行判断，或者手动给出需要判断状态的位置。出于性能考虑，常用第二种方法。

因此，一个完整的事件的发生是由“事件”、“宿主”、“宿主状态”、“事件发生”（也就是事件发生的位置）、“判断宿主状态”（也就是判断是否 fire绑定的函数）、和“事件绑定函数”这几部分组成。任何一个完整的事件都是由这些内容组成，包括浏览器原生事件和自定义事件。

在 YUI2.x中既是按照如上思路模拟了事件的全过程，并封装为customEvent（自定义）事件类，可以很方便的实现自定义事件，YUI2.x中的这种对观察者模式精炼的实践在复杂的web application中应用很广而且比较高效。在YUI3中，每类自定义事件都被抽象出来，形成“事件工厂”，事件工厂生成事件对象，事件对象注册事件类型，并绑定fire的函数，这种更深层次的抽象对自定义事件的管理是大有裨益的。最牛X的，YUI3的自定义事件居然可以冒泡，这些都是后话，先来实践下YUI3下的自定义事件，我们来作一个鼠标三击事件。

首先要注意的是，鼠标点击事件在ie和firefox里的表现是有区别的。两次快速的连续点击在ie中被当作双击事件，而在firefox中触发了两次单击事件和一次双击事件。因此这里需要针对ie作简单hack。

js代码:

	YUI().use(‘dump’,'node’,function(Y){

		//发布者工厂
		var tripleClickFactory = function(id,interval){
			this.el = Y.get(id);
			this.status = false;
			this.trp = [];//三次点击的时间
			this.interval = interval||100;//毫秒
		};

		//包装发布者
		Y.augment(tripleClickFactory, Y.Event.Target);

		//tripleClick事件对象
		var tripleClick = new tripleClickFactory(‘#iid’,800);

		//绑定函数
		tripleClick.subscribe(‘tpClick’, function(a){
			//a,时间间隔数组
			alert(‘三击事件,三次点击的两个间隔分别为:’+a[0]+’和’+a[1]+’毫秒’);
		});

		//事件
		var tripleClickEvent = function(e){
			//var el = e.target;
			tripleClick.trp.push((new Date()).getTime());
			if(tripleClick.trp.length 3){
				var a = [];
				for(var i = 1;i<= 3;i++){
					a[i-1] = tripleClick.trp[ i ];
				}
				delete tripleClick.trp;
				tripleClick.trp = a;
			}
			var s1 = tripleClick.trp[2] – tripleClick.trp[1];
			var s2 = tripleClick.trp[1] – tripleClick.trp[0];

			if(Number(s1)<=tripleClick.interval && 
					Number(s2) <=tripleClick.interval){
				tripleClick.fire('tpClick',[s1,s2]);
				tripleClick.trp = [];
			}
		};

		///////////////runtime///////////////////

		Y.on('click',function(e){
			tripleClickEvent(e);
		},'#iid');

		if(Y.UA.ie != 0){//hack for ie
			Y.on('dblclick',function(e){
				tripleClickEvent(e);
			},'#iid');
		}

	});
