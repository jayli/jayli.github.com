
Sandbox.add(function(S){


	S.namespace('S.ColorPicker');
	S.ColorPicker = function(html){
		var div = document.createElement('div');
		div.innerHTML = html;
		document.getElementById('wrap').appendChild(div);


	};

	
	
},{
	requires:[
		'colorpicker.js'
	]
});
