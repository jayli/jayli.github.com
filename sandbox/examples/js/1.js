log('loaded 1.js');
Sandbox.add(function(S){
	log('run 1.js');

},{requires:[
	'js/2.js',
	'js/3.js'
]});
