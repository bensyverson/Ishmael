'use strict';
/**
 * @fileOverview A few isomorphic routines for dealing with the DOM
 * @author <a href="mailto:ben@bensyverson.com">Ben Syverson</a>
 * @copyright © Copyright 2015 Ben Syverson
 * @license The MIT License (MIT)
 */
var global = Function('return this')();
if (typeof(require) === typeof(undefined))  global.require = function(){return null;};
var DomUtils = DomUtils || require('domutils');
var htmlparser = htmlparser || require("htmlparser2");

/**
 * NativeDOMUtils uses `document` when possible, then falls back to DomUtils.
 * @class NativeDOMUtils
 * @constructor
 */
var NativeDOMUtils = function() {
	this.isNative = (typeof(document) !== typeof(undefined));
};

/**
 * HTML parser which uses the native `document` when possible, falling back to htmlparser2
 * @param {String} aString The HTML string to parse
 * @returns {Array} An array of htmlparser2 `Object`s or native DOM `Element` objects 
 * @exampleHelpers
 * var utils = new NativeDOMUtils();
 * var html = '<div id="test"><p id="inner">Testing</p></div>';
 * var arr = utils.parseDOM(html);
 * var el = arr[0];
 * @examples
 * var nodes = utils.parseDOM(html);
 * var div = nodes[0];
 *
 * nodes // instanceof Array
 * nodes.length // => 1
 * (typeof(div) !== typeof(undefined)) // => true  
 * div.children.length // => 1  
 */
NativeDOMUtils.prototype.parseDOM = function(aString, options) {
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
		return htmlparser.parseDOM(aString, options);
	}
	return [];
};



/**
 * Get the Inner HTML of a DOM element
 * @param {Element} anElement A DOM `Element` or htmlparser2 `Object`
 * @returns {String} The resulting HTML
 * @examples
 * var roundtrip = utils.getInnerHTML(el);
 * 
 * roundtrip !== null // => true
 * roundtrip === '<p id="inner">Testing</p>' // => true
 */
 NativeDOMUtils.prototype.getInnerHTML = function(anElement) {
	var self = this;
	if (self.isNative) {
		return anElement.innerHTML;
	} else {
		return DomUtils.getInnerHTML(anElement);
	}
	return null;
};

/**
 * Get the Outer HTML of a DOM element
 * @param {Element} anElement A DOM `Element` or htmlparser2 `Object`
 * @returns {String} The resulting HTML
 * @examples
 * var roundtrip = utils.getOuterHTML(el);
 * 
 * roundtrip !== null // => true
 * roundtrip === html // => true
 */
 NativeDOMUtils.prototype.getOuterHTML = function(anElement) {
	var self = this;
	if (self.isNative) {
		return anElement.outerHTML;
	} else {
		return DomUtils.getOuterHTML(anElement);
	}
	return null;
};

/**
 * Get a node by its `id`
 * @param {(Element|Object)} aParent A parent DOM `Element` or htmlparser2 `Object`
 * @returns {(Element|Object)} The resulting node
 * @examples
 * var child = utils.getElementById(el, 'inner');
 * var parent = utils.getElementById(el, 'test');
 * 
 * child !== null // => true
 * parent !== null // => true
 */
 NativeDOMUtils.prototype.getElementById = function(aParent, anId) {
	var self = this;
	if (self.isNative) {
		var attribs = self.getAttribs(aParent);
		if (attribs
			&& attribs['id']
			&& (attribs['id'] === anId)) {
			return aParent;
		}

		var childNodes = self.childNodes(aParent);
		if (childNodes) {
			for (var i = 0; i < childNodes.length; i++) {
				var innerChild = self.getElementById(childNodes[i], anId);
				if (innerChild) {
					return innerChild;
				}
			}
		}
	} else {
		return DomUtils.getElementById(anId, aParent, true);
	}
	return null;
};


/**
 * Append a child to a parent DOM element
 * @param {Element} aParent The parent `Element` or htmlparser2 `Object`
 * @param {Element} anElement Another `Element` or htmlparser2 `Object`
 * @examples
 * var arr2 = utils.parseDOM(html);
 * var el2 = arr2[0];
 * var child = utils.parseDOM('<q>Child</q>')[0];
 * utils.appendChild(el2, child);
 *
 * child != null // => true
 * el2.children.length // => 2
 */
NativeDOMUtils.prototype.appendChild = function(aParent, anElement) {
	var self = this;
	if (!aParent) return;
	if (!anElement) return;
	if (self.isNative) {
		var dupe = anElement.cloneNode(true);
		aParent.appendChild(dupe);
	} else {
		DomUtils.appendChild(aParent, anElement);
	}
};

/**
 * Return a list of child nodes of the `Element` or `Object`
 * @param {(Element|Object)} aParent The parent `Element` or htmlparser2 `Object`
 * @returns {[(Element|Object)]} An array of `Element` or htmlparser2 `Object`s
 * @examples
 * var node = utils.parseDOM('<div><p></p><p></p></div>')[0];
 * var node2 = utils.parseDOM(html)[0];
 *
 * utils.childNodes(node).length // => 2
 * utils.childNodes(node2).length // => 1
 */
NativeDOMUtils.prototype.childNodes = function(node) {
	var self = this;
	if (self.isNative) {
		return node.childNodes;
	} else {
		return node.children;
	}
	return [];
}

/**
 * Description
 * @method emptyElement
 * @param {} node
 * @returns newElement
 */
NativeDOMUtils.prototype.emptyElement = function(node) {
	var self = this;
	if (self.isNative) {
		var dupe = node.cloneNode(false);
		while (dupe.firstChild) {
		    dupe.removeChild(dupe.firstChild);
		}
		return dupe;
	} else {
		var newElement = {};
		for (var attr in node) {
			if (node.hasOwnProperty(attr)) newElement[attr] = node[attr];
		}
		newElement.children = [];
		return newElement;
	}
	return null;
};

/**
 * Description
 * @method emptyElement
 * @param {} node
 * @returns {(Element|Object)} The stripped object
 */
NativeDOMUtils.prototype.stripIgnored = function(node) {
	var self = this;
	var newElement = self.emptyElement(node);
	var childNodes = self.childNodes(node);
	if (childNodes) {
		for (var i = 0; i < childNodes.length; i++) {
			var attribs = self.getAttribs(childNodes[i]);
			if ((attribs) && 
				(attribs['data-ish-visibility']) && 
				(attribs['data-ish-visibility'] === 'ignore')) {
				continue;
			}
			self.appendChild(newElement, self.stripIgnored(childNodes[i]));
		}
	}
	return newElement;
};

/**
 * Get the tag attributes from an element
 * @param {Object} anElement An`Element` or htmlparser2 `Object`
 * @returns {Object} A bare `Object` with key => value maps for the attributes
 * @examples
 * var attribs = utils.getAttribs(el);
 * 
 * typeof(attribs) !== typeof(undefined) // => true
 * attribs !== {} // => true
 * attribs['id'] === 'test' // => true
 */
 NativeDOMUtils.prototype.getAttribs = function(anElement) {
	var self = this;
	if (self.isNative) {
		if ((typeof(anElement.hasAttributes) !== typeof(undefined)) &&
			 anElement.hasAttributes()) {
			var attrs = anElement.attributes;
			var obj = {};
			for (var i = 0; i < attrs.length; i++) {
				obj[attrs[i].name] = attrs[i].value;
			}
			return obj;
		}
	} else {
		return anElement.attribs;
	}
	return {};
};

module.exports = NativeDOMUtils;