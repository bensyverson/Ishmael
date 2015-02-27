'use strict';
var global = Function('return this')();
if (typeof(require) === typeof(undefined))  global.require = function(){return null;};
var htmlparser = htmlparser || require("htmlparser2");

/**
 * Description
 * @class NativeHTMLParser
 * @constructor
 */
var NativeHTMLParser = function() {
	this.isNative = (typeof(document) !== typeof(undefined));
};

/**
 * Native HTML parser (use native `document`)
 * @param {String} aString The HTML string to parse
 * @returns {Array} An array of native DOM `Element` objects 
 * @examples
 * var parser = new NativeHTMLParser();
 * var nodes = parser.parseDOM('<div id="test"></div>');
 * var div = nodes[0];
 *
 * parser // instanceof NativeHTMLParser
 * nodes // instanceof Array
 * nodes.length // => 1
 * (typeof(div) !== typeof(undefined)) // => true  */
NativeHTMLParser.prototype.parseDOM = function(aString) {
	var self = this;
	if (self.isNative) {
		var aDiv = document.createElement('div');
		aDiv.innerHTML = aString;
		if (aDiv.hasChildNodes()) {
			var child = aDiv.removeChild(aDiv.firstChild);
			aDiv = null;
			return [child];
		}
	} else {
		return htmlparser.parseDOM(aString);
	}
	return [];
};

module.exports = NativeHTMLParser;
