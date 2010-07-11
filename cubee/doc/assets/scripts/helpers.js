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

// Some helper functions

(function(){

	function getText(el) {
		if (el.innerText != null)
			return el.innerText;
		if (el.textContent != null)
			return el.textContent;
		if (el.nodeType == 1 /* ELEMENT */) {
			var txt = [], i = el.firstChild;
			while (i) {
				txt.push(getText(i));
				i = i.nextSibling;
			}
			return txt.join("");
		} else if (el.nodeType == 3 /* TEXT */) {
			return el.data;
		}
		return "";
	};

	DlHighlight.HELPERS = {

		highlightByName : function(name, tag, args) {
			if (!args)
				args = {};
			if (!tag)
				tag = "pre";
			var a = document.getElementsByTagName(tag);
			for (var i = a.length; --i >= 0;) {
				var el = a[i];
				if (el.getAttribute("name") == name) {
					var code = el._msh_text || getText(el);
					el._msh_text = code;
					args.lang = el._msh_type || el.className;
					if(args.lang.indexOf('brush:') >= 0){
						//debugger;
						args.lang = args.lang.split('brush:')[1].replace(/\s/i,'').replace(';','');
					}
					el._msh_type = args.lang;
					
					//alert(el._msh_type);
					var hl = new DlHighlight(args);
					code = hl.doItNow(code);
					if (DlHighlight.is_ie) {
						// kills whitespace
						var div = document.createElement("div");
						div.innerHTML = "<pre>" + code + "</pre>";
						while (div.firstChild)
							el.appendChild(div.firstChild);
					} else
						el.innerHTML = code;
					el.className = "DlHighlight " + el.className;
				}
			}
		}

	};

})();
