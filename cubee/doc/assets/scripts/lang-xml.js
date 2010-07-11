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

(function(){

	var H = DlHighlight;

	var T = {

		COMMENT: function(txt) {
			if (txt.indexOf("<!--") == 0) {
				var nl = txt.indexOf("--", 4);
				if (nl == -1)
					nl = txt.length;
				return {
					before	: "<!--",
					after	: "-->",
					content	: txt.substring(4, nl),
					index	: nl + 3,
					type	: "comment",
					style	: "comment"
				}
			}
		},

		STRING: function(txt) {
			if (this.inXmlTag)
				return this.parseToken(H.BASE.STRING, txt);
		},

		ATTRIBUTE: function(txt) {
			var r = null;
			if (this.inXmlTag) {
				var m = /^([a-z0-9_-]+)(\s*)=/i.exec(txt);
				if (m) {
					return [ { content : m[1],
						   style   : "builtin xml-attribute" },
						 { content : m[2] }, // whitespace
						 { content : "=",
						   style   : "operator" }
					       ];
				}
			}
			return r;
		},

		ENTITY: {
			regexp	: /^&(\w+);/g,
			before	: "&",
			after	: ";",
			content	: 1,
			type	: "builtin",
			style	: "builtin xml-entity"
		},

		START_TAG: function(txt) {
			var m = /^<([a-z0-9_-]+)/i.exec(txt);
			if (m) {
				this.inXmlTag = m[1];
				return [ { content  : "<",
					   style    : "paren xml-tagangle" },
					 { content  : m[1],
					   style    : "keyword xml-tag xml-tag-open" } ];
			}
		},

		END_TAG: function(txt) {
			var m = /^<\x2f([a-z0-9_-]+)(\s*>)/i.exec(txt);
			if (m) {
				return [ { content  : "</",
					   style    : "paren xml-tagangle" },
					 { content  : m[1],
					   style    : "keyword xml-tag xml-tag-close" },
					 { content  : m[2],
					   style    : "paren xml-tagangle" } ];
			}
		},

		END_ANGLE: function(txt) {
			var m = /^\x2f?>/.exec(txt);
			if (m) {
				this.inXmlTag = false;
				return {
					content	: m[0],
					style	: "paren xml-tagangle"
				};
			}
		}

	};

	var lang = H.registerLang(
		"xml", [ T.COMMENT,
			 T.STRING,
			 T.ATTRIBUTE,
			 T.ENTITY,
			 T.START_TAG,
			 T.END_TAG,
			 T.END_ANGLE ]);

	lang.T = T;

	lang.start = function() {
		this.inXmlTag = false;
	};

})();
