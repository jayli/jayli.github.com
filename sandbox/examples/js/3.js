log('loaded 3.js');
Sandbox.add(function(S){
	log('run 3.js');

},{requires:[
	'js/4.js'
]});
