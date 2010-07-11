<div class="tit">Cubee 手册</div>
<p class="author">Cubee是淘宝北京UED开发并维护的UI库,这里是代码级的开发者手册。</p>
<h2><strong>What's Cubee?</strong></h2>
<!--div class="demo">
	<a class="button" href="../src/box/demo/demo-box.html">演示示例 DEMO</a>
</div-->
<ul class="dec">
	<li>cubee是由淘宝北京UED团队开发并维护的UI库和widget代码库。</li>
	<li>UI规范将指导北京数字产品的开发，降低设计和开发成本，提高产品的模块化程度和提高重用率</li>
	<li>cubee包含UI指南和代码库两部分</li>
	<li>更多内容：<a href="http://twiki.corp.taobao.com/bin/view/Taobao_DP/Cubee%E9%A1%B9%E7%9B%AE%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91">cubeewiki</a></li>
</ul>
<h2><strong>开发者</strong></h2>
<ul class="dec">
	<li>VD：夏之</li>
	<li>WD：蒋吉兵、拔赤</li>

</ul>
<h2><strong>开发须知</strong></h2>
<ul class="dec">
	<li>代码路径：<a href="http://svn.simba.taobao.com/svn/UED/trunk/DPD/cubee" target=_blank>http://svn.simba.taobao.com/svn/UED/trunk/DPD/cubee</a></li>
	<li>全局内容：reset,grid,font等，包含在global.css中，组件开发依赖这些通用样式</li>
	<li>widget开发时命名空间统一使用类似“Y.MsgBox”的格式，如果是类或构造器（需要new的），使用Y.MsgBox的形式，首字母大写，如果是简单函数，使用Y.dosth的形式，首字母小写，多单词的名称使用驼峰命名，js编码规范不强制，可以参照<a href="http://twiki.corp.taobao.com/bin/view/Taobao_DP/Js%E7%BC%96%E7%A0%81%E8%A7%84%E8%8C%83">js编码规范</a></li>
	<li>文件编码统一采用utf-8格式</li>
	<li>css中class的命名格式不强制，推荐使用"c-xx-yy"的格式，id的命名不强制</li>
	<li>在widget开发完成后，需要版本发布的时候，须有讨论通过，并且有必要的代码review</li>
</ul>
<h2><strong>文档撰写</strong></h2>
<ul class="dec">
	<li>开发者整理完整一个模块的源码到src后，应当在这里完善相应的文档</li>
	<li>src中应当包含演示的demo，比如弹出层的demo在src/box/demo中</li>
	<li>文档起始页是start.php</li>
	<li>每个模块的文档页应当在doc/page/中，页面格式参照doc/page/box.php，通过http://url/doc/start.php?box，box为文件名，不包含后缀</li>
	<li>开发者需要整理的内容应当包含：演示、代码示例、API（如果需要）。</li>
	<li>更新后别忘了提交代码啊</li>
</ul>
