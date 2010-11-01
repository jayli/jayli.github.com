
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

S.use('ks-core', function(S) {
    S.log(S);
});

//require("assert").equal( global.YUI, undefined, "global yui created");

