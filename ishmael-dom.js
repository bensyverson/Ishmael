"use strict";

var println = function(x){console.log(x)};

var Element = Element || function(){};


Element.prototype.hasClassName = function(name) {
    return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(this.className);
};

Element.prototype.addClassName = function(name) {
    if (!this.hasClassName(name)) {
        this.className = this.className ? [this.className, name].join(' ') : name;
    }
};

Element.prototype.removeClassName = function(name) {
    if (this.hasClassName(name)) {
        var c = this.className;
        this.className = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), "");
    }
};

var getNode = function(html) {
	var htmlparser = require("htmlparser2");
	var DomUtils = require("domutils");

	var dom = htmlparser.parseDOM(html);
	return dom[0];
};

var nodeForHTML = function(html) {
	if (typeof(document) !== typeof(undefined)) {
		var aDiv =  document.createElement('div');
		aDiv.innerHTML = html;
		aDiv.getInnerHTML = function() {
			return this.innerHTML;
		};
		return aDiv;
	}
	return getNode(html);
};

var DomHelper = {
	nodeForHTML: nodeForHTML,
};

module.exports = DomHelper;
