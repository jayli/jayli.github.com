# io

> Ajax 别名 io，注意，KISSY中不存在名为"ajax"的模块，必须使用名字‘io’。

	KISSY.use('io',function(S,IO){
		// use IO
	});

方便起见，你仍可以用`S.Ajax`，`S.Ajax === S.IO`。

### IO `<class>`

 `IO(cfg) => Promise`

IO 全局方法，构建 io 请求并发送，传入一个JSON对象，返回一个[Promise](promise.html)实例。
 
#### parameter

cfg (Object) – 用来配置请求的键值对对象. 所有的配置项都是可选的,可以通过 io.setupConfig() 来设置默认配置.

cfg属性列表包括：

- url:{String} - 类型 String. 本次请求发送的地址.
- accepts:{Object} - 该配置和 dataType 一起确定当前发送给服务器的 Accept 头. 默认包括
	- xml: "application/xml, text/xml",
    - html: "text/html",
    - text: "text/plain",
    - json: "application/json, text/javascript"
- dataType：{String} - 期望能够从服务器返回的数据类型。如果没有指定，kissy 将尽量从返回的 `mimeType` |` Content-type` 相应头中推导出来 (‘text/xml’ 将推导出 xml , ‘text/json’ 将推导出 json)。默认支持的类型（该类型的响应信息会作为第一个参数传到 success complete 回调中）有:
   -  “xml” : 返回响应信息代表的 xml 文档.
	- “text” : 返回响应信息串
	- “html” : 同 “text”
	- “script” : 将响应信息作为脚本执行。
	- “json” : 返回响应信息代表的 json 对象.
	- “jsonp” : 返回 jsonp 的响应信息代表的 json 对象.
- processData：{Boolean} - 默认 true . 当 data 为对象时是否用 param() 序列化. 例如当需要传送一个 xml 或 formdata 到服务器时就不需要 param data， 并且最好同时设置 contentType 为合适的值.
- async：{Boolean} - 默认 true.本次 xhr 请求是否异步发送，如果你需要同步发送，设置该配置为 false,注意同步请求在完成前会锁死浏览器.
- cache：{Boolean} - dataType 为 script 或 jsonp 时默认 false，其他默认为 true. false 时则会自动给请求 url 加上时间戳.
- contentType：{String} - 设置请求头 Content-type, 默认 “application/x-www-form-urlencoded”. 设置 false 则不设置 Content-type 头 (例如传输 [formdata](http://www.w3.org/TR/XMLHttpRequest/#interface-formdata) 时需要设置 false).注意：“application/x-www-form-urlencoded” 时的数据总是以 utf-8 的编码传往服务器端.
- context：{Object} - 设置回调函数中的 this 值,默认为当前配置项.例如可以把一个 dom 节点作为 complete 回调函数的上下文:


	new IO({
		url:'test.html',
		context:document.body,
		complete:function(){
			this.className="complete";
		}
	});

- crossDomain: {Boolean} - 默认同域请求为 false,不同域间为 true。设置该值为 true，则强制 script 以及 jsonp 请求通过 script 节点发送，用于服务器重定向到其他域脚本的场景.
- data： {String|Object} - 如果为 Object 类型则会通过 param() 格式化为字符串。注意：data 不能为嵌套 object 等复杂类型，例如:


	{data:[{x:1}]} // 错误
	{data:[1]} // 正确

- serializeArray：{Boolean} - 默认 true。表示序列化 data 时是否给数组值对应的键名加 [] ，例如


	true 时 {x:[1,2]} //=> x[]=1&x[]=2
	false 时 {x:[1,2]} //=> x=1&x=2

- error：{Function} - error (null, textStatus, io) 请求失败时的回调函数.这个函数接受 2 个参数：
	- textStatus 表示错误信息，包括 “timeout” , “error” , “abort” 等
	- io 表示这次请求代表的 io 实例.
- success：{Function} - success ( data , textStatus , io) 请求成功时的回调函数.该函数传入三个参数.
	- data : 根据 dataType 格式化服务器响应信息的响应对象
	- textStatus : 描述成功的状态，一般是 “success”
	- io : 本次请求的 io 实例.
- complete：{Function} - complete ( data , textStatus , io) 请求完成时的回调函数,无论成功或失败都会触发该回调..该函数传入三个参数.
	- data : 根据 dataType 格式化服务器响应信息的响应对象，失败触发时为 null
	- textStatus : 描述成功的状态，一般是 “success”
	- io : 本次请求的 io 实例.
- headers：{Object} - 设置这次请求 xhr 的请求头.
- jsonp：{String} - 覆盖这次 jsonp 请求的 callback 函数名. 这个值可以取代请求 url 中 callback=? 的 callback.例如 {jsonp:’onJsonLoad’} 会导致 ‘onJsonLoad=?’ 发送给服务器端.
- jsonpCallback：{String|Function} - 覆盖这次 jsonp 请求 callback 函数对应的值 (callback={jsonpCallback}). 这个值将取代 kissy 默认生成的 UUID 值。当传入函数时，该函数需要返回字符串，每次请求都会调用该函数得到用于替换的字符串.
- mimeType：{String} - 跨平台设置 xhr 的 [mimeType](https://developer.mozilla.org/en/XmlHttpRequest#overrideMimeType%28%29)
- password：{String} - 对于需要验证的 http 请求设置密码.
- username：{String} - 对于需要验证的 http 请求设置用户名.
- scriptCharset：{String} - 用于 dataType jsonp 和 script ，设定传输用的 script 节点的 charset 属性。只有当返回编码和当前页面编码不一致时使用.
- timeout：{Number} - 对这次请求设个超时时间，单位秒. 当超时后会触发 error 以及 complete 回调 , 状态字符串为 “timeout”.
- type：{String} - 可取值 “get” 或者 “post”.
- xhrFields：{Object} - 设置到原生 xhr 对象的键值对.例如为了在标准浏览器进行跨域请求时携带cookie你可以设置 [withCredentials](https://developer.mozilla.org/en/http_access_control#Requests_with_credentials) 为 true。比如下面的代码，这样 x.com 发送请求 y.com 会携带 y.com 的 cookie 信息.


	new IO({
		url:"http://y.com/ping.php",
		xhrFields:{
			withCredentials: true
		}
	});


- xdr：{Object} - 设置跨域的具体方式和细节，包括以下配置	
	- src：{String} 完全跨域请求的 flash 发送程序地址。当完全跨域时,KISSY io 在ie 中将采用 flash 发请求，默认采用 KISSY 自带 flash 发请求，也可将 kissy 自带的 flash 部署到其他地方，在 src 中指定。而在标准浏览器将采用原生机制.
	- subDomain：{Object} 跨子域时的一些请求配置，包括
		- proxy：{String} 指定代理页面的地址。默认 “/sub_domain_proxy.html” . 例如 x.taobao.com 要发送请求给 y.taobao.com ，那么需要设置 x.taobao.com 的页面 document.domain=’taobao.com’ ，然后提供 y.taobao.com/sub_domain_proxy.html ，该页面内容为`<script>document.domain='taobao.com'</script>`，然后 x.taobao.com 的页面就可以和 y.taobao.com 通信了。
- form：{String} - 选择器字符串 KISSY selector，如果 form 的 enctype 为 “multipart/form-data` 则会采用 iframe 的方式进行无刷新文件上传，否则将 form 内的输入域和值序列化后通过 xhr 发送到服务器.
- beforeSend：{Function} - 发送请求前的拦截函数，传入参数 （xhrObject, config），xhrObject 为 io.XhrObj 类型，例如可以通过该函数实现上传进度监控


	var xhr = new IO({
		url:'./upload.php',
		type:"post",
		processData:false,
		data:formData,
		dataType:'json',
		contentType:false,
		beforeSend:function (xhr) {
			// 上传监听 upload
			xhr.getNativeXhr().upload.addEventListener('progress', function (ev) {
				S.log({ 'loaded':ev.loaded, 'total':ev.total });
			});
		},
		success:function (d) {
			S.log(d);
		}
	});
	
#### IO 实例的属性

- readyState：{Number} - 表示请求完成状态。可用于判断当前请求是否完成. 4 表示完成，否则表示正在进行中.(xhr 会有更多取值，jsonp script 只有 0(初始化) 1(发送中) 4(完成))
- status：{Number} - 响应状态码. xhr 会有更多取值。jsonp script 只有 200(成功) , 500(出错)
- statusText：{String} - 响应状态字符串. 最终同回调 complete 中的 textStatus 一致.
- responseText：{String} - 返回响应对应的 text 和 xml（如果需要）.

#### IO 实例的方法

- [getResponseHeader()](#getResponseHeader)
- [getNativeXhr()](#getNativeXhr)
- [abort()](#abort)
- [then()](#then)

#### IO 全局事件

所有 io 请求都会在 io 模块上触发事件，可通过 IO.on 来捕获所有的 io 请求，例如

	var indicator=KISSY.one("#indicator"),
			num;

	//发送前显示 loading 状态
	IO.on("send",function(){
		num++;
		indicator.show();
	});

	//发送后隐藏 loading 状态
	IO.on("complete",function(){
		num--;
		if(!num)
			indicator.hide();
	});

全局事件包括：

- [start](#start)
- [send](#send)
- [success](#success)
- [error](#error)
- [complete](#complete)

#### example

载入并执行一段脚本

    new IO({
       type: "GET",
       url: "test.js",
       dataType: "script"
     });

发送数据给服务器，服务器返回后通知用户

    new IO({
       type: "POST",
       url: "some.php",
       data: {
        x:'y'
       },
       success: function(msg){
         alert( "Data Saved: " + msg );
       }
     });

取得最新的 html 并显示

    new IO({
      url: "test.html",
      cache: false,
      success: function(html){
        KISSY.one("#results").html(html);
      }
    });

发送 xml 文档给服务器

    var xmlDocument=S.parseXML("<a>h</a>");

    new IO({
       url: "page.php",
       processData: false,
       contentType:'text/xml',
       data: xmlDocument,
       type:'post'
     });

通过 xhr 发送 form 内容，自动序列化 form 为查询串通过 xhr 发送给服务器端

    <form>
        <input name='test' value='v' />
    </form>

    <script>
        new IO({
            url:'send.php',
            form:'#test',
            type:'post',
            dataType:'json',
            success:function(d,s,xhr){
                alert('success');
            }
        });
    </script>

### getResponseHeader()  `<IO 实例方法>`

`getResponseHeader (key) => String`

IO 实例方法，获得对应的响应头值.仅对于 xhr 请求有效.

#### parameter

key (String) – 响应头名

### getNativeXhr()  `<IO 实例方法>`

`getNativeXhr () => Xhr`

获得内置原生的 io 实例

### abort()  `<IO 实例方法>`

`abort() => void`

如果当前请求还没完成（进行中状态）则中断当前的请求，否则什么也不做.

> 不仅可以中断 xhr 请求，还可以中断 jsonp 以及 script 请求，如果中断前该请求正在进行中则中断后会触发 error ( textStatus == “abort” ) 以及 complete 回调.

### then()  `<IO 实例方法>`

`then (success, error) => Promise`

监听当前请求的成功和失败，并返回新的 promise 实例

#### parameter

- success (Function) – 成功回调，参数只有一个，为数组 [data,textStatus,io]. 其中 data 为服务器返回数据， textStatus 为当前请求状态， io 为当前请求实例.
- error (Function) – 失败回调，参数只有一个，为数组 [null,textStatus,io]

#### return

{Promise} - 新的 promise 对象

### setupConfig() `<static>`

`setupConfig ( cfg ) => void`

为所有的 ajax 请求(包括未来)设定默认配置

#### parameter

cfg (Object) – 用来配置默认请求配置的键值对对象。其中的每个配置都是可选的.

所有可配置的项参见 [IO](#IO) .通过 setupConfig 设置后，除非单个请求设置了对应的配置值，否则后续所有的 ajax 请求都使用该设置.例如，下面代码在连续访问 ping.php 前，设置了 url 的默认值.

	IO.setupConfig({
		url:'ping.php'
	});

那么接下来的请求如果没有指定 url 配置，就会使用 ping.php

	IO({
		// url 没设置，就为 ping.php
		data : {name:'dan'}
	});

#### example

设置默认的请求地址为 `/xmlhttp/` ，并使用 POST 方式。那么接下来的请求都会往`/xmlhttp/` 发送请求.

	IO.setupConfig({
		url:'/xmlhttp/',
		type:'post'
	});

	IO({
		data:{x:'mydata'}
	});


### get() `<static>`

`get ( url , [ data , callback , dataType ] ) => XHR`

发送 http get 请求

#### parameter

- url (string) – 请求地址
- data (Object|string) – 请求附带的参数，参见[IO](#IO) data部分 .
- callback (function) – 请求成功后的回调，参见[IO](#IO) success 部分.
- dataType (string) – 传到回调函数作为参数的数据类型，参见 [IO](#IO)dataType部分。

#### return

代表本次请求的 xhrObj

第二种调用方式：

`get( url , [ callback , dataType ] ) => XHR`

data 可忽略，同上个函数描述.

实际上该函数是 [IO](#IO) 的快捷方式

	IO.get = function(url, data, callback, dataType) {
		// data 参数可省略
		if (S.isFunction(data)) {
			dataType = callback;
			callback = data;
			data = undefined;
		}

		return new IO({
			type:"get",
			url: url,
			data: data,
			success: callback,
			dataType: dataType
		});
	};

#### example

请求页面 test.php , 但是忽略返回结果

	IO.get("test.php");

请求页面 test.php , 并附带一些参数传递给后端

	IO.get("test.php",{
		name:"john".
		time:"2pm"
	});

alert 请求成功后返回的结果，数据类型由响应的 content-type 决定

	IO.get("test.php",function(d){
		alert(d);
	});
	
alert 请求成功后返回的 json 数据，和响应的 content-type 无关

	IO.get("test.php",function(d){
		alert(d);
	},"json");

### post() `<static>`

`post ( url , [ data , callback , dataType ] ) => XHRObj`

发送 http post 请求

#### parameter

- url (string) – 请求地址
- data (Object|string) – 请求附带的参数，参见[IO](#IO) data部分 .
- callback (function) – 请求成功后的回调，参见[IO](#IO) success 部分.
- dataType (string) – 传到回调函数作为参数的数据类型，参见 [IO](#IO)dataType部分。

#### return

代表本次请求的 xhrObj

第二种调用方式：

`post( url , [ callback , dataType ] ) => XHR`

data 可忽略，同上个函数描述，同样，post也是IO的快捷调用方式

	IO.post = function(url, data, callback, dataType) {
		// data 参数可省略
		if (S.isFunction(data)) {
			dataType = callback;
			callback = data;
			data = undefined;
		}

		return new IO({
			type:"post",
			url: url,
			data: data,
			success: callback,
			dataType: dataType
		});
	};

> post 请求从来不会被缓存，因此 io.cfg.cache 配置可以不用配置.

#### example

请求页面 test.php , 但是忽略返回结果

	IO.post("test.php");

请求页面 test.php , 并附带一些参数传递给后端

	IO.post("test.php",{
		name:"john".
		time:"2pm"
	});

alert 请求成功后返回的结果，数据类型由响应的 content-type 决定

	IO.post("test.php",function(d){
		alert(d);
	});

alert 请求成功后返回的 json 数据，和响应的 content-type 无关

	IO.post("test.php",function(d){
		alert(d);
	},"json");

### getJSON `<static>`

` getJSON ( url , [ data , callback ] ) => XHR`

发送 http get 请求，无视请求响应的 Content-type，将返回信息解析为 json 作为第一个参数调用 callback 回调.

#### parameter

- url (string) – 请求地址
- data (Object|string) – 请求附带的参数，参见[IO](#IO) data部分 .
- callback (function) – 请求成功后的回调，参见[IO](#IO) success 部分.

#### return

代表本次请求的 xhrObj

另外一种调用方式

`getJSON ( url , [ callback ] ) => XHR`

data 可忽略，同上个函数描述。相当于这样调用IO：

	IO.getJSON = function(url, data, callback) {
		// data 参数可省略
		if (S.isFunction(data)) {
			dataType = callback;
			callback = data;
			data = undefined;
		}

		return new IO({
			type:"get",
			url: url,
			data: data,
			success: callback,
			dataType: "json"
		});
	};

#### example

查看[demo](http://docs.kissyui.com/source/raw/api/core/ajax/getJSON.html) :从 test.js 中加载 json 数据并访问

### jsonp() `<static>`

`jsonp ( url , [ data , callback ] ) => void`

发送 jsonp 请求，将返回 json 信息作为第一个参数调用 callback 回调.

#### parameter

- url (string) – 请求地址
- data (Object|string) – 请求附带的参数，参见[IO](#IO) data部分 .
- callback (function) – 请求成功后的回调，参见[IO](#IO) success 部分.

另外一种调用方式

` jsonp ( url , [ callback ] ) => void`

data 可忽略，同上个函数描述，具体实现为：

	IO.jsonp = function(url, data, callback) {
		// data 参数可省略
		if (S.isFunction(data)) {
			callback = data;
			data = undefined;
		}

		return new IO({
			type:"get",
			url: url,
			data: data,
			success: callback,
			dataType: "jsonp"
		});
	};

#### example

从 flickr 中动态获取图片信息：[demo](http://docs.kissyui.com/source/raw/api/core/ajax/jsonp.html)

### upload() `<static>`

`upload ( url , form , [ data , callback , dataType ] ) => XHR`

上传文件

#### parameter

- url (string) – 请求地址
- form (HTMLElement|string) – 表单元素，可以用选择器表示
- data (Object|string) – 请求附带的参数，参见[IO](#IO) data部分 .
- callback (function) – 请求成功后的回调，参见[IO](#IO) success 部分.
- dataType (string) – 传到回调函数作为参数的数据类型，参见 [IO](#IO)dataType部分。

#### return

代表本次请求的 xhrObj

第二种调用方式：

`upload ( url , form,[ callback , dataType ] ) => XHR`

对应的IO的实现为：

	IO.upload = function(url, form, data, callback, dataType) {
		if (S.isFunction(data)) {
			dataType = callback;
			callback = data;
			data = null;
		}
		return new IO({
			url:url,
			type:'post',
			dataType:dataType,
			form:form,
			data:data,
			success:callback
		});
	};

#### example

向 doUpload.html 上传文件并读取 json 响应：[Demo](http://docs.kissyui.com/source/raw/api/core/ajax/upload.html)

> 使用自定义按钮模拟 file input 时，注意请将 file input 设置透明覆盖在自定义按钮上面。

	// <button id='myFileUploadButton'>
	// <input type='file' id='nativeFile'>
	// 不要这样做
	KISSY.all('#myFileUploadButton').on('click',function(){
		KISSY.get('#nativeFile').click();
	});

### serialize() `<static>`

`serialize ( elements ) => String`

序列化一系列表单元素为可提交的字符串

#### parameter

elements (string|Array`<HTMLElement>`|HTMLElement|KISSY.NodeList) – 代表表单元素（input form select ...）的集合，参数为字符串时，需是选择器格式。

#### return

序列化后的字符串

> 是否真的要使用该方法？ ajax 提交的话可以直接设置 form 参数

该方法返回一个将表单元素 url 编码过的字符串，表单元素通常包括 `<input> <textarea> <select>` ，或者直接对整个 `<form> `元素的所有表单子孙元素进行序列化

#### example

下面这段html

	<form id='f'>
		<div><input type="text" name="a" value="1" id="a" /></div>
		<div><input type="text" name="b" value="2" id="b" /></div>
		<div><input type="hidden" name="c" value="3" id="c" /></div>
		<div>
			<textarea name="d" rows="8" cols="40">4</textarea>
		</div>
		<div><select name="e">
			<option value="5" selected="selected">5</option>
			<option value="6">6</option>
			<option value="7">7</option>
		</select></div>
		<div>
			<input type="checkbox" name="f" value="8" id="f" />
		</div>
		<div>
			<input type="submit" name="g" value="Submit" id="g" />
		</div>
	</form>

运行

	S.log(IO.serialize("#f")); //=> a=1&b=2&c=3&d=4&e=5

也可以只序列化一部分

	S.log(IO.serialize(S.all("#f").all("input")));
	// => a=1&b=2&c=3


> 该方法不会自动去重，重复的元素会产生具有重复部分的产生串。
> 只有 [successful controls](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2) 会被序列化为字符串. 因为表单不是用提交按钮提交的，那么提交按钮不会被序列化。只有具备 name 属性的元素才可能被序列化。文件上传元素不会被序列化

### start `<event>`

当配置初始化后，获取传输对象前触发。事件对象包括一下属性，事件对象包括这些属性

- ajaxConfig (Object) – 当前的配置项
- io (Object) – 当前的请求关联的 IO 对象

### send `<event>`

请求发送前触发。可用于 loading indicator 显示时机。事件对象同 start 事件.

### success `<event>`

服务器返回成功后触发.事件对象同 start 事件.

### error `<event>`

服务器返回失败后触发.事件对象同 start 事件.

### complete `<event>`

服务器返回（无论成功或失败）后触发.事件对象同 start 事件.
