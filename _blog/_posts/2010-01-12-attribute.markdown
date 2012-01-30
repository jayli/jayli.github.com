---
title: 'yui3的attribute utility'
layout: post
guid: urn:uuid:6fc327d7-da95-49b8-94d0-acee41522d1e
tags:
---

js是基于对象的，但对象的属性都是public，是可以任意修改的，控制不佳会带来很多隐患，包括随意的修改带来的代码之间的强耦合，这是违反非侵入性的原则的。yui3提供了attribute功能，使得基于yui3的代码可以实现类似c++或者java的属性的封装，对属性的读写需要通过get和 set方法，而且可以给属性指定只读或者只写属性，但个人感觉在单纯功能性的代码coding中，这个attribute并不常用，而当团队增量开发的时候，比如对yui3的开发，对库的开发，参与者是全球的开发者或者是一个团队，这时就需要养成良好的封装代码的习惯，这对提高编程水平是很有帮助的。其实在yui2中处处可见这种封装，比如Element Utility和DataSource，而yui3将这种做法抽象出了一种机制，作为attribute utility供他人扩展使用。因此这种做法更具通用性。

yui3官方文档对attribute utility的描述很简单：

> The Attribute utility allows you to add attributes to any class through an augmentable Attribute interface. The interface adds get and set methods to your class to retrieve and store attribute values, as well as support for change events that can be used to listen for changes in attribute values.（Attribute组件可以使你通过可扩充的属性接口给任意class添加属性。接口可以给class添加get和set方法用来存值和取值，甚至可以添加对属性改变的监听。）

> In addition, attributes can be configured with custom getters, setters and validators, allowing the developer to normalize and validate values being stored or retrieved. Attributes can also be specified as read-only or write-once.（另外，用户可以自定义get、set和验证方法，用以将存取机、验证制通用化。属性还可以被指定只读和只写属性。）

其中比较有意思的是valueChange的监听，能解决很多棘手的问题。先看这个例子，主要代码是这样的，定义了一个Book类，Book类扩充上Attribute的公用方法，这样就可以定义其属性和实例化了：

	//定义book类
	var Book = function(attrs){
		this.addAttrs(Book.attr,attrs);
	};

	//扩充Book类
	Y.augment(Book,Y.Attribute);

	//定义属性列表
	Book.attr = {
		bookname:{
			default:’default:taobao doc’
		},
		author:{
			value:”,
			validator:function(v){
				return /\w/i.test(v);
			}
		},
		company:{
			default:’default:taobao’
		}

	};

	//生成一个abook实例
	var abook = new Book({bookname:’《js oop》’});

valueChange的实现也很简单：

	abook.on(‘booknameChange’,function(e){
		//your code here
	});

例子here：

http//www.uedmagazine.com/test/yui3_attr.html

例子中改变bookName的值的时候，就会引发一个valueChange事件。

to be continue…
