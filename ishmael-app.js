var View = View || require('./ishmael-view.js');
var ViewController = ViewController || require('./ishmael-viewcontroller.js');
var Router = Router || require('./ishmael-router.js');

/**
 * App object
 * @constructor
 * @param {ViewController} aViewController The root view controller
 */
var App = function(aViewController) {
	// TODO
	this.router = new Router();
	// this.dispatcher = new Dispatcher();

	this.viewControllers = [];
	
	if (aViewController) {
		this.viewControllers.push(aViewController);
	} 
};

/**
 * Init
 */
App.prototype.init = function() {
	var self = this;

	if (self.viewControllers.length < 1) {
		println("Apps should have one view controller at launch.");
	}
};

/**
 * Bootstrap, a method called by the browser to get ourselves going.
 */
App.prototype.bootstrap = function() {
	var self = this;

	//self.init();
	self.rootViewController().view.bindToAppElement(self, document.getElementById('app'));
};

/**
 * Get Root View Controller
 */
App.prototype.rootViewController = function() {
	var self = this;
	return self.viewControllers[0];
};

/**
 *
 */
 App.prototype.viewControllerForRoute = function(aPath) {
 	var self = this;
 	for (var i = 0; i < self.viewControllers.length; i++) {
 		if (aPath.hasPrefix(self.viewControllers[i].route)) {
 			return self.viewControllers[i];
 		}
 	}
 	return null;
 	//return self.router.itemForRoute(aPath) || new ViewController('../templates/index.html');
 };


/**
 * Add View Controller
 * @param {ViewController} aViewController The View Controller
 */
App.prototype.addViewController = function(aViewController) {
	var self = this;
	self.viewControllers.push(aViewController);
};

module.exports = App;