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

// Definitions for the JS language.

(function(){

	var builtins = [
		"Array",
		"Date",
		"Function",
		"Infinity",
		"Math",
		"NaN",
		"Number",
		"Object",
		"Packages",
		"RegExp",
		"String",
		"alert",
		"decodeURI",
		"decodeURIComponent",
		"document",
		"encodeURI",
		"encodeURIComponent",
		"eval",
		"isFinite",
		"isNaN",
		"parseFloat",
		"parseInt",
		"undefined",
		"window"
	];

	var BUILTINS = {};
	for (var i = builtins.length; --i >= 0;)
		BUILTINS[builtins[i]] = true;

	var keywords = [
		"abstract",
		"boolean",
		"break",
		"byte",
		"case",
		"catch",
		"char",
		"class",
		"const",
		"continue",
		"debugger",
		"default",
		"delete",
		"do",
		"double",
		"else",
		"enum",
		"export",
		"extends",
		"false",
		"final",
		"finally",
		"float",
		"for",
		"function",
		"goto",
		"if",
		"implements",
		"import",
		"in",
		"instanceof",
		"int",
		"interface",
		"long",
		"native",
		"new",
		"null",
		"package",
		"private",
		"protected",
		"public",
		"return",
		"short",
		"static",
		"super",
		"switch",
		"synchronized",
		"this",
		"throw",
		"throws",
		"transient",
		"true",
		"try",
		"typeof",
		"var",
		"void",
		"volatile",
		"while",
		"with"
	];

	var KEYWORDS = {};
	for (var i = keywords.length; --i >= 0;)
		KEYWORDS[keywords[i]] = true;

	var end_q_mark = {
		";" : true,
		"{" : true,
		"}" : true,
		"(" : true,
		")" : true,
		"," : true
	};

	var T = {

		WORD : function(txt) {
			var m = /^(\$?\w+)/.exec(txt);
			if (m) {
				var style = "operand";
				var tok = this.getLastToken();
				if (tok && tok.content == "function")
					style += " defun";
				var id = m[1];
				if (id in KEYWORDS) {
					style += " keyword";
					if (id == "function") {
						if (tok) {
							if (tok.type == "operator" && tok.content == "=" ||
							    tok.type == "hasharrow")
								tok = this.getLastToken(1);
							if (tok && tok.type == "operand")
								tok.style += " defun";
						}
					}
				} else if (id in BUILTINS) {
					style += " builtin";
				}
				return {
					content : id,
					index   : m[0].length,
					type    : "operand",
					style   : style
				};
			}
		},

		REGEXP : function(txt) {
			if (!this.lastTokenType(/^operand$/)) {
				var m = /^\x2f((\\.|[^\x2f\\\n])+)\x2f([gim]+)?/.exec(txt);
				if (m) return {
					before	: "/",
					content	: m[1],
					after	: m[3] ? "/" + m[3] : "/",
					style	: "regexp",
					type	: "regexp",
					index   : m[0].length
				};
			}
		},

		// catch some common errors
		ERRORS : {
			regexp	: /^[,+*=-]\s*[\)\}\]]/g,
			content	: 0,
			style	: "error",
			type    : "error"
		},

		QUESTIONMARK : function(txt) {
			if (txt.charAt(0) == "?")
				this.jsQuestionMark++;
		},

		ENDQMARK : function(txt) {
			if (txt.charAt(0) in end_q_mark && this.jsQuestionMark > 0)
				this.jsQuestionMark--;
		},

		COMMA : function(txt) {
			if (txt.charAt(0) == ',') return {
				content	: ",",
				style	: "comma",
				type	: "comma",
				index	: 1
			};
		},

		COLON : function(txt) {
			if (!this.jsQuestionMark && txt.charAt(0) == ":") {
				var tok = this.getLastToken();
				if (tok && /string|operand/.test(tok.type)) {
					tok.style += " hashkey";
					return {
						content : ":",
						style   : "hasharrow",
						type    : "hasharrow",
						index   : 1
					};
				}
			}
		}

	};

	var H = DlHighlight;
	var lang = H.registerLang("js", [ H.BASE.COMMENT_CPP,
					  H.BASE.COMMENT_C,
					  H.BASE.STRING,
					  T.WORD,
					  T.REGEXP,
					  T.ERRORS,
					  T.QUESTIONMARK,
					  T.ENDQMARK,
					  T.COMMA,
					  T.COLON,
					  H.BASE.OPERATOR,
					  H.BASE.PAREN
					]);

	lang.T = T;

	lang.start = function() {
		this.jsQuestionMark = 0;
	};

})();
