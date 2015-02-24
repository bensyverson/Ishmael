"use strict";
var println = println || function(x){console.log(x);}
var View = View || require('./ishmael-view.js');

var htmlparser = htmlparser || require("htmlparser2");
var DomUtils = DomUtils || require("domutils");

// var PrivateAutoLayout = function() {

// };
var AutoLayout = function(options) {
	// This will be prepended to any require() calls to get the View's object.
	this.viewRoot = './radar-';
	this.setInstanceVariables = true;
	if (options) {
		this.viewRoot = this.viewRoot || options.viewRoot;
		this.setInstanceVariables = this.setInstanceVariables || options.setInstanceVariables;
	}

	// var _autoLayout = null;
	// this.shared = function() {
	// 	if (_autoLayout == null) {
	// 		_autoLayout = new PrivateAutoLayout();
	// 	}
	// 	return _autoLayout;
	// };
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



var aSnippet = '<div id="word" data-ish-class="WordView"> 									\
	<ul>															\
		<li>														\
			test													\
		</li>														\
	</ul>															\
	<header>															\
		<article>														\
			<p data-ish-class="FirstView" data-ish-name="infoView">		\
				<svg data-ish-class="GraphicView" data-ish-name="graphicView">		\
					put infographic here										\
				</svg>														\
			</p>														\
			<div>														\
				<div>														\
					<p data-ish-class="SecondView" data-ish-name="infoView">	\
						put article here									\
					</p>													\
				</div>														\
			</div>														\
		</article>														\
	</header>														\
	<p>																\
		&copy; Copyright 2015 Ben Syverson							\
	</p>															\
</div>';


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

var numberOfChildrenWithViews = function(node) {
	// How many of my direct children have views?
	if (nodeIsView(node)) return 1;
	var viewCount = 0;
	if (node.children) {
		for (var i= 0; i < node.children.length; i++) {
			var child = node.children[i];
			var aNode = firstChildWithView(child);
			if (aNode !== null) viewCount++;
		}
	}
	return viewCount;
};



var nodeIsView = function(node) {
	return (node.attribs && node.attribs['data-ish-class']);
}

var attribsFromView = function(node){
	var containerClass = node.attribs ? node.attribs['data-ish-class'] : null;
	var containerName = node.attribs ? node.attribs['data-ish-name'] : null;
	return {
		className: containerClass,
		name: containerName,
	}
}

AutoLayout.prototype.viewFromNode = function(node, parentView) {
	var self = this;
	var attribs = attribsFromView(node);
	var className = attribs['className'];
	var instanceName = attribs['name'];
	var aView = null;
	if ((typeof(className) !== typeof(undefined)) && (className !== null)) {
		if (className !== 'View') {
			var ctx = (function(){ return this; })();
			if (ctx) {
				if (typeof(ctx[className]) !== typeof(undefined)) {
					if (ctx[className] instanceof View) {
						aView = new ctx[className](null, attribs.name);
					}
				} 
			} else {
				try {
					var requiredClass = require(self.viewRoot + className + '.js') || null;
					if (requiredClass !== null) {
						aView = new requiredClass(null, attribs.name);
					}
				} catch(e) {
					println("No go on the require()");
				}
			}
		}
	}

	if (aView === null) {
		aView = new View(null, attribs.name);
	}

	if (self.setInstanceVariables) {
		if ((typeof(instanceName) !== typeof(undefined)) && (instanceName !== null)) {
			var aParent = parentView;
			while (aParent) {
				if (aParent.hasOwnProperty(instanceName) &&
					(typeof(aParent[instanceName]) !== typeof(function(){}))) {
					aParent[instanceName] = aView;
					break;
				}
				aParent = aParent.superview;
			}
		}
	}

	// if all else fails
	aView.useAutoLayout = false;
	return aView;
};

AutoLayout.prototype.createViewForImplicitElements = function(parentView, implicitElements, child) {
	var self = this;
	if (implicitElements.children.length > 0) {
//		var aView = self.viewFromNode(child, parentView);
		var html = DomUtils.getInnerHTML(implicitElements);

		if (html.length > 0) {
			var implicitView = new View();
			implicitView.useAutoLayout = false;
			implicitView.templateName = null;
			implicitView.templateConst = html;
			parentView.addSubview(implicitView);
		}
		implicitElements = emptyElement(emptyDiv);
	}
	return implicitElements;
}

AutoLayout.prototype.treeForNode = function(parentView, node) {
	var self = this;
	var subTree = emptyElement(node);

	if (node.children) {
		if (node.children.length < 1) {
			return node;
		}
	} else {
		return node;
	}

	var childViewCount = numberOfChildrenWithViews(node);

	if (childViewCount == 1) {
		// If only one of our children contains a view, then iterate through the elements.
		for (var i = 0 ; i < node.children.length; i++) {
			var child = node.children[i];
			if (nodeIsView(child)) {
				// If we find a direct view, add it immediately.
				var aView = self.viewFromNode(child, parentView);
				parentView.addSubview(aView);

				var subviewTree = self.treeForNode(aView, child);
				var html = DomUtils.getInnerHTML(node);
				aView.templateConst = html;
				aView.templateName = null;

				parentView = aView;

				DomUtils.appendChild(subTree, htmlparser.parseDOM("insert subviews (unescaped) here")[0]);
			} else {
				// Otherwise, add the tree for the given element.
				DomUtils.appendChild(subTree, self.treeForNode(parentView, child));
			}
		}
	} else if (childViewCount > 1) {
		// If multiple direct children of a node contain views, then those nodes (and any nodes in-between) will become container views.

		// First, find the first and last nodes with a view.
		var first = -1;
		var last = node.children.length;
		var childCounts = [];
		var implicitElements = emptyElement(emptyDiv);
		for (var i = 0 ; i < node.children.length; i++) {
			var subChildCount = numberOfChildrenWithViews(node.children[i]);
			childCounts[i] = subChildCount; // Cache this.
			if (subChildCount > 0) {
				if (first < 0) {
					first = i;
				}
				last = i;
			}
		}

		// Then step through them, either adding nodes to our subTree, or adding subviews to our parent View.
		for (var i = 0 ; i < node.children.length; i++) {
			var child = node.children[i];
			var subChildCount = childCounts[i];

			if ((i < first) || (i > last)) {
				// If we're before or after the subviews, just add this node to the tree normally.
				DomUtils.appendChild(subTree, child);
			} else if ((i >= first) && (i <= last)) {
				// Otherwise, we're a subview *or* between subviews.

				if (subChildCount > 0) {
					// In this case, this child node contains a View.
					if (i == first) {
						// If we're the first subview, export a single text node to represent all the subviews.
						DomUtils.appendChild(subTree, htmlparser.parseDOM("insert subviews (unescaped) here")[0]);
					} else {
						// Important: If we've saved up implicit elements between this view and the last, create an anonymous view to contain them.
						implicitElements = self.createViewForImplicitElements(parentView, implicitElements, child);
					}

					// Finally, create the view for this node. Note that we're creating this explicitly, because regardless of whether `child` is an explicit view or not, all the children in this range need container views.
					var aView = self.viewFromNode(child, parentView);
					parentView.addSubview(aView);

					var subviewTree = self.treeForNode(aView, child);
					var html = DomUtils.getOuterHTML(subviewTree);
					aView.templateConst = html;
					aView.templateName = null;
				} else {
					// This node has no subviews, so we'll collect it in the implicitElements subtree. When the next view gets added, we'll make a container view for all of implicitElements.
					DomUtils.appendChild(implicitElements, child);
				}
			}
		}
	} else {
		return node;
	}
	return subTree;
};

AutoLayout.prototype.viewForHTML = function(someHtml, normalizeWhitespace) {
	var self = this;

	var aView = new View();
	aView.useAutoLayout = false;
	self.autoLayoutViewWithHTML(aView, someHtml, normalizeWhitespace);
	return aView;
};


AutoLayout.prototype.autoLayoutViewWithHTML = function(aView, someHtml, normalizeWhitespace) {
	var self = this;
	if (!someHtml) {
		return self;
	}

	var dom =  htmlparser.parseDOM(trim(someHtml), {normalizeWhitespace: normalizeWhitespace ? true : false});

	var first = firstChildWithView(dom[0]);
	if (first !== null) {
		var tree = self.treeForNode(aView, dom[0]);
		aView.templateConst = DomUtils.getOuterHTML(tree);
		aView.templateName = null;
	}
	return self;
};


module.exports = AutoLayout;


