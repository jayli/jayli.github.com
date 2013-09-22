# KISSY 项目构建工具

KISSY 项目构建工具有两类

- 解析模块依赖，生成依赖关系表或者静态合并文件，Kissy Module Complier（[kmc](kmc.html)）
- 依照规范生成目录结构和空文件，[ABC](http://abc.f2e.taobao.net/) 或者 [Clam](clam.html)

## [KMC](kmc.html)

模块化的开发都需要有批处理工具，来压缩合并文件，以减少HTTP请求数。KMC 可以将本地依赖文件解析成模块依赖关系表，也可以直接合并。

## [ABC](http://abc.f2e.taobao.net/)

ABC 是一套简版的项目骨架生成器，特点是它提供一套UI界面，遵循KISSY代码规范生成代码骨架。在 Widget 层面和 Clam 保持互通。

## [Clam](clam.html)

Clam 是一套完整、经典的项目骨架生成器，特点是全面：涵盖各类项目的几乎所有场景，同时对接阿里发布系统Gitlab，提供代码的快捷发布通道。在Widget层面，和 ABC 保持互通。
