"use strict";
var println = println || function(x){console.log(x);}
var global = Function('return this')();
if (typeof(require) === typeof(undefined))  global.require = function(){return null;};

var View = View || require('./ishmael-view.js');
var NativeDOMUtils = NativeDOMUtils || require("./ishmael-domutils.js");

if (!String.prototype.trim) {
  (function() {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function() {
      return this.replace(rtrim, '');
    };
  })();
}

/**
 * Description
 * @method AutoLayout
 * @param {Object=} options Configuration options
 * @exampleHelpers
 *	var snippet1 = '<div id="word"> 									\
 *		<ul>															\
 *			<li>														\
 *				test													\
 *			</li>														\
 *		</ul>															\
 *		<div>															\
 *			<p data-ish-class="InfoView" data-ish-name="infoView">		\
 *				put info here											\
 *			</p>														\
 *		</div>															\
 *		<article>														\
 *			<p data-ish-class="InfoView" data-ish-name="article">		\
 *				put article here										\
 *			</p>														\
 *		</article>														\
 *		<p>interstitial</p>												\
 *		<footer>														\
 *			<div>														\
 *				<p data-ish-class="WordView" data-ish-name="footer">	\
 *					put footer here										\
 *				</p>													\
 *			</div>														\
 *		</footer>														\
 *		<p>																\
 *			The End														\
 *		</p>															\
 *	</div>';
 * 
 *	var snippet2 = '<div id="word" data-ish-class="WordView"> 			\
 *		<ul>															\
 *			<li>														\
 *				test													\
 *			</li>														\
 *		</ul>															\
 *		<header>														\
 *			<article>													\
 *				<p data-ish-class="InfoView" data-ish-name="graphic">	\
 *					<svg data-ish-class="GraphicView" data-ish-name="illustration"> \
 *						put infographic here							\
 *					</svg>												\
 *				</p>													\
 *				<div>													\
 *					<div>												\
 *						<p data-ish-class="InfoView" data-ish-name="article">	\
 *							put article here							\
 *						</p>											\
 *					</div>												\
 *				</div>													\
 *			</article>													\
 *		</header>														\
 *		<p>																\
 *			Copyright 2015										\
 *		</p>															\
 *	</div>';

 * var al = new AutoLayout();
 * var View = function(templateName, aName, cb) {
 * 	 var self = this;
 *   this.subviews = [];
 *   this.addSubview = function(aView) {
 *     this.subviews.push(aView);
 *   };
 * };
 * this.View = View;
 *
 * var InfoView = function(templateName, aName, cb) {
 * 	 View.call(this, templateName, aName, cb);
 * };
 * InfoView.prototype = Object.create(View.prototype);
 * InfoView.prototype.constructor = InfoView;
 * this.InfoView = InfoView;
 *
 * var WordView = function(templateName, aName, cb) {
 * 	 View.call(this, templateName, aName, cb);
 * };
 * WordView.prototype = Object.create(View.prototype);
 * WordView.prototype.constructor = WordView;
 * this.WordView = WordView;
 *
 * var GraphicView = function(templateName, aName, cb) {
 * 	 View.call(this, templateName, aName, cb);
 * };
 * GraphicView.prototype = Object.create(View.prototype);
 * GraphicView.prototype.constructor = GraphicView;
 * this.GraphicView = GraphicView;
 * al.context = this;
 * 
 * @examples
 * al.domUtils.getOuterHTML(al.emptyDiv) // => '<div></div>'
 */
var AutoLayout = function(options) {
	// This will be prepended to any require() calls to get the View's object.
	this.viewRoot = './radar-';
	this.setInstanceVariables = true;
	if (options) {
		this.viewRoot = this.viewRoot || options.viewRoot;
		this.setInstanceVariables = this.setInstanceVariables || options.setInstanceVariables;
	}

	this.domUtils = new NativeDOMUtils();

	this.emptyDiv = this.domUtils.parseDOM('<div />', {normalizeWhitespace: true})[0];

	this.context = Function('return this')();
};


AutoLayout.prototype.printSubviews = function(v) {
	var anIndent = '';
	var innerPrintSubviews = function(aView, anIndent) {
		println("\n" + anIndent + "• " + aView.identity() + ": '" + aView.name + "' (" + aView.uniqueId() + ")");
		println(anIndent + aView.templateConst);

		for (var i=0 ; i < aView.subviews.length; i++) {
			innerPrintSubviews(aView.subviews[i], anIndent + '    ');
		}
	};
	innerPrintSubviews(v);
};



var indent = '';


/**
 * Determine if this `Element` or htmlparser2 `Object` has the `data-ish-class` attribute marking it as a View
 * @method nodeIsView
 * @param {(Element|Object)} node An `Element` or htmlparser2 `Object`
 * @returns {boolean} True if the node itself is a view.
 * @examples
 * var nodeWithView = al.domUtils.parseDOM('<div data-ish-class="TestView"></div>', {normalizeWhitespace: true})[0];
 * var nodeWithoutView = al.domUtils.parseDOM('<div data-ish-name="test"></div>', {normalizeWhitespace: true})[0];
 * var bareNode = al.domUtils.parseDOM('<p id="test"></p>', {normalizeWhitespace: true})[0];
 *
 * al.nodeIsView(nodeWithView) // => true
 * al.nodeIsView(nodeWithoutView) // => false
 * al.nodeIsView(bareNode) // => false
 */
AutoLayout.prototype.nodeIsView = function(node) {
	var self = this;
	var attribs = self.domUtils.getAttribs(node);
	return (typeof(attribs) !== typeof(undefined))
			&& (attribs !== {})
			&& (typeof(attribs['data-ish-class']) !== typeof(undefined));
}

/**
 * Description
 * @method attribsFromView
 * @param {(Element|Object)} node An `Element` or htmlparser2 `Object`
 * @returns {Object} An object dictionary with the className and name 
 * @examples
 * var nodeWithView = al.domUtils.parseDOM('<div data-ish-class="TestView" data-ish-name="Example"></div>', {normalizeWhitespace: true})[0];
 *
 * al.attribsFromView(nodeWithView) // => {"className": "TestView", "name": "Example"}
 * al.attribsFromView(al.emptyDiv) // => {"className": null, "name": null}
 */
AutoLayout.prototype.attribsFromView = function(node){
	var self = this;
	var attribs = self.domUtils.getAttribs(node);
	var containerClass = (attribs && attribs['data-ish-class']) ? attribs['data-ish-class'] : null;
	var containerName = (attribs && attribs['data-ish-name']) ? attribs['data-ish-name'] : null;
	return {
		className: containerClass,
		name: containerName,
	}
}


/**
 * Get the number of an node's `.children` which contain Views
 * @method numberOfChildrenWithViews
 * @param {(Element|Object)} node An `Element` or htmlparser2 `Object`
 * @returns {Number} The number of direct children which contain Views
 * @examples
 * var view1Node = al.domUtils.parseDOM(snippet1, {normalizeWhitespace: true})[0];
 * var view2Node = al.domUtils.parseDOM(snippet2, {normalizeWhitespace: true})[0];
 *
 * al.numberOfChildrenWithViews(view1Node) // => 3
 * al.numberOfChildrenWithViews(view2Node) // => 1
 */
AutoLayout.prototype.numberOfChildrenWithViews = function(node) {
	var self = this;
	// How many of my direct children have views?
	if (self.nodeIsView(node)) return 1;
	var viewCount = 0;
	var nodeChildren = self.domUtils.childNodes(node);
	if (nodeChildren) {
		for (var i= 0; i < nodeChildren.length; i++) {
			var child = nodeChildren[i];
			var aNode = self.firstChildWithView(child);
			if (aNode !== null) viewCount++;
		}
	}
	return viewCount;
};

/**
 * Description
 * @method firstChildWithView
 * @param {(Element|Object)} node
 * @returns {(Element|Object|null)} The first child which contains a View, or `null`
 * @examples
 * var view1Node = al.domUtils.parseDOM(snippet1, {normalizeWhitespace: true})[0];
 * var firstChild = al.firstChildWithView(view1Node);
 * var aView = al.viewFromNode(firstChild, null);
 *
 * firstChild != null // => true
 * aView // instanceof View
 * aView // instanceof InfoView
 */
AutoLayout.prototype.firstChildWithView = function(node) {
	var self = this;
	var attribs = self.domUtils.getAttribs(node);
	if (attribs && attribs['data-ish-class']) {
		return node;
	}
	var nodeChildren = self.domUtils.childNodes(node);
	if (nodeChildren) {
		for (var i= 0; i < nodeChildren.length; i++) {
			var childAttribs = self.domUtils.getAttribs(nodeChildren[i]);
			if (childAttribs && childAttribs['data-ish-class']) {
				return nodeChildren[i];
			}
			var first = self.firstChildWithView(nodeChildren[i]);
			if (first !== null) return first;
		}
	}
	return null;
};

/**
 * Description
 * @method viewFromNode
 * @param {(Element|Object)} node
 * @param {View} parentView
 * @returns {View} A new View
 * @examples
 * var view1Node = al.domUtils.parseDOM(snippet1, {normalizeWhitespace: true})[0];
 * var firstChild = al.firstChildWithView(view1Node);
 * var firstHTML = al.domUtils.getOuterHTML(firstChild);
 * 
 * view1Node != null // => true
 * firstHTML // =~ /<p data-ish-class="InfoView" data-ish-name="infoView">\s*put info here\s*<\/p>/
 */
AutoLayout.prototype.viewFromNode = function(node, parentView) {
	var self = this;
	var attribs = self.attribsFromView(node);
	var className = attribs['className'];
	var instanceName = attribs['name'];
	var aView = null;
	if ((typeof(className) !== typeof(undefined)) && (className !== null)) {
		if (className !== 'View') {
			var ctx = self.context;
			if (ctx) {
				if (typeof(ctx[className]) !== typeof(undefined)) {
//					if (ctx[className] instanceof View) {
						aView = new ctx[className](null, attribs.name);
//					}
				}
			}
			if (aView == null) {
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
		aView = new self.context['View'](null, attribs.name);
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

/**
 * Description
 * @method createViewForImplicitElements
 * @param {View} parentView
 * @param {(Element|Object)} implicitElements
 * @returns {View} The new View
 * @examples
 * var implicits = al.domUtils.emptyElement(al.emptyDiv);
 * var view1Node = al.domUtils.parseDOM('<li>Test goes here</li>', {normalizeWhitespace: true})[0];
 * al.domUtils.appendChild(implicits, view1Node);
 * var parent = new View();
 * var newView = al.createViewForImplicitElements(parent, implicits);
 * var implicitChildren = al.domUtils.childNodes(implicits);
 *
 * implicitChildren.length // => 1
 * newView // instanceof View
 */
AutoLayout.prototype.createViewForImplicitElements = function(parentView, implicitElements) {
	var self = this;
	var nodeChildren = self.domUtils.childNodes(implicitElements);
	if (nodeChildren && nodeChildren.length > 0) {
		var html = self.domUtils.getInnerHTML(implicitElements).trim();
		if (html.length > 0) {
			var implicitView = new self.context['View']();
			implicitView.useAutoLayout = false;
			implicitView.templateName = null;
			implicitView.templateConst = html;
			return implicitView;
		}
	}
	return null;
}

/**
 * Description
 * @method treeForNode
 * @param {View} parentView
 * @param {(Element|Object)} node
 * @returns {(Element|Object)} subTree
 * @examples
 * var view1Node = al.domUtils.parseDOM(snippet1, {normalizeWhitespace: true})[0];
 * var aView = new View();
 * var tree = al.treeForNode(aView, view1Node);
 */
AutoLayout.prototype.treeForNode = function(parentView, node) {
	var self = this;
	var subTree = self.domUtils.emptyElement(node);

	var nodeChildren = self.domUtils.childNodes(node);
	if (nodeChildren) {
		if (nodeChildren.length < 1) {
			return node;
		}
	} else {
		return node;
	}

	var childViewCount = self.numberOfChildrenWithViews(node);
	if (childViewCount == 1) {
		// If only one of our children contains a view, then iterate through the elements.
		for (var i = 0 ; i < nodeChildren.length; i++) {
			var child = nodeChildren[i];
			if (self.nodeIsView(child)) {
				// If we find a direct view, add it immediately.
				var aView = self.viewFromNode(child, parentView);
				parentView.addSubview(aView);

				var subviewTree = self.treeForNode(aView, child);
				var html = self.domUtils.getInnerHTML(node).trim();
				aView.templateConst = html;
				aView.templateName = null;

				parentView = aView;

				self.domUtils.appendChild(subTree, self.domUtils.parseDOM("insert subviews (unescaped) here")[0]);
			} else {
				// Otherwise, add the tree for the given element.
				self.domUtils.appendChild(subTree, self.treeForNode(parentView, child));
			}
		}
	} else if (childViewCount > 1) {
		// If multiple direct children of a node contain views, then those nodes (and any nodes in-between) will become container views.

		// First, find the first and last nodes with a view.
		var first = -1;
		var last = nodeChildren.length;
		var childCounts = [];
		var implicitElements = self.domUtils.emptyElement(self.emptyDiv);
		for (var i = 0 ; i < nodeChildren.length; i++) {
			var subChildCount = self.numberOfChildrenWithViews(nodeChildren[i]);
			childCounts[i] = subChildCount; // Cache this.
			if (subChildCount > 0) {
				if (first < 0) {
					first = i;
				}
				last = i;
			}
		}

		// Then step through them, either adding nodes to our subTree, or adding subviews to our parent View.
		for (var i = 0 ; i < nodeChildren.length; i++) {
			var child = nodeChildren[i];
			var subChildCount = childCounts[i];

			if ((i < first) || (i > last)) {
				// If we're before or after the subviews, just add this node to the tree normally.
				self.domUtils.appendChild(subTree, child);
			} else if ((i >= first) && (i <= last)) {
				// Otherwise, we're a subview *or* between subviews.

				if (subChildCount > 0) {
					// In this case, this child node contains a View.
					if (i == first) {
						// If we're the first subview, export a single text node to represent all the subviews.
						self.domUtils.appendChild(subTree, self.domUtils.parseDOM("insert subviews (unescaped) here")[0]);
					} else {
						// Important: If we've saved up implicit elements between this view and the last, create an anonymous view to contain them.
						var implicitView = self.createViewForImplicitElements(parentView, implicitElements, child);
						implicitElements = self.domUtils.emptyElement(self.emptyDiv);
						if (implicitView) {
							parentView.addSubview(implicitView);
						}
					}

					// Finally, create the view for this node. Note that we're creating this explicitly, because regardless of whether `child` is an explicit view or not, all the children in this range need container views.
					var aView = self.viewFromNode(child, parentView);
					parentView.addSubview(aView);

					var subviewTree = self.treeForNode(aView, child);
					var html = self.domUtils.getOuterHTML(subviewTree);
					aView.templateConst = html;
					aView.templateName = null;
				} else {
					// This node has no subviews, so we'll collect it in the implicitElements subtree. When the next view gets added, we'll make a container view for all of implicitElements.
					self.domUtils.appendChild(implicitElements, child);
				}
			}
		}
	} else {
		return node;
	}
	return subTree;
};

/**
 * Description
 * @param {String} someHtml The HTML to parse
 * @param {boolean=} normalizeWhitespace If `true`, all whitespace will be collapsed to a single space.
 * @returns {View} The view
 * @examples
 * var view1 = al.viewForHTML(snippet1, true);
 * var view2 = al.viewForHTML(snippet2, true);
 *
 * view1 !== null // => true
 * view1 // instanceof View
 * view1.subviews.length // => 4
 * view2 !== null // => true
 * view2 // instanceof View
 * view1.templateConst // =~ /<div id="word">\s*<ul>\s*<li>\s*test\s*<\/li>\s*<\/ul>\s*insert subviews \(unescaped\) here\s*<p>\s*The End\s*<\/p>\s*<\/div>/
 * view2.templateConst // =~ /<div id="word" data-ish-class="WordView">\s*<ul>\s*<li>\s*test\s*<\/li>\s*<\/ul>\s*<header>\s*<article>\s*insert subviews \(unescaped\) here\s*<\/article>\s*<\/header>\s*<p>\s*Copyright 2015\s*<\/p>\s*<\/div>/
 */
AutoLayout.prototype.viewForHTML = function(someHtml, normalizeWhitespace) {
	var self = this;

	var aView = new self.context['View']();
	aView.useAutoLayout = false;
	self.autoLayoutViewWithHTML(aView, someHtml, normalizeWhitespace);
	return aView;
};


/**
 * Description
 * @method autoLayoutViewWithHTML
 * @param {View} aView
 * @param {String} someHtml
 * @param {boolean=} normalizeWhitespace
 * @returns {AutoLayout} Self
 */
AutoLayout.prototype.autoLayoutViewWithHTML = function(aView, someHtml, normalizeWhitespace) {
	var self = this;
	if (!someHtml) {
		return self;
	}

	var dom =  self.domUtils.parseDOM(someHtml.trim(), {normalizeWhitespace: normalizeWhitespace ? true : false});

	var first = self.firstChildWithView(dom[0]);
	if (first !== null) {
		var tree = self.treeForNode(aView, dom[0]);
		aView.templateConst = self.domUtils.getOuterHTML(tree);
		aView.templateName = null;
	}
	return self;
};

module.exports = AutoLayout;

