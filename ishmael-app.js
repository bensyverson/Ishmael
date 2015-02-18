var View = View || require('./ishmael-view.js');
var ViewController = ViewController || require('./ishmael-viewcontroller.js');
var Router = Router || require('./ishmael-router.js');
var i18n = i18n || require('i18next');

var Representable = Representable || require('./ishmael.js');

/**
 * App object
 * @constructor
 * @param {ViewController} aViewController The root view controller
 */
var App = function(aViewController) {
	Representable.call(this);

	this.router = new Router();
	// this.dispatcher = new Dispatcher();

	this.viewControllers = [];
	
	if (aViewController) {
		this.viewControllers.push(aViewController);
	} 
};
App.prototype = Object.create(Representable.prototype);
App.prototype.constructor = App;


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
App.prototype.bootstrap = function(anId) {
	var self = this;

	//self.init();
	var option = { resGetPath: '../locales/__lng__/__ns__.json' };

	i18n.init(option, function() {
		self.rootViewController().loadView();
		self.rootViewController().viewWillAppear();

		self.rootViewController().view.bindToAppElement(self, document.getElementById(anId));
	});

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