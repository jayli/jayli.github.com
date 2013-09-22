
# Why KISSY?

## KISSY 是什么？

KISSY 是一款跨终端、模块化、使用简单的 JavaScript 框架。除了完备的工具集合诸如 DOM、Event、Ajax、Anim 等，KISSY 还面向团队协作做了独特设计，提供了经典的面向对象、动态加载、性能优化解决方案。作为一款全终端支持的 JavaScript 框架，KISSY 为移动终端做了大量适配和优化，让你的程序在全终端均能流畅运行。

## 为什么选择 KISSY ?

KISSY 作为国内一个完全自底向上开发起来的框架，经历过淘系各种复杂项目的考研，在以下方面具有优势:

### 跨终端

作为生长于淘宝/天猫的前端 JavaScript 类库，在全网数以万计全终端的硬件设备中运行测试，KISSY 在我国互联网环境下各色终端、浏览器、移动设备中具备一流的健壮性和兼容性。

### 模块化

KISSY 采用高度的模块化设计，通过加载器按需加载。模块高度解耦，并具有极强的扩展性。核心组件完整齐全，接口一致。适合多种应用场景，尤其适用团队协作的大型项目开发。

### 高性能

库的实现的基本要求就是兼容性和性能，KISSY 在核心模块比如 Node、Event、Base 上做了极致的性能优化，特别是选择器性的读写效率，在各种终端里都达到很高的性能体验。KISSY 在面向对象的设计上秉承一贯的轻量级，保持轻巧高速的性能。

### 使用简单

KISSY 核心功能的设计遵循二八原则，保持最常用 API 的精简子集，自动探测终端主动适配，可以非常方便开始你的项目。清晰的面向对象功能以及轻松的架构性，更增强了 KISSY 的易用性。

## KISSY 还提供什么？

- 稳定的核心代码
- 强大易用的脚本加载器
- 丰富的 UI 组件
- 优质的代码，阅读她的代码，我敢保证你能学到更多
- 自动化脚本测试，保证代码的稳定性

此外，KISSY 还具备一定的社区：通过旺旺群（群号：29676575），[google group](http://groups.google.com/group/kissy-ui)，[微博](http://weibo.com/kissyteam)，[官方网站](http://docs.kissyui.com)等用户随时可以和开发人员快速交流。

## KISSY 的设备普适性

KISSY 支持 PC、读屏器、NodeJS、移动端浏览器以及各种外壳、Win8等。特别是 KISSY 组件的无障碍支持（遵循 WAI-ARAI 规范），使得盲人用户也可以轻松使用 KISSY 组件提供的功能。

KISSY 支持触屏设备的手势操作，手势操作在 ios 和 android 中表现不一致。KISSY 对此做了封装，在底层多点触摸 touch 事件的基础上模拟出了 tap rotate pinch 等触屏设备上独有的事件，这对于用户则是透明，用户完全可以把这些事件当做原生事件来使用，例如

	KISSY.use('event',function(S,Event){
		// 监听 div 上的 tap 事件
		Event.on('#div','tap',function(e){
			// Your Code
		});
	});

## 一点历史

KISSY 诞生于 2009 年 10 月 26 日，当初只是玉伯写的一个结构精巧的[编辑器组件](http://ued.taobao.com/blog/2009/10/kissy-editor/)。但随着淘宝网业务的增长，开始出现越来越多这种组件，包括 Switchable、Overlay、Calendar、Slide、Waterfall。自然的，游离于功能代码之外，基础的 DOM、Event、Anim 和 Ajax 被抽象出来，形成了 KISSY 首批宝贵的基础代码，此时 KISSY 为 1.1.0 版本。并且切合当时淘宝网的日常需求，制定当年的 [KISSY Road Map](http://ued.taobao.com/blog/2010/08/release-kissy-1-1-0/)。至此，KISSY 项目正式步入正轨，并形成了首届开发团队。

有了团队的护航，KISSY 代码量激增，并很快[发布了 1.1.5 版本](http://ued.taobao.com/blog/2010/09/release-kissy-1-1-5/)。最大的改进在于从`core`中独立出了`seed`模块，并增加了`loader`。至此 KISSY 确立了其基本的模块化原则和方向。在当年，还不存在 AMD 和 CMD 规范，YUI3 的模块规范也步履蹒跚，在淘宝网业务激增的情况下，KISSY 开始探索实践适用于电商网站类高速迭代、快速变化、团队协作的模块规范。同时，KISSY 还与时俱进，[发布了 node 版本（nodejs-kissy）](http://ued.taobao.com/blog/2010/11/nodejs-kissy/)。

经历了 2010 年底双十二的疯狂，KISSY 启动了 1.2 分支，模块化实践更进一步，组件数量和质量都在迅速提升。1.2 版本提供了健壮的`core`部分，并且开始尝试[社区化运作](http://gallery.kissyui.com)，至此，KISSY 作为一个完备的 Web 前端框架，已经具备“类库”的基本形态：

- 底层基础：语言层面的特性和核心的工具集
- 上层建筑：第三方组件代码库
- 社区互动：参与共建的机制

同时，KISSY 在淘宝网各个角落的运行测试和不断修正，为淘宝网各条产品提供了统一的、完备的性能优化和团队协作最佳实践，带领淘宝网在用户体验、效率、性能上不断追求卓越。

在 2012 年之后，[KISSY 1.3.x](http://ued.taobao.com/blog/2012/12/kissy-1-3-0-released/) 已在酝酿之中。并且 1.3rc 版很早就参与到了卖家店铺装修、搜索系统和商品详情的重构改造，经过这些复杂业务场景的锤炼，1.3.0 发布，至此[基础架构已经稳定](http://ued.taobao.com/blog/2013/03/modular-scalable-kissy/)，并且在第三方安全、构建工具上有了不少新的产品。

由于业务和 KISSY 源码增长过快，KISSY 文档的更新很难追平代码的更新，一定程度影响 KISSY 传播的精度。KISSY 核心小组在 1.4.0 版本发布之时重构了文档，即是大家看到的这一版文档。

同时，随着移动终端的兴起，KISSY 1.4.0 也在面向多终端兼容和性能上做了大量的优化，尤其是 CSS3 选择器速度超越 zeptojs。在跨终端特性上主动探测，保持最简单的使用方法，同时兼顾性能最优。所以，KISSY 没有专门的 Mobile 版本，KISSY 本身就高效的适配 Mobile。至此，KISSY 在跨终端、模块化和易用性方面都在努力做到极致。这就是你现在看到的 KISSY：**Keep it Simple & Stupid! Yeah!**

