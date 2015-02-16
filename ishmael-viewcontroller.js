var View = View || require('./ishmael-view.js');


/**
 * A View Controller
 * @constructor
 */
var ViewController = function(aRoute, aView) {
	// TODO
	this.view = aView;
	this.route = aRoute;
};

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

module.exports = ViewController;