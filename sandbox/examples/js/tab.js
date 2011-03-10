
/*
Sandbox.add(function(S){
	//this worked
});
*/
Sandbox.add('tab',function(S){
	S.namespace('S.Demo');
	S.Demo.init = function(){
		S.loadScript('http://ilikejquery.com/switchable/js/jquery.switchable%5Ball%5D.min.js',function(){
			window.api = $("#trigger1").switchable("#panel1 > div > img", {
				triggerType: "click",
				effect: "scroll",
				steps: 3,
				visible: 3,
				circular: true
			}).autoplay({ api: true });
			
			$("#next1").click(function(){
				api.next();
			});
			$("#prev1").click(function(){
				api.prev();
			});
		});
	};
},{requires:[
	'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js',
	'http://ilikejquery.com/switchable/css/demo.css'
]});
