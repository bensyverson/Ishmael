'use strict';
var View = View || require('./view.js');
var Representable = Representable || require('./ishmael.js');


/**
 * A View Controller
 * @constructor
 * @method ViewController
 * @param {} aRoute
 * @param {} aView
 * @return 
 */
var ViewController = function(aRoute, aView) {
	Representable.call(this);

	this.app = null;
	this.view = aView || new View();
	this.route = aRoute;
	this.title = "View Controller";
	this._childViewControllers =[];
	this.parentViewController = null;
	this.registerClass('ViewController');
};
ViewController.prototype = Object.create(Representable.prototype);
ViewController.prototype.constructor = ViewController;


/**
 * Render the View Controller
 */
ViewController.prototype.render = function() {
	var self = this;
	return self.view.render();
};


/**
 * Initialize the View Controller
 * @method init
 * @param {} cb
 * @return 
 */
ViewController.prototype.init = function(cb) {
	var self = this;

	self.view.init(cb);
};


/**
 * Initialize the View Controller
 * @method childViewControllers
 * @return MemberExpression
 */
ViewController.prototype.childViewControllers = function() {
	var self = this;
	return self._childViewControllers;
};



ViewController.prototype.setApp = function(anApp) {
	var self = this;
	self.app = anApp;
	//console.log("Set app: " + anApp.uniqueId());
	var childVCs = self.childViewControllers();
	for (var i=0; i < childVCs.length; i++) {
		childVCs[i].setApp(anApp);
	}
	self.view.setApp(anApp);
};


/**
 * Add a new child view controller
 * @method addChildViewController
 * @param {} aViewController
 * @return 
 */
ViewController.prototype.addChildViewController = function(aViewController) {
	var self = this;
	// Order is important here.
	aViewController.parentViewController = self;		// 1
	if (self.app) aViewController.app = self.app;		// 2
	aViewController.willMoveToParentViewController();	// 3
	self._childViewControllers.push(aViewController);	// 4
	aViewController.didMoveToParentViewController();	// 5
};

/**
 * Remove a child view controller
 */
ViewController.prototype._removeChildViewController = function(aViewController) {
	var self = this;
	var index = -1;
	for (var i = 0; i < self._childViewControllers.length; i++) {
		if (self._childViewControllers[i] == aViewController) {
			index = i;
			break;
		}
	}
	if (index >= 0) {
		self._childViewControllers.splice(index, 1);
	}
};


/**
 * Initialize the View Controller
 * @method removeFromParentViewController
 * @return 
 */
ViewController.prototype.removeFromParentViewController = function() {
	var self = this;
	self.parentViewController._removeChildViewController(self);
	self.parentViewController = null;
};

/**
 * Remove all child View Controllers
 * @return
 */
ViewController.prototype.removeAllChildViewControllers = function() {
	var self = this;
	var children = self.childViewControllers();
	for (var i=0; i < children.length; i++) {
		children[i].removeFromParentViewController();
	}
}; 


/**
 * Notification that the VC will move to a new parent VC
 * @method willMoveToParentViewController
 * @return 
 */
ViewController.prototype.willMoveToParentViewController = function() {
	var self = this;
};


/**
 * Notification that the VC moved to a new parent VC
 * @method didMoveToParentViewController
 * @return 
 */
ViewController.prototype.didMoveToParentViewController = function() {
	var self = this;
};


/**
 * Transition from one child VC to another
 * @method transitionFromViewController
 * @param {} dict
 * @return 
 */
ViewController.prototype.transitionFromViewController = function(dict) {
	var self = this;
	// TODO FIXME
	console.log("transitionFromViewController is unimplemented");
};


/**
 * Create the view hierarchy.
 * @method loadView
 * @param {Function} cb Callback
 * @return 
 */
ViewController.prototype.loadView = function(cb) {
	var self = this;
	var children = self.childViewControllers();
	if (children.length > 0) {
		var i = 0;
		var nextFunction = function() {
			if (i < children.length) {
				children[i++].loadView(function(){
					nextFunction();
				});
			} else {
				if (cb instanceof Function) cb(null, self);
			}
		};
		nextFunction();
	} else {
		if (cb instanceof Function) cb(null, self);
	}
};

/**
 * Activate the view hierarchy.
 * @method viewDidLoad
 * @param {} isAnimated
 * @return 
 */
ViewController.prototype.viewDidLoad = function(isAnimated) {
	var self = this;
	var children = self.childViewControllers();
	for (var i = 0; i < children.length; i++) {
		children[i].viewDidLoad();
	}
};

/**
 * Alert that the view will appear.
 * @method viewWillAppear
 * @param {} isAnimated
 * @return 
 */
ViewController.prototype.viewWillAppear = function(isAnimated) {
	var self = this;
	//self.view.activate();
	var children = self.childViewControllers();
	for (var i = 0; i < children.length; i++) {
		children[i].viewWillAppear();
	}
};

/**
 * Alert that the view did appear.
 * @method viewDidAppear
 * @param {} isAnimated
 * @return 
 */
ViewController.prototype.viewDidAppear = function(isAnimated) {
	var self = this;
	var children = self.childViewControllers();
	for (var i = 0; i < children.length; i++) {
		children[i].viewDidAppear();
	}
};


module.exports = ViewController;