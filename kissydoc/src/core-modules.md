# KISSY 核心模块列表

### 核心模块列表：

- Seed
	- lang
	- promise
	- loader
	- ua
	- uri
	- features
	- path
- Component
	- anim
	- base
	- node
	- event
	- dom
	- io
	- json
	- kison
	- cookie
	- color
	- dd
	- overlay
	- resizable
	- xtemplate
	- mvc
	- html-parser
	- import-style
- Wdiget
	- editor
	- scroll-view
	- swf
	- tabs
	- toolbar
	- tree

-----------------------

### KISSY 架构

KISSY 采用模块化设计，除了 Seed 集成的功能之外，所有模块均需要手动按需载入。KISSY 核心模块结构如下图，Seed 是最重要模块的集合，包含最基础的面向对象和语言基础。

![](http://gtms02.alicdn.com/tps/i2/T15qaHFbVXXXX0nDjy-500-718.png)

- **Seed**：KISSY 种子文件，包含基础的面向对象支持、模块加载器、Lang 增强、UA，所有 KISSY 应用必须载入种子文件。种子不包含 DOM、Node 等常用功能，需要开发者按需引入。
- **Components**：颗粒化的功能单元，是比较常用的模块，二八原则中的那20%，这些是官方提供的可靠的模块。
- **Widgets**：组件，分为官方提供和非官方提供。非官方组件由第三方开发，存储于 Gallery 内，官方组件和 Components 组件一样，直接`KISSY.use('modName')`来载入。


> 从 KISSY 1.4.0 开始，将不再提供`kissy.js`，只提供`seed.js`，目的是强制用户按需加载，避免无用组件的载入，尽可能的减少请求的体积。因此，开发者需要熟练掌握核心组件的使用，尤其是图中加粗的部分。
>
> Seed 中的模块无须手动引入。

------------------------------------------

## 开发者是否需要关心子模块？

**不需要！**除非你非常非常了解 KISSY 所有模块间的依赖关系，否则不推荐直接调用子模块。

原因：从开发的角度，模块被拆的粒度更小，比如 dom 和 event，其实是由这些子模块构成

![](http://gtms03.alicdn.com/tps/i3/T1uuWxFdNfXXbymbv1-273-231.png)

根据硬件环境的不同，KISSY 会选择性加载所需模块，比如`dom/ie`模块，显然不是为了 Mobile 准备的，再比如`event/shake`模块，显然在 Mobile 设备中也不会载入，再比如 IE<9 下会补充加载`event/hashchange`。即，dom 和 event 模块是和环境强相关，**作为开发者，不必去关心这些模块什么情况下怎么载入**，只需了解 KISSY 已经为你处理好了硬件探测，一定会加载正确的最小模块集合。

> KISSY 这种处理兼容性的方式为 [shim](http://www.hongkiat.com/blog/html5-shiv-polyfills/)。在涉及到处理浏览器在实现标准 API 上的差异性时，这种方法又被称为 [polyfills](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills)。是一种流行的特性检测的方法。
