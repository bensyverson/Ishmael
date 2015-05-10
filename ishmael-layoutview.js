"use strict";
var println = println || function(x){console.log(x);}
var global = Function('return this')();
if (typeof(require) === typeof(undefined))  global.require = function(){return null;};

var View = View || require('./ishmael-view.js');
var NativeDOMUtils = NativeDOMUtils || require("./ishmael-domutils.js");
var printError = require('./ishmael-printerror.js');

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
 *		<header id="main">												\
 *			<article>													\
 *				<aside data-ish-class="InfoView" 						\
 *						data-ish-name="graphic">						\
 *					<span data-ish-class="GraphicView" 					\
 *						data-ish-name="illustration"> 					\
 *						put infographic here							\
 *					</span>												\
 *					<span data-ish-class="WordView" 					\
 *						data-ish-name="caption"> 						\
 *						put caption here								\
 *					</span>												\
 *				</aside>												\
 *				<div>													\
 *					<div>												\
 *						<p data-ish-class="InfoView" 					\
 *							data-ish-name="article">					\
 *							put article here							\
 *						</p>											\
 *					</div>												\
 *				</div>													\
 *			</article>													\
 *		</header>														\
 *		<p>																\
 *			Copyright 2015												\
 *		</p>															\
 *	</div>';
 *	var snippet3 = '<div> 												\
 *		<p data-ish-class="InfoView" 									\
 * 			data-ish-name="graphic" data-ish-visibility="hidden">		\
 *			<span data-ish-class="GraphicView" 							\
 *				data-ish-name="illustration" 							\
 *				data-ish-visibility="placeholder"> 						\
 *				This tag should be replaced with subviews.				\
 *			</span>														\
 *		</p>															\
 *		<p data-ish-class="TestView" data-ish-name="Ignore"				\
 *			data-ish-visibility="ignore">								\
 *			This tag should be removed from the template.				\
 *		</p>															\
 *		<div>															\
 *			<div>														\
 *				<p data-ish-class="WordView" data-ish-name="Tricky">	\
 *					<span data-ish-visibility="ignore">HideMe</span>	\
 *					put visible here									\
 *				</p>													\
 *			</div>														\
 *		</div>															\
 *	</div>';
 * var al = new AutoLayout();
 * var View = function(templateName, aName, cb) {
 * 	 var self = this;
 *   this.subviews = [];
 *   this.name = aName || "Anonymous View";
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
 */
var AutoLayout = function(options) {
	// This will be prepended to any require() calls to get the View's object.
	this.viewRoot = './';
	this.requirePaths = [];
	this.setInstanceVariables = true;
	if (options) {
		this.viewRoot = options.viewRoot || this.viewRoot;
		this.requirePaths = options.requirePaths || this.requirePaths;
		this.setInstanceVariables = options.setInstanceVariables || this.setInstanceVariables;
	}

	this.domUtils = new NativeDOMUtils();

	this.emptyDiv = this.domUtils.parseDOM('<div />', {normalizeWhitespace: true})[0];

	this.context = Function('return this')();
};


AutoLayout.prototype.printSubviews = function(v) {
	var anIndent = '';
	println("SUBVIEWS: •••••••••••••••••••••••••••••••");
	var innerPrintSubviews = function(aView, anIndent) {
		println("\n" + anIndent + "• " + /*aView.identity() + ": '" + */ aView.name + "' (" /*+ aView.uniqueId() */ + ")");
		println(anIndent + aView.templateConst);

		for (var i=0 ; i < aView.subviews.length; i++) {
			innerPrintSubviews(aView.subviews[i], anIndent + '    ');
		}
	};
	innerPrintSubviews(v, anIndent);
};

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
			&& (typeof(attribs['data-ish-class']) !== typeof(undefined))
			;
}

/**
 * Determine visibility of this specific node
 * @method visibilityOfNode
 * @param {(Element|Object)} node An `Element` or htmlparser2 `Object`
 * @param {Object=} attribs Optionally pass in the attributes
 * @returns {String} A string describing the visibility
 * @examples
 * al.visibilityOfNode(null, {"data-ish-visibility": "hidden"}) // => 'hidden'
 * al.visibilityOfNode(null, {"data-ish-class": "test", "data-ish-name": "El"}) // => 'visible'
 * al.visibilityOfNode(null, null) // => 'visible'
 */
AutoLayout.prototype.visibilityOfNode = function(node, attribs) {
	var self = this;
	if ((!attribs) && node) {
		attribs = self.domUtils.getAttribs(node);
	}
	if (attribs && attribs['data-ish-visibility']) {
		return attribs['data-ish-visibility'];
	}
	return 'visible';
};

/**
 * Description
 * @method attribsFromView
 * @param {(Element|Object)} node An `Element` or htmlparser2 `Object`
 * @returns {Object} An object dictionary with the className and name 
 * @examples
 * var nodeWithView = al.domUtils.parseDOM('<div data-ish-class="TestView" data-ish-name="Example"></div>', {normalizeWhitespace: true})[0];
 * var hiddenNode = al.domUtils.parseDOM('<p data-ish-class="EdView" data-ish-name="Ed" data-ish-visibility="hidden"></p>', {normalizeWhitespace: true})[0];
 *
 * al.attribsFromView(nodeWithView) // => {"className": "TestView", "name": "Example", "visibility": "visible"}
 * al.attribsFromView(hiddenNode) // => {"className": "EdView", "name": "Ed", "visibility": "hidden"}
 * al.attribsFromView(al.emptyDiv) // => {"className": null, "name": null, "visibility": "visible"}
 */
AutoLayout.prototype.attribsFromView = function(node){
	var self = this;
	var attribs = self.domUtils.getAttribs(node);
	var containerClass = (attribs && attribs['data-ish-class']) ? attribs['data-ish-class'] : null;
	var containerName = (attribs && attribs['data-ish-name']) ? attribs['data-ish-name'] : null;
	var visibility = self.visibilityOfNode(node, attribs);
	return {
		className: containerClass,
		name: containerName,
		visibility: visibility,
	}
}


/**
 * Get the number of an node's children which contain Views
 * @method numberOfChildrenWithViews
 * @param {(Element|Object)} node An `Element` or htmlparser2 `Object`
 * @returns {Number} The number of direct children which contain Views
 * @examples
 * var view1Node = al.domUtils.parseDOM(snippet1, {normalizeWhitespace: true})[0];
 * var view2Node = al.domUtils.parseDOM(snippet2, {normalizeWhitespace: true})[0];
 * var view3Node = al.domUtils.parseDOM(snippet3, {normalizeWhitespace: true})[0];
 * var view3Stripped = al.domUtils.stripIgnored(view3Node);
 *
 * al.numberOfChildrenWithViews(view1Node) // => 3
 * al.numberOfChildrenWithViews(view2Node) // => 1
 * al.numberOfChildrenWithViews(view3Node) // => 3
 * al.numberOfChildrenWithViews(view3Stripped) // => 2
 */
AutoLayout.prototype.numberOfChildrenWithViews = function(node) {
	var self = this;
	// How many of my direct children have views?
	// if (self.nodeIsView(node)) return 1;
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
 * var firstHTML = al.domUtils.getOuterHTML(firstChild);
 *
 * firstChild != null // => true
 * view1Node != null // => true
 * firstHTML // =~ /<p data-ish-class="InfoView" data-ish-name="infoView">\s*put info here\s*<\/p>/
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
 * var view2Node = al.domUtils.parseDOM(snippet2, {normalizeWhitespace: true})[0];
 * var aView = al.viewFromNode(view2Node);
 * 
 * view2Node != null // => true
 * aView // instanceof View
 * aView // instanceof WordView
 */
AutoLayout.prototype.viewFromNode = function(node, parentView) {
	var self = this;
	var attribs = self.attribsFromView(node);
	var className = attribs['className'];
	var instanceName = attribs['name'];
	var hidden = attribs['visibility'] && (attribs['visibility'] === 'hidden');
	var aView = null;
	if ((typeof(className) !== typeof(undefined)) && (className !== null)) {
		if (className !== 'View') {

			var ctx = self.context;
			if (ctx) {
				if (typeof(ctx[className]) === typeof(function(){})) {
					aView = new ctx[className](null, attribs.name);
				}
			}
			if (aView === null) {
				for (var j = 0; j < self.requirePaths.length; j++) {
					if (aView) break;
					try {
						var requiredClass = require(self.requirePaths[j] + className.toLocaleLowerCase() + '.js') || null;
						if (requiredClass !== null) {
							aView = new requiredClass(null, attribs.name);
						}
					} catch(e) {
						// printError("Couldn't instantiate custom class: " + e);
					}
				}
			}
			if (aView === null) {
				printError("Couldn't instantiate custom class: " + className);
			}
		}
	}

	if (aView === null) {
		var _View = View || self.context['View'] || null;
		if (!_View) {
			for (var j = 0; j < self.requirePaths.length; j++) {
				try {
					_View = require(self.requirePaths[j]+ 'ishmael-view.js');
					break;
				} catch(e){ }
			}
		}
		if (_View) aView = new _View(null, attribs.name);
	}
	
	if (!aView) {
		return null;
	}
	aView.hidden = hidden;
	aView.useAutoLayout = false;

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

	aView.useAutoLayout = false;
	return aView;
};

/**
 * Description
 * @method createViewForImplicitElements
 * @param {(Element|Object)} implicitElements
 * @returns {View} The new View
 * @examples
 * var implicits = al.domUtils.emptyElement(al.emptyDiv);
 * var view1Node = al.domUtils.parseDOM('<li>Test goes here</li>', {normalizeWhitespace: true})[0];
 * al.domUtils.appendChild(implicits, view1Node);
 * var newView = al.createViewForImplicitElements(implicits, null);
 * var implicitChildren = al.domUtils.childNodes(implicits);
 *
 * implicitChildren.length // => 1
 * newView // instanceof View
 */
AutoLayout.prototype.createViewForImplicitElements = function(implicitElements, parentView) {
	var self = this;
	var nodeChildren = self.domUtils.childNodes(implicitElements);
	if (nodeChildren && nodeChildren.length > 0) {
		var html = self.domUtils.getInnerHTML(implicitElements).trim();
		if (html.length > 0) {
			var implicitView = null;

			// If we just have one child, use `viewFromNode` to create the node. This allows you to specify a `data-ish-name` attribute without specifying a `data-ish-class`. Often, you just need to be able to refer to a subview, and don't mind it being a generic `View`. This way you don't have to manually specify `data-ish-class="View"`.
			if (nodeChildren.length == 1) {
				implicitView = self.viewFromNode(nodeChildren[0], parentView);
			} else {
				implicitView = new self.context['View']();
				implicitView.useAutoLayout = false;
				implicitView.templateName = null;
			}
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
 * 
 * tree != null // => true
 * aView.subviews.length // => 4
 */
AutoLayout.prototype.treeForNode = function(parentView, node) {
	var self = this;
	var subTree = self.domUtils.emptyElement(node);
	var visibility = self.visibilityOfNode(node);

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
			// Is this node a container for a View?
			if (self.nodeIsView(child)) {
				var childVisibility = self.visibilityOfNode(child);
				// If so, generate a view for it… unless it's a placeholder.
				if (childVisibility !== 'placeholder') {
					var aView = self.viewFromNode(child, parentView);
					parentView.addSubview(aView);

					var subviewTree = self.treeForNode(aView, child);
					var html = self.domUtils.getOuterHTML(subviewTree).trim();
					aView.templateConst = html;
					aView.templateName = null;
				}
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
			if ((subChildCount == 0) && (self.nodeIsView(nodeChildren[i]))) subChildCount = 1;
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
			var childVisibility = self.visibilityOfNode(child);
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
						var implicitView = self.createViewForImplicitElements(implicitElements, parentView);
						implicitElements = self.domUtils.emptyElement(self.emptyDiv);
						if (implicitView) {
							parentView.addSubview(implicitView);
						}
					}

					// Finally, create the view for this node. Note that we're creating this explicitly, because regardless of whether `child` is an explicit view or not, all the children in this range need container views.
					if (childVisibility !== 'placeholder') {
						var aView = self.viewFromNode(child, parentView);
						parentView.addSubview(aView);

						var subviewTree = self.treeForNode(aView, child);
						var html = self.domUtils.getOuterHTML(subviewTree).trim();
						aView.templateConst = html;
						aView.templateName = null;
					}
				} else {
					// This node has no subviews, so we'll collect it in the implicitElements subtree. When the next view gets added, we'll make a container view for all of implicitElements.
					// println(self.domUtils.getOuterHTML(child));
					if (child.data && child.data.trim() === '') {
					} else {
						self.domUtils.appendChild(implicitElements, child);
					}
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
 * var view1 = al.viewForHTML(snippet1, null, true);
 * var view2 = al.viewForHTML(snippet2, null, true);
 * var view3 = al.viewForHTML(snippet3, null, true);
 * var view2id = al.viewForHTML(snippet2, {"id": "main"}, true);
 * var view2name = al.viewForHTML(snippet2, {"id": "graphic"}, true);
 *
 * view1 !== null // => true
 * view1 // instanceof View
 * view1.templateConst // =~ /<div id="word">\s*<ul>\s*<li>\s*test\s*<\/li>\s*<\/ul>\s*insert subviews \(unescaped\) here\s*<p>\s*The End\s*<\/p>\s*<\/div>/
 * view1.subviews.length // => 4
 * view1.subviews[0].subviews.length // => 1
 * view1.subviews[0].subviews[0] // instanceof InfoView
 * view1.subviews[1].subviews.length // => 1
 * view1.subviews[1].subviews[0] // instanceof InfoView
 * view1.subviews[2].subviews.length // => 0
 * view1.subviews[3].subviews.length // => 1
 * view1.subviews[3].subviews[0] // instanceof WordView
 * view2 !== null // => true
 * view2 // instanceof View
 * view2.templateConst // =~ /<div id="word" data-ish-class="WordView">\s*<ul>\s*<li>\s*test\s*<\/li>\s*<\/ul>\s*<header id="main">\s*<article>\s*insert subviews \(unescaped\) here\s*<\/article>\s*<\/header>\s*<p>\s*Copyright 2015\s*<\/p>\s*<\/div>/
 * view2.subviews.length // => 2
 * view2.subviews[0].subviews.length // => 2
 * view2.subviews[0].name // => "graphic"
 * view2.subviews[0] // instanceof InfoView
 * view2.subviews[0].subviews[0].subviews.length // => 0
 * view2.subviews[0].subviews[0].name // => "illustration"
 * view2.subviews[0].subviews[0] // instanceof GraphicView
 * view2.subviews[1].subviews.length // => 1
 * view2.subviews[1].subviews[0] // instanceof InfoView
 * view2.subviews[1].subviews[0].name // => "article"
 * view2.subviews[1].subviews[0].subviews.length // => 0
 * view3.subviews.length // => 2
 * view3.subviews[0] // => instanceof InfoView
 * view3.subviews[0].hidden // => true
 * view3.subviews[0].subviews.length // => 0
 * view3.subviews[1].hidden // => false
 * view3.subviews[1].subviews.length // => 1
 * view3.subviews[1].subviews[0].templateConst // =~ /"Tricky">\s*put visible here\s*<\/p>\s*$/
 * view2id.subviews.length // => 2
 * view2id.templateConst // =~ /^\s*<header id="main">\s*<article>\s*insert subviews \(unescaped\) here\s*<\/article>\s*<\/header>$/
 * view2name.subviews.length // => 2
 * al.printSubviews(view2name) // undefined
 * view2name.templateConst // =~ /^\s*<aside data-ish-class="InfoView" data-ish-name="graphic">\s*insert subviews \(unescaped\) here\s*<\/aside>\s*$/
 */
AutoLayout.prototype.viewForHTML = function(someHtml, selector, normalizeWhitespace) {
	var self = this;

	var aView = new self.context['View']();
	aView.useAutoLayout = false;
	self.autoLayoutViewWithHTML(aView, someHtml, selector, normalizeWhitespace);
	return aView;
};


/**
 * Description
 * @method autoLayoutViewWithHTML
 * @param {View} aView
 * @param {String} someHtml
 * @param {Object} selector
 * @param {boolean=} normalizeWhitespace
 * @returns {AutoLayout} Self
 */
AutoLayout.prototype.autoLayoutViewWithHTML = function(aView, someHtml, selector, normalizeWhitespace) {
	var self = this;
	if (!someHtml) {
		return self;
	}

	var dom =  self.domUtils.parseDOM(someHtml.trim(), {normalizeWhitespace: normalizeWhitespace ? true : false});

	if (dom && (typeof(dom) === typeof([]))) {
		var stripped = self.domUtils.stripIgnored(dom[0]);
		if (stripped) {
			var element = stripped;
			if (selector && selector['id']) {
				element = self.domUtils.getElementById(stripped, selector['id']);
				if (!element) {
					element = self.domUtils.getElementByAttribute(stripped, 'data-ish-name', selector['id']);
				}
			}
			var first = self.firstChildWithView(element);
			var tree = null;
			if (first !== null) {
				tree = self.treeForNode(aView, element);
			} else {
				tree = stripped;
			}
			aView.templateConst = self.domUtils.getOuterHTML(tree);
			aView.templateName = null;
		}
	}
	return self;
};

module.exports = AutoLayout;

