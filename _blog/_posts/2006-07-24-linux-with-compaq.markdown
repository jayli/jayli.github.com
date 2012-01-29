---
title: '在 linux 下驱动 Compaq 万通宝'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef7eeee2d80
tags:
    - linux
---

近日完全转到 linux 了，不过 PocketPC 和万通宝的驱动是个大问题，Google 了好久，终于解决了万通宝的驱动，如下：

万通宝的驱动要自己编译安装，所以我们必须先要安装一些必要的软件包，以ubuntu为例，debian及其它发行版会略有不同:

我们需要的是 gcc，curl，cvs，以及与当前相对应的内核头文件

    sudo apt-get install build-essential

以上命令可安装编译所需要的软件包如 gcc，cpp等，然后是安装 cvs

    sudo apt-get install cvs

以及当前版本的内核头文件

    sudo apt-get install linux-headers-`uname -r`

注意：` 符号是 tab 键上面数字 1 键左边那个，不是单引号

然后是 curl

    sudo apt-get install curl

以上是为了说明清楚一些，当然也可以一次性安装：

    sudo apt-get install build-essential cvs linux-headers-`uname -r` curl

安装好必要的软件包后，我们需要从 cvs 上去 checkout 最新的驱动源码

    cvs -z3 -d:pserver:anonymous@cvs.savannah.gnu.org:/cvsroot/orinoco co orinoco

然后编译驱动

    cd orinoco

    make

编译正确完成后需要安装

    sudo make install

之后我们需要去下载 windows 的 firmware，当然这个不用我们动手，已经有写好的脚本来完成了

    cd firmware

    ./get_ezusb_fw

将得到的 firmware 拷贝到 linux 内核的 firmware 目录中，在 dapper （ubuntu 6.06）中为 /lib/firmware/linux-kernel-xxx （xxx为内核版本）目录中，其它发行版视实际情况而定

    sudo cp ./orinoco_ezusb_fw /lib/firmware/`uname -r`

现在我们可以尝试激活万通宝了

    sudo modprobe -v orinoco_usb

看看万通宝的绿灯有没有亮，不亮的话则需要重启一下

最后，保证系统在启动的时候自动加载万通宝模块，需要修改一下 /etc/modules 文件，在文件的末尾加一行

    orinoco_usb

重启，进入桌面后看看，绿灯还不亮的话试下 Fn + F2，这样子应该差不多正常工作了，enjoy～

