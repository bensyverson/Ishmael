var View = View || require('./ishmael-view.js');
var ViewController = ViewController || require('./ishmael-viewcontroller.js');
var Router = Router || require('./ishmael-router.js');
// var i18n = i18n || require('i18next');
var Representable = Representable || require('./ishmael.js');
var PutStuffHere = PutStuffHere || require('./putstuffhere.js');

/**
 * App object
 * @constructor
 * @method App
 * @param {ViewController} aViewController The root view controller
 * @return 
 */
var App = function(aViewController) {
	Representable.call(this);

	PutStuffHere.shared().setDefaultHTML("<div>put subviews (unescaped) here</div>");

	this.rootId = null;
	this.router = new Router();
	// this.dispatcher = new Dispatcher();

	this.viewControllers = [];
	
	if (aViewController) {
		this.viewControllers.push(aViewController);
	} 
	this.registerClass('App');
};
App.prototype = Object.create(Representable.prototype);
App.prototype.constructor = App;


/**
 * Init
 * @method init
 * @return 
 */
App.prototype.init = function() {
	var self = this;

	if (self.viewControllers.length < 1) {
		println("Apps should have one view controller at launch.");
	}
};

/**
 * Bootstrap, a method called by the browser to get ourselves going from zero.
 * @method bootstrap
 * @param {} anId
 * @param {} cb
 * @return 
 */
App.prototype.bootstrap = function(anId, cb) {
	var self = this;

	self.init();
	self.rootId = anId;
	var option = { resGetPath: '../locales/__lng__/__ns__.json' };

	// i18n.init(option, function() {
		self.rootViewController().loadView();
		self.rootViewController().viewDidLoad();

		
		self.rootViewController().viewWillAppear();
		self.rootViewController().view.bindToAppElement(self, document.getElementById(anId), function(err, id) {
			self.rootViewController().viewDidAppear();
			if (typeof(cb) === typeof(function(){})) cb(err, id);
		});
	// });
};

/**
 * Bootstrap, a method called by the browser to get ourselves going from zero.
 * @method packAndShip
 * @param {} cb
 * @return 
 */
App.prototype.packAndShip = function(cb) {
	var self = this;

	self.rootViewController().view.renderSnapshot(function(err, html){
		var myErr = null;
		var myHTML = null;
		if (err) {
			myErr = myErr
		} else {
			myHTML = html 
					+ '<script type="text/javascript">(function(){var m=function(e){'
					+ 'var j=\''
					+ self.freeze()
						.replace(/'/g, "\\\'")
						.replace(/\\n/g, "\\\\n")
					+ '\';var a=Representable.thaw(j);'
					+ 'a.mouthToMouth(function(err,appId){console.log("Launched " + appId);});'
					+ '};document.addEventListener("DOMContentLoaded",m);}())</script>';
		}
		if (typeof(cb) === typeof(function(){})) cb(myErr, myHTML);
	});
};

/**
 * Mouth to Mouth assumes that the DOM tree already exists.
 * In order to generate the DOM on the server, run the freeze()
 * or packAndShip() method on the app.
 * @method mouthToMouth
 * @param {} cb
 * @return 
 */
App.prototype.mouthToMouth = function(cb) {
	var self = this;
	var option = { resGetPath: '../locales/__lng__/__ns__.json' };

	// i18n.init(option, function() {
		self.rootViewController().viewDidLoad();
		self.rootViewController().viewWillAppear();
		var view = self.rootViewController().view;
		view.init(function(err, uniqueId){
			self.rootViewController().viewDidAppear();
			view.activate();
			if (typeof(cb) === typeof(function(){})) cb(err, uniqueId);
		});
	// });
};

/**
 * Get Root View Controller
 * @method rootViewController
 * @return MemberExpression
 */
App.prototype.rootViewController = function() {
	var self = this;
	return self.viewControllers[0];
};

/**
  * Description
  * @method viewControllerForRoute
  * @param {} aPath
  * @return Literal
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
 * @method addViewController
 * @param {ViewController} aViewController The View Controller
 * @return 
 */
App.prototype.addViewController = function(aViewController) {
	var self = this;
	self.viewControllers.push(aViewController);
};

module.exports = App;
