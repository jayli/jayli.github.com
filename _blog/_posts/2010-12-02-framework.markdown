
---
title: '如何量身打造一个前端框架续'
layout: post
guid: urn:uuid:134a117f-25e5-45f1-9c31-9a51aabcb4a4
tags:
---

续上篇

程序层面，重点是？

框架包含：核心(core)、适配器(adapter)、基础接口(public api)、代码管理(sandbox & plugin)、组件库(widgets)，显然，框架的重点在于基础接口、和代码管理机制的设计。widget的实现是基于框架提供的public api，public api interface一旦定型尽量不要更改，也就是说，设计要遵循编程基本原则：面向接口，而不是面向实现，这个原则的基本要求是接口的稳定性。因此，框架版本升级导致接口更改的情况可以不考虑？

框架设计师应当将有限的精力放在adapter、public api、sandbox & plugins上，以保证框架基础逻辑设计思路清晰，widget和外部plugin的实现则是纯粹工作量的堆积，可以由更多的人参与开发，以分担框架设计师的工作。

需不需要对core进行重构？

比较纠结的问题是，要不要对core进行重构？即将适配器以下都由自己重构，完全放弃现有的jquery或者yui，这个看情况，个人认为，使用现成的 “库”是比较聪明的选择，开源的初衷不也是这样吗？我们要做的，只是将jquery式的api或者yui式的api转换成我想要的api格式即可，api 的实现，有什么重要呢？

开发者的角色？

框架设计：框架设计师着力设计public api和sandbox & plugin，adapter可以另有人做，只要对adapter有规范完整的黑盒测试即可。
widget开发：可以由更多的人基于pbulic api开发大量的widget，入库保证有code review即可。
应用开发：任何人基于sandbox和widget都可以开发app了。

各自的视野？

对于框架的使用者来说，他们的视野仅限于sandbox、plugin usage、widgets，手旁只要准备一本public api手册就天下无敌了。对于框架开发小组来说，着重维护widget和api，把项目中的widgets不断抽离、code review并入库。对于工程师来说，他们的视野是一本手册和一些demo，没有必要理解框架的细节。对于那些业余的人来说，让他们一眼看到这个框架有这么多widget和demo，他们就会傻乎乎的开始用了。。。

因此，框架的开发，在于专业、在于坚持、在于团队，三者缺一不可。。。

to be continue…
