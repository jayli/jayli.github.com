log('loaded 2.js');
Sandbox.add(function(S){
	log('run 2.js');
	log('2.js using jQuery:$ is '+($?'ok':'not ok'));
},{requires:[
	'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js'
]});
