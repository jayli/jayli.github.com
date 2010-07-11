/**
* Y.Tip，消息提示框
* @param id {string},要展示提示的消息框id
* @param status {string} 有：error、alert、attention、tips、ok、question、notice(s)、help(s)、small-help(s)、stop(s) *(s) 代表只有小提示才具有
* @param msg {String}消息内容
* @config conf{
	onfinish:function
	autohide:ture (false)
	bigtip:false|bigtip	(true|bigtip)
	delay:3000 默认3000
}
* 须定制一个消息框的容器 <div id="*"></div>
*/
YUI.namespace('Y.Tip');
YUI.add('tip',function(Y){
	Y.Tip = function(id,status,msg,conf){
		if(typeof id == "undefined")return; //id是否存在
		var fd = this,
			config = conf||{},
			msg_status = status||'tips',
			fun = config.onfinish||new Function,
			delaytime = config.delay||3000,		
			autohide = (config.autohide == true) ? true :false,
			naked = (config.noborder == true) ? ' naked' :'',
			anim = (typeof config.anim == 'undefined' || config.anim == null)?true:config.anim;
		con = Y.one(id);

		con.removeAttribute('style');
		var id_str = id,
			con = Y.Node.getDOMNode(con);
		if(config.bigtip == true){
			con.className = 'msg24';
			con.innerHTML = '<p class="'+msg_status+naked+'">'+msg+'</p>'
		}else{
			con.className = 'msg';
			con.innerHTML = '<p class="'+msg_status+naked+'">'+msg+'</p>'
		}
		Y.Tip.timer = Y.Tip.timer || [];
		if(typeof Y.Tip.timer[id_str] != 'undefined')clearTimeout(Y.Tip.timer[id_str]);
		if(!autohide)return;

		Y.Tip.timer[id_str] = setTimeout(
			function(e){
				if(!con)return;
				if(anim){
					var tipAnim = new Y.Anim({
						node:con,
						from:{
							opacity:1
						},
						to:{
							opacity:0,
							height:0
						},
						duration:0.5
					});
					tipAnim.run();
					tipAnim.on('end', function(e){
						con.innerHTML = '';
						con.style.display = 'none';
						fun.apply(fun,arguments);
					});
				}else {
					con.innerHTML = '';
					con.style.display = 'none';
					fun.apply(fun,arguments);
				}
			},delaytime
		);
	}
});	