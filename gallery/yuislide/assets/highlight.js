/**************\
 *                                                                ____   _____
 * DlHighlight -- a JavaScript-based syntax highlighting engine.  \  /_  /   /
 *                                                                 \  / /   /
 *        Author: Mihai Bazon, http://mihai.bazon.net/blog          \/ /_  /
 *     Copyright: (c) Dynarch.com 2007.  All rights reserved.        \  / /
 *                http://www.dynarch.com/                              / /
 *                                                                     \/
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 2 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
\******************************************************************************/


/*
 *
 *  This thing only cares to colorize a piece of text.  It has nothing to do
 *  with the DOM, with reading existing text from the DOM and to insert the
 *  formatted code back.  This facility is present in helpers.js.
 *
 *  Assuming the unformatted code is in the "code" variable, use DlHighlight
 *  this way:
 *
 *     var hl = new DlHighlight({ lang        : "js",
 *                                lineNumbers : true });
 *
 *     formatted = hl.doItNow(code);
 *
 *  Now you have in "formatted" the colored version.
 *
 *  Supported parameters are:
 *
 *     - "lang" (required) to declare the language
 *     - "lineNumbers" (optional) if you want line numbers
 *     - "showWhitespace" (optional) if you want to display whitespace
 *                                   in strings as underscores
 *     - "noTrim" (optional) pass *true* if you want not to ignore empty
 *                           newlines at the end of the code
 *
 */

var DlHighlight;

(function(){

	var H = DlHighlight = function(args) {
		var self = this;
		this.args = {};
		function D(name, val) {
			if (name in args)
				val = args[name];
			self.args[name] = val;
		};
		D("replaceTabs", null);
		D("lineNumbers", false);
		D("noTrim", false);
		D("showWhitespace", false);
		var lang = this.lang = H.LANG[args.lang];
		this.tokenParsers = lang.tokens.slice(0).reverse();
		if (this.args.replaceTabs != null) {
			var tab = " ";
			while (--this.args.replaceTabs > 0)
				tab += "&nbsp;";
			this.args.replaceTabs = tab;
		}
	};

	H.is_ie = /MSIE/.test(navigator.userAgent) && !/Gecko|KHTML|Opera/.test(navigator.userAgent);

	// definitions useful for most languages out there
	H.BASE = {

		COMMENT_CPP : function(txt) {
			if (txt.charAt(0) == "/" && txt.charAt(1) == "/") {
				var nl = txt.indexOf("\n");
				if (nl == -1)
					nl = txt.length;
				var c = this.lang.onComment.call(this, this._he(txt.substring(2, nl)));
				return {
					content	: { escaped: c },
					style	: "comment comment-line",
					type	: "comment",
					index	: nl,
					before	: "//"
				};
			}
		},

		COMMENT_C : function(txt) {
			if (txt.charAt(0) == "/" && txt.charAt(1) == "*") {
				var nl = txt.indexOf("*/"), c, index = nl;
				if (nl == -1)
					nl = index = txt.length;
				else
					index += 2;
				c = this.lang.onComment.call(this, this._he(txt.substring(2, nl)));
				c = c.replace(/^\s*[*\\|]+/mg, function(s) {
					return "<span class='before'>" + s + "</span>";
				});
				return {
					content	: { escaped: c },
					before	: "/*",
					after	: "*/",
					index	: index,
					style	: "comment comment-multiline",
					type	: "comment"
				};

			}
		},

		STRING : {
			regexp	: /^(\x22(\\.|[^\x22\\])*\x22|\x27(\\.|[^\x27\\])*\x27)/g,
			content	: function(m) {
				m = m[1];
				m = m.substr(1, m.length - 2);
				if (this.args.showWhitespace)
					m = m.replace(/\x20/g, "_");
				return m;
			},
			before  : function(m) { return m[1].charAt(0); },
			after   : function(m) { return m[1].charAt(0); },
			type	: "string",
			style	: "string"
		},

		PAREN : {
			regexp	: /^[\](){}\[]/g,
			content	: 0,
			type	: "paren",
			style	: "paren"
		},

		OPERATOR : function(txt) {
			var m = /^[<>!+=%&*\x2f|?:-]+/.exec(txt);
			if (m && m[0] != "!/") return {
				content	: m[0],
				index   : m.lastIndex,
				type	: "operator",
				style	: "operator"
			};
		}

	};

	H.prototype = {

		formatToken : function(tok) {
			var cls = tok.style, html = buffer();
			if (cls instanceof Array)
				cls = cls.join(" ");
			html("<span class='", cls, "'>");
			if (tok.before)
				html("<span class='before'>", this._he(tok.before), "</span>");
			html(this._he(tok.content));
			if (tok.after)
				html("<span class='after'>", this._he(tok.after), "</span>");
			html("</span>");
			return html.get();
		},

		formatUnknown : function(txt) {
			return this._he(txt);
		},

		getLastToken : function(pos) {
			return this.tokens[this.tokens.length - (pos || 0) - 1];
		},

		lastTokenType : function(re) {
			var t = this.getLastToken();
			if (t)
				return re.test(t.type);
			return false;
		},

		parseToken : function(test, code) {
			var m, tok;
			if (test.regexp) {
				test.regexp.lastIndex = 0;
				m = test.regexp.exec(code);
				if (m) {
					tok = { type  : test.type,
						style : test.style,
						index : test.regexp.lastIndex
					      };
					reAdd(this, "before", m, test, tok);
					reAdd(this, "after", m, test, tok);
					reAdd(this, "content", m, test, tok);
				}
			} else {
				tok = test.call(this, code);
			}
			return tok;
		},

		doItNow : function(code) {
			this.lang.start.call(this, code);
			if (!this.args.noTrim)
				code = code.replace(/\s+$/, "");
			var formatted = [], T = this.tokenParsers, m, unknown, tok, i, f = 0, tokens;
			unknown = "";
			tokens = this.tokens = [];
			while (code.length > 0) {
				// jumping whitespace one character at a time
				// might eat a lot of time, let's skip it
				// quickly
				m = /^\s+/.exec(code);
				if (m) {
					unknown += m[0];
					code = code.substr(m[0].length);
				}
				for (i = T.length; --i >= 0;) {
					tok = this.parseToken(T[i], code);
					if (tok)
						break;
				}
				if (tok) {
					if (unknown)
						formatted[f++] = unknown;
					unknown = "";
					if (!(tok instanceof Array))
						tok = [ tok ];
					var index = 0;
					tokens.push.apply(tokens, tok);
					for (var j = 0; j < tok.length; ++j) {
						var t = tok[j];
						formatted[f++] = t;
						index += getNextIndex(t);
					}
					code = code.substr(index);
				} else {
					unknown += code.charAt(0);
					code = code.substr(1);
				}
			}
			if (unknown)
				formatted[f++] = unknown;
			for (i = formatted.length; --i >= 0;) {
				f = formatted[i];
				if (typeof f == "string")
					formatted[i] = this.formatUnknown(f);
				else
					formatted[i] = this.formatToken(f);
			}
			var html = formatted.join("");
			i = this.args.lineNumbers;
			if (i) {
				if (typeof i != "number")
					i = 0;
				html = html.replace(/^/mg, function() {
					return "<span class='line-numbers'>" + (++i) + "</span>";
				});
				this.args.lineNumbers = i;
			}
			// html = html.replace(/\n/g, "<br />");
			this.lang.stop.call(this);
			return html;
		},

		_he : function(str) {
			if (str.escaped)
				return str.escaped;
			str = str.replace(he_re, function(c) {
				return he_re_val[c];
			});
			if (this.args.replaceTabs)
				str = str.replace(/\t/g, this.args.replaceTabs);
			return str;
		}

	};

	var he_re = /[&<>]/g, he_re_val = {
		"&" : "&amp;",
		"<" : "&lt;",
		">" : "&gt;"
	};

	H.LANG = function(id, tokens) {
		if (arguments.length > 0) {
			H.LANG[id] = this;
			this.tokens = tokens;
		}
	};

	H.registerLang = function(type, tokens) {
		f.prototype = new H.LANG;
		f.prototype.constructor = f;
		function f() { H.LANG.call(this, type, tokens); };
		return new f();
	};

	var P = H.LANG.prototype;
	P.start = P.stop = function(){};

	P.onComment = function(c) {
		return makeUrls(c);
	};

	function makeUrls(s) {
		return s.replace(/\b((https?|ftp):\x2f\x2f[^\s\x22]+)/g, function(url) {
			return "<a href='" + url + "'>" + url + "</a>";
		});
	};

	function reAdd(self, c, m, test, tok) {
		if (test[c] != null) {
			if (typeof test[c] == "number") {
				tok[c] = m[test[c]];
			} else if (typeof test[c] == "function") {
				tok[c] = test[c].call(self, m);
			} else {
				tok[c] = test[c];
			}
		}
	};

	function getNextIndex(tok) {
		var index = tok.index || 0;
		if (!index) {
			// console.log("No index in %s", tok.style);
			if (tok.before)
				index += tok.before.length;
			if (tok.content)
				index += tok.content.length;
			if (tok.after)
				index += tok.after.length;
		}
		return index;
	};

	var buffer = H.is_ie
	? function() {
		var a = [], idx = 0, f = function() {
			for (var i = 0; i < arguments.length; ++i)
				a[idx++] = arguments[i];
		};
		f.get = function() { return a.join(""); };
		return f;
	} : function() {
		var str = "", f = function() {
			str = str.concat.apply(str, arguments);
		};
		f.get = function() { return str; };
		return f;
	};

})();
