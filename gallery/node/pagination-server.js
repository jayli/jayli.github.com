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
		pagination:{
			fullpath:'http://cubee.github.com/src/pagination/pagination.js',
			requires:['node','skin']
		},
		skin:{
			fullpath:'http://cubee.github.com/src/pagination/skin/default.css',
			type:'css'
		}

	}
}).use('nodejs-dom','pagination', function(Y) {
    document = Y.Browser.document;
	Y.config.doc.body.innerHTML = '<div id="J_p1" class="t-pagination" style="text-align:left"></div>';
	var docType = '<!DOCTYPE html>';


	Y.Pagination.prototype.renderUI = function(str){
		var that = this;
		that.node.set('innerHTML','');
		that.node.set('innerHTML',str);

		that.node.query('.J_first').set('href','?page=1');
		that.node.query('.J_previous').set('href','?page='+(that.index-1));
		that.node.query('.J_next').set('href','?page='+(Number(that.index)+1));
		that.node.query('.J_last').set('href','?page='+that.max);
		that.node.queryAll('.t-p-frame a').each(function(node){
			if(node.hasClass('current'))return true;
			var cur = node.get('innerHTML');
			node.set('href','?page='+cur);
			
		});
		return this;
	};


	http.createServer(function (req, res) {


		var urlInfo = url.parse(req.url, true);
		var p = new Y.Pagination(Y.one('#J_p1'), {max:23});

		if(urlInfo.query){
			p.setpos(urlInfo.query.page);
		}

		res.writeHead(200, {
			'Content-Type': 'text/html'}
		);
		var out = docType + Y.one('doc').get('outerHTML');
		res.write(out);
		res.close();



	}).listen(81);

		


});
