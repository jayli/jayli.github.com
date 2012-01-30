
---
title: '淘宝2011新版首页开发实践'
layout: post
guid: urn:uuid:d5ea4ee2-7adf-4354-b697-3f60201f1b0f
tags:
---

本文同期发表于 <a href="http://ued.taobao.com">http://ued.taobao.com</a>

<iframe border=0 src='http://www.slideshare.net/slideshow/embed_code/6516501' width='500' height='410'></iframe>

新年钟声刚过，<a href="http://www.taobao.com" target="_blank">淘宝新版首页</a>全“心”上线了，这次设计大胆的将布局从 960px 伸展至 1000px，页面更通透，新首页更大范围的实践了<a href="http://en.wikipedia.org/wiki/HTML5"> HTML5</a> 和<a href="http://www.w3.org/TR/css3-roadmap/"> CSS3</a>，全面兼容 iPad，并在<a href="http://www.w3.org/WAI/intro/accessibility">可访问性</a>方面有了更多积极的尝试。对于我来讲，这次开发着实是一次奇妙的经历，也让我对可访问性、html5 和性能优化有了新的认识。

其实 <a href="http://en.wikipedia.org/wiki/HTML5">html5</a> 并不是那么遥不可及，现在也有着不少针对 pc 终端的 <a href="http://www.impressivewebs.com/demo-files/easy-html5-template/">html5 template</a>，如果不甚考虑 ie6/7/8 禁用脚本的情况，完全可以放手运用 html5 标签。那么针对那些 ie6/7/8 禁用脚本的用户，我们参照了 <a href="http://www.facebook.com">facebook</a> 的做法，即引导用户进入带有noscript标识的 <strong>“/?_fb_noscript=1”</strong>页面，用 html4 标签替换 html5 标签，这要比为了保持兼容性而写大量 hack 的做法更轻便一些。

如果你足够细心，就会发现新首页并未完全遵循“<a href="http://www.w3.org/TR/css3-grid/">栅格</a>”，因为一个很纯粹的文档中，实现栅格效果所使用的层层 wrap 本身就缺乏语义，html5 带来了更多语义化的标签，这和缺乏语义的栅格实现是如此格格不入，摆脱栅格，容器用绝对定位，不用写那么多 hack，岂不多快好省～

另外，关于性能优化，之前我们的确过于依赖 <a href="http://developer.yahoo.com/yslow/">yslow</a>、<a href="http://code.google.com/intl/zh-CN/speed/page-speed/">pagespeed</a> 的评分，其实，这些条条框框才是真正阻碍我们作 <a href="http://www.stevesouders.com/blog/2010/05/07/wpo-web-performance-optimization/">WPO</a> 的拦路虎，不是说这些指标不科学，而是他们限制住了我们的思维和视野，更何况，他们都缺少对“加载/渲染时间”这个最重要的因素的评估，当用户更快的看到并可用页面（尤其是首屏），才是真正的性能提升，因此，这次开发特意针对 First Rendering（首次渲染）的指标进行一些重构，重写了几乎所有的逻辑层 js 代码 （domready 之前，甚至 Render 出 UI 之前，js 已经在运行了），当 js 效率更高，CPU 损耗更少时，浏览器才会更多的将硬件资源投入到渲染 Dom 本身，First Rendering 自然会更加提前，后续的渲染也会提速。可以参照新旧淘宝首页的 CPU 耗能对比，以及其对 First Rendering（绿线）的影响。

2010（旧）首页加载 CPU 损耗

<img class="alignnone size-full wp-image-3441" src="http://ued.taobao.com/blog/wp-content/uploads/2011/01/ued-blog-wpo-1.png" alt="" width="600" height="101" />

2011（新）首页加载 CPU 损耗：

<img class="alignnone size-full wp-image-3442" src="http://ued.taobao.com/blog/wp-content/uploads/2011/01/ued-blog-wpo-2.png" alt="" width="600" height="101" />

当然，延迟加载、延迟渲染等技术在这里依然适用，上次淘宝首页改版<a href="http://www.chencheng.org/blog/2010/01/06/dev-share-for-taobao-new-homepage/">云谦同学作了详尽的总结</a>，这里就不再赘述了。更多内容大家可以到这里<a href="http://www.slideshare.net/lijing00333/2011-6516501">下载 ppt</a>。

此致，鸣谢<a href="http://www.pushiming.com/blog/">法海</a>、<a href="http://yiminghe.javaeye.com/blog/">承玉</a>、<a href="http://www.songwa.org/">王松</a>、玉澧、<a href="http://besteric.com/">黑三</a>，最后要特别感谢下玉澧童鞋，有了你的妙笔，这次首页才会如此闪亮。
