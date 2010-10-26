#!/usr/bin/env node
var sys = require('sys'),
    url = require('url'),
    http = require('http');

var YUI = require("yui3").YUI;



require("assert").equal( global.YUI, undefined, "global yui created");


YUI({
    filter: 'debug',
    debug: true,
}).use('nodejs-dom', function(Y) {
    document = Y.Browser.document;
	window = Y.Browser.window;
	location = Y.Browser.location;
	YUI({
		modules:{
			'ks-core':{
				fullpath:'http://kissyteam.github.com/kissy/build/packages/kissy.js',
				requires:['skin','node']
			},
			slide:{
				fullpath:'http://kissyteam.github.com/kissy/src/switchable/switchable.js',
				requires:['ks-core','skin']
			},
			skin:{
				fullpath:'http://kissyteam.github.com/kissy/build/cssbase/base-min.css',
				type:'css'
			}
		}
	}).use('slide',function(Y){
		Y.log('================');	
	});
	return;
	Y.config.doc.body.innerHTML = ['<style>',
		'#demo1 { position: relative; width: 750px; padding-top: 29px; }',
		'#demo1 .ks-switchable-nav { position: absolute; left: 20px; margin-top: -29px; z-index: 99; }',
		'#demo1 .ks-switchable-nav li {',
		'		float: left;',
		'			width: 130px;',
		'			height: 27px;',
		'			line-height: 21px;',
		'			text-align: center;',
		'			background: url(assets/tabs-sprite.gif) no-repeat 0 6px;',
		'			margin-right: 3px;',
		'			padding-top: 8px;',
		'			cursor: pointer;',
		'		}',
		'		#demo1 .ks-switchable-nav li.ks-active { background-position: 0 -40px; cursor: default; }',
		'		#demo1 .ks-switchable-content {',
		'			position: relative;',
		'			height: 120px;',
		'			padding: 20px;',
		'			border: 1px solid #AEC7E5;',
		'		}',
		'		</style><div id="demo1"></div>'].join('');
	var docType = '<!DOCTYPE html>';

	http.createServer(function (req, res) {

		new KISSY.Tabs('#demo1');



		res.writeHead(200, {
			'Content-Type': 'text/html',
			'Accept-Charset':'utf-8'}
		);
		var out = docType + Y.one('doc').get('outerHTML');
		res.write(out);
		res.close();



	}).listen(81);

		


});
