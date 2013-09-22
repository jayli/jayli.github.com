# KISSY Mobile 最佳实践

## 去除不必要的模块加载

Seed 种子文件体积（seed-min.js）：**15k**（gzip）。Mobile 中原生支持`querySelector`和`querySelectorAll`，在 Webkit 内核浏览器中只会载入包装器，即在移动终端会自行加载最小子集，比如这段代码：
	
	// 在 Mobile 中运行
	KISSY.use('node');

只会载入`node-min.js`：**2k**（gzip），即可在 Mobile 中拥有DOM操作的全部功能。

![](http://gtms04.alicdn.com/tps/i4/T1khi2FfFdXXXKwN2U-393-61.png)

> 最佳实践，在Mobile中要保留有用的模块，尽管KISSY会主动探测设备并选择性加载，但多余的手动引入模块还是会造成不必要的带宽浪费。

## 开启 Combo

KISSY Loader 可以开启Combo功能，将多JS文件进行合并输出，以减少HTTP请求数，在移动终端中**更要如此**，开启方法参照[Loader](loader.html)。

对于本地文件，使用[KMC](kmc.html)进行静态合并。

## KISSY DOM 的 CSS3 选择器加速

Zepto 由于充分利用了浏览器原生`querySelector`和`querySelectorAll`两个函数来查找DOM，因此DOM查找效率很不错，但并非所有的选择器用这两个函数都能达到速度最快。[通过测试发现](https://speakerdeck.com/lijing00333/css-selector-performance)，`#id`、`#ClassName`、`tags`、`#id .cls`、`级联查找`等场景下，`querySelector`性能并非最优。我们在 DOM 模块中重构了 CSS3 选择器引擎，有选择的调用原生函数，在90%的场景中让DOM查找速度加倍：

![](http://gtms04.alicdn.com/tps/i4/T19b5yFkdXXXXvDWMq-529-511.png)

> 最佳实践：在对选择器查找性能要求苛刻的场景中，使用 KISSY DOM 代替 Zepto。

## 触屏事件

[KISSY Event](event.html) 包含对触屏事件的封装，这样载入`event`模块：

	// 在触屏设备中运行
	KISSY.use('event');

在触屏设备中将会加载`event-min.js`：214B（gzip）。事件用法和普通的浏览器事件一样：

	Event.on('#t', "swipe", function (e) {
		if(e.direction=='left'){
			e.preventDefault();
		}
	});

> 最佳实践，使用 KISSY Event 封装后的触屏事件，触屏行为更统一、精确。事件种类参照[Event](event.html)。

## 组件的触屏兼容

KISSY Gallery 提供大量兼容 Mobile 的组件，尽可能的使用这些跨终端的组件，比如[Slide](http://gallery.kissyui.com/slide/1.1/guide/index.html)，支持CSS3动画的加速和手势事件触发切换。

--------------------------------------

## 其他重要的优化手段

### 图片体积优化

性能分为两类：

- 载入性能
- 渲染性能

KISSY 只能保证在 JavaScript 层面优化性能，根据[34军规](http://developer.yahoo.com/performance/rules.html)的原则，影响载入性能最大的因素在于HTTP请求数和资源体积，一般情况下占用页面体积80%的是图片，因此优化图片的效果比优化 JavaScript 体积要更显著更重要。

#### 根据不同DPI载入不同尺寸图片

	/* 高 dpi */
	@media only screen and (min-resolution: 300dpi),
		only screen and (-webkit-min-device-pixel-ratio: 1.5) {
			#header { background-image: url(header-300dpi.png); }
	}

	/* 低 dpi */
	@media only screen and (max-resolution: 299dpi),
		only screen and (-webkit-max-device-pixel-ratio: 1.5) {
			#header { background-image: url(header-72dpi.png); }
	}

#### 使用带有alpha通道的PNG8图片

带有半透明效果的图片可以以PNG8形式保存，通过工具[tinypng](http://tinypng.org/)来优化。这类图片体积将会减少一倍。

## 两篇H5开发最佳实践的 PPT

- [H5 开发性能优化实战](https://speakerdeck.com/ningzbruc/mobile-h5-xing-neng-you-hua)
- [H5 项目开发调试技巧](https://speakerdeck.com/paulguo/h5-mobile-kai-fa-diao-shi-shi-jian)
