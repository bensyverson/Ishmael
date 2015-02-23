"use strict";
var println = println || function(x){console.log(x);}
var View = View || require('./ishmael-view.js');

var htmlparser = require("htmlparser2");
var DomUtils = require("domutils");


var PrivateAutoLayout = function() {

};
var AutoLayout = function() {
	var _autoLayout = null;
	this.shared = function() {
		if (_autoLayout == null) {
			_autoLayout = new PrivateAutoLayout();
		}
		return _autoLayout;
	};
};


// var aSnippet = '<div id="word"> 									\
// 	<ul>															\
// 		<li>														\
// 			test													\
// 		</li>														\
// 	</ul>															\
// 	<div>															\
// 		<p data-ish-class="InfoView" data-ish-name="infoView">		\
// 			put info here											\
// 		</p>														\
// 	</div>															\
// 	<article>														\
// 		<p data-ish-class="InfoView" data-ish-name="infoView">		\
// 			put article here										\
// 		</p>														\
// 	</article>														\
// 	<p>interstitial</p>												\
// 	<footer>														\
// 		<div>														\
// 			<p data-ish-class="FooterView" data-ish-name="footer">	\
// 				put footer here										\
// 			</p>													\
// 		</div>														\
// 	</footer>														\
// 	<p>																\
// 		&copy; Copyright 2015 Ben Syverson							\
// 	</p>															\
// </div>';



var firstChildWithView = function(node) {
	if (node.attribs && node.attribs['data-ish-class']) {
		return node;
	}

	if (node.children) {
		for (var i= 0; i < node.children.length; i++) {
			if (node.children[i].attribs) {
				if (node.children[i].attribs['data-ish-class']) {
					return node.children[i];
				}
			}
			var first = firstChildWithView(node.children[i]);
			if (first !== null) return first;
		}
	}
	return null;
};

var indent = '';

var trim = function(aString) {
	return aString
			.replace(/^\s+/, '')
			.replace(/\s+$/, '');

};

// println(dom);
var emptyDiv = htmlparser.parseDOM('<div />')[0];
var emptyElement = function(node) {
	var newElement = {};
	for (var attr in node) {
		if (node.hasOwnProperty(attr)) newElement[attr] = node[attr];
    }
    newElement.children = [];
    return newElement;
};

var populateView = function(node) {
	var containerClass = node.attribs ? node.attribs['data-ish-class'] : null;
	var containerName = node.attribs ? node.attribs['data-ish-name'] : null;

	var containerView = null;

	if (containerClass) {
		containerView = new View(null, containerName);
	} else {
		containerView = new View(null, containerName);
	}

	var first = -1;
	var last = node.children ? node.children.length : -1;

	var implicitElements = emptyElement(emptyDiv);
	var newElement = emptyElement(node);

	var addImplicitView = function() {
		if (implicitElements.children.length > 0) {
			var html = trim(DomUtils.getInnerHTML(implicitElements));
			if (html.length > 0) {
				var implicitView = new View();
				implicitView.templateName = null;
				implicitView.templateConst = html;
				containerView.addSubview(implicitView);
			}
			implicitElements = emptyElement(emptyDiv);
		}
	}

	var viewCount = 0;
	if (node.children) {
		for (var i= 0; i < node.children.length; i++) {
			var child = node.children[i];
			var aNode = firstChildWithView(child);
			if (aNode !== null) viewCount++;
		}
	}
	if (viewCount == 0) {
		containerView.templateName = null;
		containerView.templateConst = DomUtils.getOuterHTML(node);
		return containerView;
	}


	for (var i= 0; i < node.children.length; i++) {
		var child = node.children[i];
		var viewChild = firstChildWithView(child);
		
		if (viewChild !== null) {
			addImplicitView();
			if (first < 0) {
				first = i;
			}

			last = i;

			if ((viewCount == 1) && (viewChild !== child)) {
				containerView.addSubview(populateView(viewChild));

				DomUtils.replaceElement(viewChild, htmlparser.parseDOM("put subviews (unescaped) here")[0]);
				DomUtils.appendChild(newElement, child);
			} else {
				if (first == i) {
					DomUtils.appendChild(newElement, htmlparser.parseDOM("put subviews (unescaped) here")[0]);
				}
				containerView.addSubview(populateView(child));

				DomUtils.removeElement(child);
			}
		} else if (last < i) {
			DomUtils.appendChild(implicitElements, child);
		} else {
			DomUtils.appendChild(newElement, child);
		}
	}


	for (var i = 0; i < implicitElements.children.length; i++){
		DomUtils.appendChild(newElement, implicitElements.children[i]);
	}

	containerView.templateName = null;
	containerView.templateConst = DomUtils.getOuterHTML(newElement);
	return containerView;
}


PrivateAutoLayout.prototype.viewForHTML = function(html, normalizeWhitespace) {
	var self = this;
	var dom =  htmlparser.parseDOM(trim(html), {normalizeWhitespace: normalizeWhitespace ? true : false});
	return populateView(dom[0]);
};

// println("\n\n");
// var printSubviews = function(aView, anIndent) {
// 	println(anIndent + "View: " + aView.name + " (" + aView.uniqueId() + ")");
// 	println(anIndent + " " + aView.templateConst);

// 	for (var i=0 ; i < aView.subviews.length; i++) {
// 		printSubviews(aView.subviews[i], anIndent + '    ');
// 	}
// };
// printSubviews(newView, '');
// println("\n\n");


// println("Initializing " + newView.uniqueId());
// newView.renderHTML(function(err, html){
// 	println("===================== FINAL CALLBACK.");
// 	println(newView.templateConst);

// 	println("----------------");
// 	println(html);
// });
//println(newView.templateConst);

module.exports = View;





