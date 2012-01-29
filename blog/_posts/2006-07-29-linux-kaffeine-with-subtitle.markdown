---
title: '完全Linux ---- 让kaffeine显示中文字幕'
layout: post
guid: urn:uuid:c6675166-6afd-4741-8ccd-d40517ff5231
tags:
    - linux
    - kaffeine
---

Ubuntu 6.06已经的Kaffeine已经支持字幕的显示了，但是其默认安装还不能显示中文字幕。

Kaffeine作为Xine的前端，采用Xine引擎，当然字幕的显示也是以来Xine库了。Xine的字幕显示需要自己定义的一些特殊格式的字体，而其默认安装只带了几种英文字体，这就是Kaffine之所以无法显示中文字幕的原因，知道了原因，解决起来就很容易了。

首先我们需要准备的是制作字体的工具，叫做xine-fontconv。源里的xine是没有这个工具的，有兴趣的话大家可以去SourceForge上下xine的源码，自己编译一下就可以了，比较懒的话......这里有一个编译好的版本，下来放到/usr/bin下面，其实放哪里无所谓，执行的时候找的到就行然后要找一个中文字体，不用多说了吧，/usr/share/fonts/truetype下找一个顺眼的中文自己就行了，注意一下编码是gbk &amp; gb2312的还是big5的，这里以文鼎PL细上海宋Uni（AR PL ShanHeiSun Uni）为例，字体文件为/usr/share/fonts/truetype/arphic/uming.ttf

<del>下载： xine-fontconv.bin</del>

进入xine的字体目录：

    cd /usr/share/xine/libxine1/fonts

制作字体，ming是最终生成的字体名，自选，gbk是编码，以实际情况为准：

    xine-fontconv /usr/share/fonts/truetype/arphic/uming.ttf ming gbk

等吧，很久的，去喝杯咖菲（晕，新换的雅黑字体居然没有咖fei的fei字，只好拿这个代替了%^#$*&amp;$^&amp;@$%#$@^#@）好了，呵呵

之后我们会看到生成了ming-16-xinefont.gz这样的文件，就是新的字体了，16代表大小，一共会有16，20，24，32，48，64这几个，然后打开Kaffeine配置一下Xine：

设置－>Xine引擎参数－>Subtitles，在右边的新手选项中把最后一项（encoding of the subtitles）替换为我们的编码，这里是gbk，专家选项中的第一项（font for subtitles）替换为我们的字体名，这里为ming，确定。

现在可以找个电影试一下啦，把字幕文件名的.idx，.sub，.srt等等之前的部分改成和电影文件名一样就行了，在载入的时候会提示你选字幕的

enjoy :)

