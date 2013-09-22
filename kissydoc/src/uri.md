<style>
h3 {
	color:blue;
}
</style>

# Uri

uri 解析模块，用于处理URL。可以直接通过KISSY.Uri调用：

	var uri = new KISSY.Uri('http://url');
	uri.do_somethine();// uri 执行相关的方法

也可以通过沙箱来调用

	KISSY.use('uri',function(S,Uri){
		// 使用 Uri
	});

### clone()，克隆一个实例

`clone() => Uri`:：返回一个当前 uri 实例的克隆对象

	var one = new Uri('http://www.g.cn/x');
	var two = one.clone() // 克隆一个新的Uri实例

### resolve()

`resolve (other) => Uri`：合并解析出一个完整的URL，返回新的 uri 实例

	var one = new Uri('http://www.g.cn/x');
	one.resolve('foo').toString() // => http://www.g.cn/foo
	one.resolve(new Uri('?foo')).toString() // => http://www.g.cn/x?foo

### getScheme() 得到协议部分

用法：`getScheme () => String`

	new Uri('http://www.g.cn/x').getScheme() // => http

### setScheme() 设置协议部分 

设置 uri 实例的 scheme 部分

	new Uri('http://www.g.cn/x').setScheme('ftp').getScheme() // => ftp

### getHostname()  得到hostname

	new Uri('http://www.g.cn:8888/x').getHostname() // => www.g.cn

### setHostname()  设置hostname

	new Uri('http://www.g.cn:8888/x').setHostname('www.google.com').toString()
	// => http://www.google.com:8888/x

### getUserInfo()  得到用户信息

获取当前 uri 实例的 user info

	new Uri('http://my:pass@www.g.cn:8888/x').getUserInfo() // => 'my:pass'

### setUserInfo()  设置用户信息

设置当前 uri 实例的 user info

    new Uri('http://my:pass@www.g.cn:8888/x').setUserInfo('m:p').getUserInfo()
    // => 'm:p'

### getPort() 获取当前 uri 实例的端口值

	new Uri('http://my:pass@www.g.cn:8888/x').getPort()
	// => '8888'

### setPort()  设置当前 uri 实例的端口值

	new Uri('http://my:pass@www.g.cn:8888/x').setPort('88').toString()
	// => http://my:pass@www.g.cn:88/x

### getPath()  获取当前 uri 实例的路径

	new Uri('http://www.g.cn/x').getPath()
	// => /x

### setPath() 设置当前 uri 实例的路径

	new Uri('http://www.g.cn/x').setPath('/y').toString()
	// => http://www.g.cn/y

### getQuery() 获取当前 uri 实例的查询参数实例

	new Uri('http://www.g.cn/x?x=1').getQuery().get('x')
	// => 1

### setQuery()  设置当前 uri 实例的查询参数

参数：query ({String|Uri.Query}) –	 字符串或者Uri.Query实例

	new Uri('http://www.g.cn/x?x=1').setQuery('y=1').toString();
	// => http://www.g.cn/x?y=1

	new Uri('http://www.g.cn/x?x=1').setQuery(new Uri.Query('y=1')).toString();
	// => http://www.g.cn/x?y=1

### getFragment() 获取当前 uri 实例的 hash

	new Uri('http://www.g.cn/x?x=1#y=2').getFragment() // => y=2

### setFragment() 设置当前 uri 实例的 hash

参数：hash ({String}) –  hash值

	new Uri('http://www.g.cn/x?x=1#y=2').setFragment('x=3').toString()
	// => http://www.g.cn/x?x=1#x=3

### isSameOriginAs()  验证同源 

验证当前 uri 实例和 other 是否是同源关系(hostname port scheme 相同)

	new Uri('http://www.g.cn/x?x=1#y=2')
	.isSameOriginAs(new Uri('http://www.g.cn:88/x?x=1#y=2')) // => false

### toString()  序列化当前 uri 实例的 hash

参数：arr ({Boolean}) – 同 param() 同名参数

	new Uri('http://www.g.cn/x?x=1&x=2').toString(false)
	// => 'http://www.g.cn/x?x=1&x=2'

	new Uri('http://www.g.cn/x?x=1&x=2').toString(true)
	// => 'http://www.g.cn/x?x%5b%5d=1&x%5b%5d=2'
