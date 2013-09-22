<style>
h3 {
	color:blue;
}
</style>
# path

> 当前浏览器地址的有关信息

可以直接通过KISSY.Path调用：

	KISSY.Path.do_sth();

也可以通过沙箱来调用

	KISSY.use('path',function(S,Path){
		Path.do_sth();// 执行操作
	});

### basename()  `<static>`

`basename(path,ext) => String`

获取域名中的文件名

#### parameter

- path：String，路径字符串
- ext：String，需要过滤的扩展名，比如`.html`

#### return

返回文件名

#### example

	Path.basename('http://www.taobao.com/index.html','.html');//=> index

### dirname()  `<static>`

`dirname(path) => String`

返回path所指的文件所在的目录路径

#### parameter

path（String），Path全称

#### example

	Path.dirname('/home/bachi/daily/index.html');//=>/home/bachi/daily

### extname()  `<static>`

`extname(path) => String`

获取路径所指文件的扩展名，比如`.html`

#### example

	Path.extname('/home/bachi/daily/index.html');//=> .html

### join()  `<static>`

`join(p1,p2,...) => String`

以此拼接p1、p2...,遇到`../`时回退一级目录

#### example

	// ../../ 表示回退两级目录
	Path.join('/home/bachi/daily/','project','../../','index.html');//=> /home/bachi/index.html

### normalize()  `<static>`

`normalize(path) => String`

将path中的无关内容清理掉，返回直接的路径信息

#### example

	Path.normalize('x/y/../z'); // => x/z/
	Path.normalize('x/y/z/../'); // => x/y/

### relative()  `<static>`

`relative(from,to) => String`

计算相对路径

#### example

	Path.relative('x/','x/y/z'); // => 'y/z'
	Path.relative('x/t/z','x/'); // => '../../'

### resolve()  `<static>`

` resolve([from ...], to) => String`

得到绝对地址，算法逻辑参照NodeJS [Path.resolve](http://nodejs.org/api/path.html#path_path_resolve_from_to)。

#### example

	KISSY.Path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif')
	// => 'wwwroot/static_files/gif/image.gif'

	KISSY.Path.resolve('/foo/bar', '/tmp/file/')
	// =>	'/tmp/file'



