var View = View || require('./ishmael-view.js');

var Representable = Representable || require('./ishmael.js');


/**
 * A View Controller
 * @constructor
 */
var ViewController = function(aRoute, aView) {
	Representable.call(this);

	this.view = aView || new View();
	this.route = aRoute;
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
 */
ViewController.prototype.init = function(cb) {
	var self = this;

	self.view.init(cb);
};


/**
 * Initialize the View Controller
 */
ViewController.prototype.childViewControllers = function() {
	var self = this;
	return self._childViewControllers;
};

/**
 * Add a new child view controller
 */
ViewController.prototype.addChildViewController = function(aViewController) {
	var self = this;
	// Order is important here.
	aViewController.parentViewController = self;		// 1
	aViewController.willMoveToParentViewController();	// 2
	self._childViewControllers.push(aViewController);	// 3
	aViewController.didMoveToParentViewController();	// 4
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
 */
ViewController.prototype.removeFromParentViewController = function() {
	var self = this;
	aViewController.parentViewController._removeChildViewController(self);
	aViewController.parentViewController = null;
};


/**
 * Notification that the VC will move to a new parent VC
 */
ViewController.prototype.willMoveToParentViewController = function() {
	var self = this;
};


/**
 * Notification that the VC moved to a new parent VC
 */
ViewController.prototype.didMoveToParentViewController = function() {
	var self = this;
};


/**
 * Transition from one child VC to another
 */
ViewController.prototype.transitionFromViewController = function(dict) {
	var self = this;
			// (_ fromViewController: UIViewController,
   //               toViewController toViewController: UIViewController,
   //                       duration duration: NSTimeInterval,
   //                        options options: UIViewAnimationOptions,
   //                     animations animations: (() -> Void)?,
   //                     completion completion: ((Bool) -> Void)?)
};


/**
 * Create the view hierarchy.
 */
ViewController.prototype.loadView = function(isAnimated) {
	var self = this;
};

/**
 * Alert that the view will appear.
 */
ViewController.prototype.viewWillAppear = function(isAnimated) {
	var self = this;
};


module.exports = ViewController;