# Uri

> uri 解析模块，用于处理URL。

可以直接通过KISSY.Uri调用：

	var uri = new KISSY.Uri('http://url');
	uri.do_somethine();// uri 执行相关的方法

也可以通过沙箱来调用

	KISSY.use('uri',function(S,Uri){
		// 使用 Uri
	});

### clone()  `<Uri 实例方法>`

`clone() => Uri`

返回一个当前 uri 实例的克隆对象

#### return

返回一个新的Uri实例

#### example

	var one = new Uri('http://www.g.cn/x');
	var two = one.clone() // 克隆一个新的Uri实例

### resolve()  `<Uri 实例方法>`

`resolve (other) => Uri`

#### parameter

{Uri|String} - other 带解析 uri

#### return

{Uri} - 新的 uri 实例

#### example

	var one = new Uri('http://www.g.cn/x');
	one.resolve('foo').toString() // => http://www.g.cn/foo
	one.resolve(new Uri('?foo')).toString() // => http://www.g.cn/x?foo

### getScheme()  `<Uri 实例方法>`

`getScheme () => String`

得到 uri 实例的 scheme 部分

#### example

	new Uri('http://www.g.cn/x').getScheme() // => http

### setScheme()  `<Uri 实例方法>`

`setScheme (scheme) => Uri`

设置 uri 实例的 scheme 部分

#### return

当前 uri 实例

#### example

	new Uri('http://www.g.cn/x').setScheme('ftp').getScheme() // => ftp

### getHostname()  `<Uri 实例方法>`

`getHostname () => String`

得到当前 uri 实例的 hostname

#### example

	new Uri('http://www.g.cn:8888/x').getHostname() // => www.g.cn

### setHostname()  `<Uri 实例方法>`

`setHostname (hostname) => Uri`

设置当前 uri 实例的 hostname

#### parameter

hostname ({String}) ，域名

#### example

	new Uri('http://www.g.cn:8888/x').setHostname('www.google.com').toString()
	// => http://www.google.com:8888/x

### getUserInfo()  `<Uri 实例方法>`

`getUserInfo () => String`

获取当前 uri 实例的 user info

#### example

	new Uri('http://my:pass@www.g.cn:8888/x').getUserInfo() // => 'my:pass'

### setUserInfo()  `<Uri 实例方法>`

`setUserInfo (userInfo) => Uri`

设置当前 uri 实例的 user info

#### parameter

userInfo ({String}) – 用户信息

#### returns

当前 uri 实例

#### example

    new Uri('http://my:pass@www.g.cn:8888/x').setUserInfo('m:p').getUserInfo()
    // => 'm:p'

### getPort()  `<Uri 实例方法>`

`getPort() => String`

获取当前 uri 实例的端口值

#### example

	new Uri('http://my:pass@www.g.cn:8888/x').getPort()
	// => '8888'

### setPort()  `<Uri 实例方法>`

`setPort (port) => Uri`

设置当前 uri 实例的端口值

#### example

	new Uri('http://my:pass@www.g.cn:8888/x').setPort('88').toString()
	// => http://my:pass@www.g.cn:88/x

### getPath()  `<Uri 实例方法>`

`getPath () => String`

获取当前 uri 实例的路径

#### example

	new Uri('http://www.g.cn/x').getPath()
	// => /x

### setPath()  `<Uri 实例方法>`

`setPath (path) => Uri`

设置当前 uri 实例的路径

#### example

	new Uri('http://www.g.cn/x').setPath('/y').toString()
	// => http://www.g.cn/y

### getQuery()  `<Uri 实例方法>`

`getQuery () => Uri.Query实例`

获取当前 uri 实例的查询参数实例

#### example

	new Uri('http://www.g.cn/x?x=1').getQuery().get('x')
	// => 1

### setQuery()  `<Uri 实例方法>`

`setQuery (query) => Uri.Query实例`

设置当前 uri 实例的查询参数

#### parameter

query ({String|Uri.Query}) –	 字符串或者Uri.Query实例

#### example

	new Uri('http://www.g.cn/x?x=1').setQuery('y=1').toString();
	// => http://www.g.cn/x?y=1

	new Uri('http://www.g.cn/x?x=1').setQuery(new Uri.Query('y=1')).toString();
	// => http://www.g.cn/x?y=1

### getFragment()  `<Uri 实例方法>`

`getFragment () => String`

获取当前 uri 实例的 hash

#### example

	new Uri('http://www.g.cn/x?x=1#y=2').getFragment() // => y=2

### setFragment()  `<Uri 实例方法>`

`setFragment (hash) => Uri实例`

设置当前 uri 实例的 hash

#### parameter

hash ({String}) –  hash值

#### example

	new Uri('http://www.g.cn/x?x=1#y=2').setFragment('x=3').toString()
	// => http://www.g.cn/x?x=1#x=3

### isSameOriginAs()  `<Uri 实例方法>`

`isSameOriginAs(othre) => Boolean`

验证当前 uri 实例和 other 是否是同源关系(hostname port scheme 相同)

#### example

	new Uri('http://www.g.cn/x?x=1#y=2')
	.isSameOriginAs(new Uri('http://www.g.cn:88/x?x=1#y=2')) // => false

### toString()  `<Uri 实例方法>`

`toString (arr) => String`

序列化当前 uri 实例的 hash

#### parameter

arr ({Boolean}) – 同 param() 同名参数

#### example

	new Uri('http://www.g.cn/x?x=1&x=2').toString(false)
	// => 'http://www.g.cn/x?x=1&x=2'

	new Uri('http://www.g.cn/x?x=1&x=2').toString(true)
	// => 'http://www.g.cn/x?x%5b%5d=1&x%5b%5d=2'