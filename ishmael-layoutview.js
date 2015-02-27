"use strict";
var println = println || function(x){console.log(x);}
var global = Function('return this')();
if (typeof(require) === typeof(undefined))  global.require = function(){return null;};

var View = View || require('./ishmael-view.js');
var NativeDOMUtils = NativeDOMUtils || require("./ishmael-domutils.js");

/**
 * Description
 * @method AutoLayout
 * @param {} options
 * @exampleHelpers
 *
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
 * var newView = new View();
 * 
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

	this.emptyDiv = this.domUtils.parseDOM('<div />')[0];

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

/**
 * Description
 * @method firstChildWithView
 * @param {} node
 * @returns Literal
 */
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

/**
 * Description
 * @method trim
 * @param {} aString
 * @returns CallExpression
 */
var trim = function(aString) {
	return aString
			.replace(/^\s+/, '')
			.replace(/\s+$/, '');

};



/**
 * Description
 * @method numberOfChildrenWithViews
 * @param {} node
 * @returns viewCount
 */
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



/**
 * Description
 * @method nodeIsView
 * @param {} node
 * @returns LogicalExpression
 */
var nodeIsView = function(node) {
	return (node.attribs && node.attribs['data-ish-class']);
}

/**
 * Description
 * @method attribsFromView
 * @param {} node
 * @returns ObjectExpression
 */
var attribsFromView = function(node){
	var containerClass = node.attribs ? node.attribs['data-ish-class'] : null;
	var containerName = node.attribs ? node.attribs['data-ish-name'] : null;
	return {
		className: containerClass,
		name: containerName,
	}
}

/**
 * Description
 * @method viewFromNode
 * @param {} node
 * @param {} parentView
 * @returns aView
 */
AutoLayout.prototype.viewFromNode = function(node, parentView) {
	var self = this;
	var attribs = attribsFromView(node);
	var className = attribs['className'];
	var instanceName = attribs['name'];
	var aView = null;
	if ((typeof(className) !== typeof(undefined)) && (className !== null)) {
		if (className !== 'View') {
			var ctx = self.context;
			if (ctx) {
				if (typeof(ctx[className]) !== typeof(undefined)) {
						println("FOUND '" + className + "'");
//					if (ctx[className] instanceof View) {
						aView = new ctx[className](null, attribs.name);
//					}
				}  else {
					println("Couldn't find '" + className + "'");
				}
			}  else {
				println("NO CONTEXT");
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
 * @param {} parentView
 * @param {} implicitElements
 * @param {} child
 * @returns implicitElements
 */
AutoLayout.prototype.createViewForImplicitElements = function(parentView, implicitElements, child) {
	var self = this;
	if (implicitElements.children.length > 0) {
//		var aView = self.viewFromNode(child, parentView);
		var html = trim(self.domUtils.getInnerHTML(implicitElements));

		if (html.length > 0) {
			var implicitView = new self.context['View']();
			implicitView.useAutoLayout = false;
			implicitView.templateName = null;
			implicitView.templateConst = html;
			parentView.addSubview(implicitView);
		}
		implicitElements = self.domUtils.emptyElement(self.emptyDiv);
	}
	return implicitElements;
}

/**
 * Description
 * @method treeForNode
 * @param {} parentView
 * @param {} node
 * @returns subTree
 */
AutoLayout.prototype.treeForNode = function(parentView, node) {
	var self = this;
	var subTree = self.domUtils.emptyElement(node);

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
				var html = self.domUtils.getInnerHTML(node);
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
		var last = node.children.length;
		var childCounts = [];
		var implicitElements = self.domUtils.emptyElement(self.emptyDiv);
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
						implicitElements = self.createViewForImplicitElements(parentView, implicitElements, child);
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
 * @param {boolean} normalizeWhitespace If `true`, all whitespace will be collapsed to a single space.
 * @returns {View} The view
 * @examples
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
 *			&copy; Copyright 2015 Ben Syverson							\
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
 *			&copy; Copyright 2015 Ben Syverson							\
 *		</p>															\
 *	</div>';
 * var view1 = al.viewForHTML(snippet1, true);
 * var view2 = al.viewForHTML(snippet2, true);
 *
 * view1 !== null // => true
 * view1 // instanceof View
 * view1.subviews.length // => 4
 * view2 !== null // => true
 * view2 // instanceof View
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
 * @param {} aView
 * @param {} someHtml
 * @param {} normalizeWhitespace
 * @returns self
 */
AutoLayout.prototype.autoLayoutViewWithHTML = function(aView, someHtml, normalizeWhitespace) {
	var self = this;
	if (!someHtml) {
		return self;
	}

	var dom =  self.domUtils.parseDOM(trim(someHtml), {normalizeWhitespace: normalizeWhitespace ? true : false});

	var first = firstChildWithView(dom[0]);
	if (first !== null) {
		var tree = self.treeForNode(aView, dom[0]);
		aView.templateConst = self.domUtils.getOuterHTML(tree);
		aView.templateName = null;
	}
	return self;
};

var snippet1 = '<div id="word"> 										\
 		<ul>															\
 			<li>														\
 				test													\
 			</li>														\
 		</ul>															\
 		<div>															\
 			<p data-ish-class="InfoView" data-ish-name="infoView">		\
 				put info here											\
 			</p>														\
 		</div>															\
 		<article>														\
 			<p data-ish-class="InfoView" data-ish-name="article">		\
 				put article here										\
 			</p>														\
 		</article>														\
 		<p>interstitial</p>												\
 		<footer>														\
 			<div>														\
 				<p data-ish-class="WordView" data-ish-name="footer">	\
 					put footer here										\
 				</p>													\
 			</div>														\
 		</footer>														\
 		<p>																\
 			&copy; Copyright 2015 Ben Syverson							\
 		</p>															\
 	</div>';

this.View = View;
 var al = new AutoLayout();
 var InfoView = function(templateName, aName, cb) {
 	 View.call(this, templateName, aName, cb);
 	 this.registerClass('InfoView');
 };
 InfoView.prototype = Object.create(View.prototype);
 InfoView.prototype.constructor = InfoView;
 this.InfoView = InfoView;
 
 var WordView = function(templateName, aName, cb) {
 	 View.call(this, templateName, aName, cb);
 	 this.registerClass('WordView');
 };
 WordView.prototype = Object.create(View.prototype);
 WordView.prototype.constructor = WordView;
 this.WordView = WordView;
 
 var GraphicView = function(templateName, aName, cb) {
 	 View.call(this, templateName, aName, cb);
  	 this.registerClass('GraphicView');
 };
 GraphicView.prototype = Object.create(View.prototype);
 GraphicView.prototype.constructor = GraphicView;
 this.GraphicView = GraphicView;
 al.context = this;
 var newView = new View();
 
 var view1 = al.viewForHTML(snippet1, true);
 println("-------------")
 println(view1);

module.exports = AutoLayout;

