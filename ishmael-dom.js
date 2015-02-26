"use strict";

/**
 * Description
 * @method println
 * @param {} x
 * @return 
 */
var println = function(x){console.log(x)};

var Element = Element || function(){};


/**
 * Description
 * @method hasClassName
 * @param {} name
 * @return CallExpression
 */
Element.prototype.hasClassName = function(name) {
    return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(this.className);
};

/**
 * Description
 * @method addClassName
 * @param {} name
 * @return 
 */
Element.prototype.addClassName = function(name) {
    if (!this.hasClassName(name)) {
        this.className = this.className ? [this.className, name].join(' ') : name;
    }
};

/**
 * Description
 * @method removeClassName
 * @param {} name
 * @return 
 */
Element.prototype.removeClassName = function(name) {
    if (this.hasClassName(name)) {
        var c = this.className;
        this.className = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), "");
    }
};

/**
 * Description
 * @method getNode
 * @param {} html
 * @return MemberExpression
 */
var getNode = function(html) {
	var htmlparser = require("htmlparser2");
	var DomUtils = require("domutils");

	var dom = htmlparser.parseDOM(html);
	return dom[0];
};

/**
 * Description
 * @method nodeForHTML
 * @param {} html
 * @return CallExpression
 */
var nodeForHTML = function(html) {
	if (typeof(document) !== typeof(undefined)) {
		var aDiv =  document.createElement('div');
		aDiv.innerHTML = html;
		/**
		 * Description
		 * @method getInnerHTML
		 * @return MemberExpression
		 */
		aDiv.getInnerHTML = function() {
			return this.innerHTML;
		};
		return aDiv;
	}
	return getNode(html);
};

/**
 * Description
 * @method getElementsWithClass
 * @param {} element
 * @param {} matchClass
 * @return matches
 */
function getElementsWithClass(element, matchClass) {
	var re = new RegExp("\\b" + matchClass + "\\b");
	var matches = [];
	var elements = document.getElementsByTagName('*');

	for (var i = 0; i < elements.length; i++) {
		var el = elements[i];
		if (re.exec(el.className) &&
			element.contains(el)) {
			matches.push(el);
		}
	}
   return matches; 
}


var DomHelper = {
	nodeForHTML: nodeForHTML,
	getElementsWithClass: getElementsWithClass,
};

module.exports = DomHelper;
