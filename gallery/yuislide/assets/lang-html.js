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

// Inherits most parsers from XML, but modifies END_ANGLE to highlight SCRIPT tags

(function(){

	var re_get_script = /([^\0]*?)<\x2fscript>/gi;

	var H = DlHighlight, xml = H.LANG.xml;

	function END_ANGLE(txt) {
		var m = /^\x2f?>/.exec(txt);
		if (m) {
			var tag = this.inXmlTag;
			this.inXmlTag = false;
			var tok = [{ content : m[0],
				     style   : "paren xml-tagangle" }];
			if (/^script$/i.test(tag) && !/><\x2fscript>/i.test(txt)) {
				re_get_script.lastIndex = 1;
				var m = re_get_script.exec(txt);
				if (m && m[1] && m.index == 1) {
					var code = m[1];
					var index = re_get_script.lastIndex - 10;
					var js = new H({ lang: "js",
							 noTrim: true }).doItNow(code);
					var jstok = {
						content	: { escaped: js },
						style	: "xml-inline-script",
						index	: index
					};
					tok.push(jstok);
				}
			}
			return tok;
		}
	};

	H.registerLang("html", [ xml.T.COMMENT,
				 xml.T.STRING,
				 xml.T.ATTRIBUTE,
				 xml.T.ENTITY,
				 xml.T.START_TAG,
				 xml.T.END_TAG,
				 END_ANGLE
			       ]);

})();
