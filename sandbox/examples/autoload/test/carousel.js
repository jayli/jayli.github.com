Sandbox.add(function(S){

	S.namespace('S.Carousel');


	S.Carousel.init = function(){
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
	};
	
	
},{
	requires:[
		'assets/jquery.min.js',
		'assets/switchable.js',
		'http://ilikejquery.com/switchable/css/demo.css'
	]
});
