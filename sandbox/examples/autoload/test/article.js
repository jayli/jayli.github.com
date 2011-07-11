

Sandbox.add(function(S){


	S.namespace('S.Article');
	S.Editor = function(html){
		var t = document.createElement('textarea');
		t.innerHTML = html;
		t.id="editor"
		t.style.width = '500px';
		document.getElementById('wrap').appendChild(t);

		KISSY.Editor("#editor").use("sourcearea,preview," +
		                    "separator," +
							"undo,separator,removeformat,font,format,forecolor,bgcolor,separator," +
							"list,indent,justify,separator,link,image,flash,smiley," +
							"separator,table,resize,draft,pagebreak,separator,maximize");


	};

	
	
},{
	requires:[
		'http://a.tbcdn.cn/s/kissy/1.1.5/editor/theme/cool/editor-pkg-min-datauri.css',
		'http://a.tbcdn.cn/s/kissy/1.1.5/kissy-min.js',
		'http://a.tbcdn.cn/s/kissy/1.1.5/editor/editor-all-pkg-min.js'
	]
});
