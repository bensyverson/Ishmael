'use strict';
var global = Function('return this')();
if (typeof(require) === typeof(undefined))  global.require = function(){return null;};
var htmlparser = htmlparser || require("htmlparser2");

/**
 * Native HTML Utilities (use native `document`)
 * @private
 * @class NativeDOMParser
 * @constructor
 */
var NativeDOMUtils = function() {
	this.isNative =  (typeof(document) !== typeof(undefined));
};

/**
 * Get the Inner HTML of a DOM element
 * @param {Element} anElement A DOM `Element` or htmlparser2 `Object`
 * @returns {String} The resulting HTML
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
 */
 NativeDOMUtils.prototype.getOuterHTML = function(anElement) {
	var self = this;
	if (self.isNative) {
		return anElement.innerHTML;
	} else {
		return DomUtils.getInnerHTML(anElement);
	}
	return null;
};


/**
 * Append a child to a parent DOM element
 * @param {Element} aParent The parent `Element` or htmlparser2 `Object`
 * @param {Element} anElement Another `Element` or htmlparser2 `Object`
 */
 NativeDOMUtils.prototype.appendChild = function(aParent, anElement) {
	var self = this;
	if (self.isNative) {
		aParent.appendChild(anElement);
	} else {
		DomUtils.appendChild(aParent, anElement);
	}
};

/**
 * Get the tag attributes from an element
 * @param {Object} anElement An`Element` or htmlparser2 `Object`
 * @param {Object} A bare `Object` with key => value maps for the attributes
 */
 NativeDOMUtils.prototype.getAttribs = function(anElement) {
	var self = this;
	if (self.isNative) {
		if (anElement.hasAttributes()) {
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