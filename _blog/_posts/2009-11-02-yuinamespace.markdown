---
title: 'yui3的namespace的bug'
layout: post
guid: urn:uuid:b23b7be5-c377-413e-80fd-4c24b942b931
tags:
---
yui3的namespace有严重bug，在执行YUI.namespace(‘a.b.c’)的时候应当生成对象a.b.c，而yui3的namespace却无法生成。在yui.js中，yui3少了对对象结构的eval。应当这样hack：

	YUI.prototype.namespace = function() {
		var a=arguments, o=null, i, j, d;
		for (i=0; i<a.length; i=i+1) {
			d = ("" + a[ i ]).split(".");
			o = this;
			for (j=(d[0] == "YAHOO") ? 1 : 0; j<d.length; j=j+1) {
				o[d[j]] = o[d[j]] || {};
				//added by jayli
				try{var _o=(_o?(_o[d[j]]=_o[d[j]]||{}):
					(eval(d[j]+"="+d[j]+"||{}")))
				}catch(e){_o=eval(d[j]+"={}")}
				o = o[d[j]];
			}

		}

		return o;
	};
