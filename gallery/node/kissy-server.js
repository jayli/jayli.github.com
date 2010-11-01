
require('./kissy');

var S = KISSY;
/*
//it work
S.add('abc',function(S){
	S.a = '===============================';	
});
S.use('abc',function(S){
	S.log(S.a);
});
*/


/*
//it work
S.add('a', {
    fullpath: 'a.js'
}).use('a', function(S) {
    S.log(S.a);
});
*/

/*
//it work
S.add('a', {
    fullpath: 'http://taobao-wd.ns1.name/bachi/jayli/jayli.github.com/gallery/node/a.js'
}).use('a', function(S) {
    S.log(S.a);
});
*/


/*
//程序不工作，因为这里没有domReady
*/
/*
S.add('a', {
    fullpath: 'a.js'
}).ready(function(S) {
    S.log(S.a);
});
*/

/*
//it work
S.use('ks-core', function(S) {
    //S.log(S);
});
*/

S.add('calendar', {
    fullpath: 'http://github.com/kissyteam/kissy/raw/master/src/calendar/calendar.js',
	require:['ks-core']
}).use('calendar',function(S) {
    S.log(S.a);
});



/*
S.use('calendar',function(S){
	document.body.innerHTML = '<div id="J_calendar"></div>';
	var docType = '<!DOCTYPE html>';

	new S.Calendar('J_calendar');

	S.log(docType + S.one('doc').get('outerHTML'));
	return;

	http.createServer(function (req, res) {


		res.writeHead(200, {
			'Content-Type': 'text/html',
			'Accept-Charset':'utf-8'}
		);
		var out = docType + S.one('doc').get('outerHTML');
		res.write(out);
		res.close();



	}).listen(81);

});
*/


//require("assert").equal( global.YUI, undefined, "global yui created");

