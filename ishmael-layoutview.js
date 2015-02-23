"use strict";
var println = println || function(x){console.log(x);}
var View = View || require('./ishmael-view.js');

var htmlparser = htmlparser || require("htmlparser2");
var DomUtils = DomUtils || require("domutils");


// var PrivateAutoLayout = function() {

// };
var AutoLayout = function() {
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

var viewFromNode = function(node) {
	var attribs = attribsFromView(node);
	return new View(null, attribs.name);
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

var createViewForImplicitElements = function(parentView, implicitElements, child) {
	if (implicitElements.children.length > 0) {
		var aView = viewFromNode(child);
		var html = trim(DomUtils.getInnerHTML(implicitElements));
		if (html.length > 0) {
			var implicitView = new View();
			implicitView.templateName = null;
			implicitView.templateConst = html;
			parentView.addSubview(implicitView);
		}
		implicitElements = emptyElement(emptyDiv);
	}
	return implicitElements;
}

var treeForNode = function(parentView, node) {
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
				var aView = viewFromNode(child);
				var subviewTree = treeForNode(aView, child);
				var html = DomUtils.getInnerHTML(node);
				aView.templateConst = html;
				aView.templateName = null;

				parentView.addSubview(aView);
				parentView = aView;

				DomUtils.appendChild(subTree, htmlparser.parseDOM("insert subviews (unescaped) here")[0]);
			} else {
				// Otherwise, add the tree for the given element.
				DomUtils.appendChild(subTree, treeForNode(parentView, child));
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
						implicitElements = createViewForImplicitElements(parentView, implicitElements, child);
					}

					// Finally, create the view for this node. Note that we're creating this explicitly, because regardless of whether `child` is an explicit view or not, all the children in this range need container views.
					var aView = viewFromNode(child);
					var subviewTree = treeForNode(aView, child);
					var html = DomUtils.getOuterHTML(subviewTree);
					aView.templateConst = html;
					aView.templateName = null;
					parentView.addSubview(aView);
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

AutoLayout.prototype.viewForHTML = function(html, normalizeWhitespace) {
	var self = this;
	var dom =  htmlparser.parseDOM(trim(html), {normalizeWhitespace: normalizeWhitespace ? true : false});

	var aView = new View();
	var tree = treeForNode(aView, dom[0]);
	var html = DomUtils.getOuterHTML(tree);
	aView.templateConst = html;
	aView.templateName = null;

	return aView;
};



var al = new AutoLayout();
var newView = al.viewForHTML(aSnippet, true);


println("\n\n");
var printSubviews = function(aView, anIndent) {
	println("\n");
	println(anIndent + "View: " + aView.name + " (" + aView.uniqueId() + ")");
	println(anIndent + aView.templateConst);

	for (var i=0 ; i < aView.subviews.length; i++) {
		printSubviews(aView.subviews[i], anIndent + '    ');
	}
};
printSubviews(newView, '');
println("\n\n");

newView.renderHTML(function(err, html){
	println("===================== FINAL CALLBACK.");
	println(newView.templateConst);

	println("----------------\n\n");
	println(html);
	println("\n\n----------");
});
// println(newView.templateConst);

module.exports = View;





