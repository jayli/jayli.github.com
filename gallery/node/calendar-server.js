#!/usr/bin/env node
var sys = require('sys'),
    url = require('url'),
    http = require('http');

var YUI = require("yui3").YUI;

require("assert").equal( global.YUI, undefined, "global yui created");


YUI({
    filter: 'debug',
    debug: true,
	modules:{
		calendar:{
			fullpath:'http://cubee.github.com/src/calendar/calendar.js',
			requires:['skin','node']
		},
		skin:{
			fullpath:'http://cubee.github.com/src/calendar/skin/default.css',
			type:'css'
		}

	}
}).use('nodejs-dom','calendar', function(Y) {
    document = Y.Browser.document;
	Y.config.doc.body.innerHTML = '<div id="J_calendar"></div>';
	var docType = '<!DOCTYPE html>';

	http.createServer(function (req, res) {

		new Y.Calendar('J_calendar');



		res.writeHead(200, {
			'Content-Type': 'text/html',
			'Accept-Charset':'utf-8'}
		);
		var out = docType + Y.one('doc').get('outerHTML');
		res.write(out);
		res.close();



	}).listen(81);

		


});
