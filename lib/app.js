'use strict';

var View = View || require('./view.js');
var ViewController = ViewController || require('./viewcontroller.js');
var Representable = Representable || require('./ishmael.js');
var PutStuffHere = PutStuffHere || require('putstuffhere');
var _uuid = require('./autoincrement.js') || Autoincrementer;
var uuid = uuid || (_uuid ? _uuid.shared : null);

/**
 * App object
 * @constructor
 * @method App
 * @param {ViewController} aViewController The root view controller
 * @return 
 */
var App = function(aViewController) {
	Representable.call(this);

	console.log("CREATING NEW APP INSTANCE: " + this.uniqueId());
	PutStuffHere.shared().setDefaultHTML("<div>put subviews (unescaped) here</div>");

	this.rootId = null;

	this.viewControllers = [];

	this.dataManager = null;

	this.requirePaths = [];
	this.sharedData = {};
	
	if (aViewController) {
		this.viewControllers.push(aViewController);
		aViewController.setApp(this);
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

	self.rootViewController().loadView(function() {
		self.rootViewController().view.bindToAppElement(self, document.getElementById(anId), function(err, id) {
			self.rootViewController().viewDidLoad();		
			self.rootViewController().viewWillAppear();
			self.rootViewController().viewDidAppear();
			if (typeof(cb) === typeof(function(){})) cb(err, id);
		});
	});
};



/**
 * Bootstrap, a method called by the browser to get ourselves going from zero.
 * @method packAndShip
 * @param {} cb
 * @return 
 */
App.prototype.packAndShipFromPath = function(aPath, cb) {
	var self = this;
	// Navigate to path
	// TODO
	var aVC = self.rootViewController();
	if (!aVC) {
		if (typeof(cb) === typeof(function(){})) cb("No VC", null);
		return;		
	}

	self.lastUniqueId = uuid().generate();

	aVC.view.renderHTML(function(err, html){
		var myErr = null;
		var myHTML = null;
		if (err) {
			myErr = myErr
		} else {
			myHTML = html 
					+ '<script type="text/javascript">(function(){var m=function(e){'
					+ 'var p=' + JSON.stringify(self.requirePaths) + ';'
					+ 'var Representable=null;'
					+ 'window.UserDefaults=null;'
					+ 'for (var i=0;i<p.length;i++){'
					+ ' try{Representable=require(p[i] + "ishmael.js");window.UserDefaults=require(p[i] + "ishmael-userdefaults.js");}catch(e){}'
					+ ' if (Representable !== null) break;'
					+ '}'
					+ 'var j='
					+ JSON.stringify(JSON.stringify(self))
						// .replace(/'/g, "\\\'")
						// .replace(/\\"/g, '\\\\\\\"')
						// .replace(/\\n/g, "\\\\n")
					+ ';var a=Representable.thaw(j, null,' + JSON.stringify(self.requirePaths) + ');'
					+ 'a._mouthToMouth(function(err,appId){console.log("Launched " + appId);});'
					+ '};document.addEventListener("DOMContentLoaded",m);}())</script>';
		}
		if (typeof(cb) === typeof(function(){})) cb(myErr, myHTML);
	});
};

/**
 * An internal method to revive Apps from the output generated by `packAndShipFromPath()`
 * @method mouthToMouth
 * @param {} cb
 * @return 
 */
// You should never call this method directly. `_mouthToMouth()` is called automatically by the function generated in `packAndShipFromPath()` on the server. `_mouthToMouth()` uses the HTML output from `packAndShipFromPath()` to skip rendering the View hierarchy, and calls `activate()` to bind the App's eventListeners to the DOM elements.
App.prototype._mouthToMouth = function(cb) {
	var self = this;

	println("Last unique id: " + self.lastUniqueId);
	uuid().advance(self.lastUniqueId);

	self.applicationWillFinishLaunching(cb);
};

App.prototype.applicationWillFinishLaunching = function(cb) {
	var self = this;
	// Override this method in subclasses to do any asynchronous loading, before calling:
	self.finishLaunchingApplication(cb);	
};

App.prototype.finishLaunchingApplication = function(cb) {
	var self = this;
	UserDefaults.sharedUserDefaults()['app'] = self;

//	self.rootViewController().viewWillAppear();
//	self.rootViewController().viewDidAppear();

	var view = self.rootViewController().view;
	view.init(function(err, uniqueId){
		self.rootViewController().viewDidLoad();
		self.rootViewController().viewWillAppear();
		self.rootViewController().viewDidAppear();
		view.activate();
		if (typeof(cb) === typeof(function(){})) cb(err, uniqueId);
	});
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
 	if (aPath.match(/[^\/]$/)) {
 		aPath += '/';
 	}
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