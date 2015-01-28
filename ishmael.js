"use strict";

/**
 * @summary Ishmael.js is a VC layer for isomorphic development in Sails
 * @author <a href="mailto:ben@bensyverson.com">Ben Syverson</a>
 * @version 0.1
 * @copyright © Copyright 2015 Ben Syverson
 * @license The MIT License (MIT)
 * Copyright (c) 2015 Ben Syverson
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// flask stubb starbuck harpoon 

var require = require || function(){};
var _PutStuffHere = PutStuffHere || require('./putstuffhere.js');
var psh = psh || (_PutStuffHere ? _PutStuffHere.shared : null);

/**
 * Put Stuff Here doesn't know about Ishmael.
 * We'll insert `subviews (unescaped)` so Views can insert subviews.
 */
psh().setDefaultHTML("<div>put subviews (unescaped) here</div>");

var _uuid = UUID || require('./uuid.js');
var uuid = uuid || (_uuid ? _uuid.shared : null);

var _Queue = require('./queue.js');
var Queue = Queue || (_Queue ? _Queue.Queue : null);

var println = println || function(e) { console.log(e) };

var _ = _ || require('./lodash.js');




/**
 * Endpoint
 * @constructor
 */
var Endpoint = function(name) {
	this.name = name || 'untitled';

	var observers = {};
	/**
	 * Add an observer
	 * @param {String} elementId The DOM element ID
	 */
	Endpoint.prototype.addObserver = function(elementId) {
		var self = this;
		observers[elementId] = true;
	};

	/**
	 * Remove an observer
	 * @param {String} elementId The DOM element ID
	 */
	Endpoint.prototype.removeObserver = function(elementId) {
		var self = this;
		if (elementId in observers) delete observers[elementId];
	};
};



/**
 * Dispatcher
 * @constructor
 */
var Dispatcher = function() {
	var endpoints = [];

	/**
	 * Add Observer
	 * @param {String} elementId The ID of the element to bind
	 */
	this.bindElementToEndpoint = function(elementId, endpoint) {
		var self = this;
	};
};



/**
 * Router
 * @constructor
 */
var Router = function(routes) {
	// TODO
	this.routes = routes || {};
};





/**
 * App object
 * @constructor
 * @param {ViewController} aViewController The root view controller
 */
var App = function(aViewController) {
	// TODO
	this.router = new Router();
	this.dispatcher = new Dispatcher();

	this.viewControllers = [];
	

	this.makeSearchFriendly = function(aString) {
		return aString.replace(/^\s+/, '')
					.replace(/\s+$/, '')
					.replace(/\s+/, ' ')
					.toLocaleLowerCase();
	};
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
 * Get Root View Controller
 */
App.prototype.rootViewController = function() {
	var self = this;
	return self.viewControllers[0];
};



/**
 * Add View Controller
 * @param {ViewController} aViewController The View Controller
 */
App.prototype.addViewController = function(aViewController) {
	var self = this;
	self.viewControllers.push(aViewController);
};

/**
 * A View Controller
 * @constructor
 */
var ViewController = function(aRoute, aView) {
	// TODO
	this.view = aView || new View('untitled.html', 'Untitled');
	this.route = aRoute || 'default';
};


/**
 * View
 * @constructor
 */
var View = function(viewName, aName, cb) {
	var self = this;
	this.queue = new Queue();
	this.viewName = viewName || null;
	this.template = null;
	this.subviews = [];
	this.renderedHTML = '';
	this.superview = null;
	this.uniqueId = null;

	this.locals = {};

	this.name = aName || 'Anonymous View';

	// hooks for live updating
	this.model = '';
	this.id = -1;
	this.initialized = false;
	this.initStarted = false;

	if (cb) {
		this.init(cb);
	}
};


/**
 * Init
 * @param {Function} cb A function to call when all subviews have init()'d
 */
View.prototype.init = function(cb) {
	var self = this;

	self.initStarted = true;
	
	/* 
	 * Generate a UUID, set ourselves as initialized, run the queue, and do our callback.
	 */
	var initDone = function() {
		var initialize = function(uuid) {
			self.uniqueId = uuid;
			self.initialized = true;
			self.queue.flush();
			if (cb) cb(null, self.uniqueId);
		};
		if (self.uniqueId == null) {
			uuid().generate(initialize);
		} else {
			initialize();
		}
	};


	var doInit = function() {
		psh().getTemplateFunction(self.viewName, function(err, func){
			self.template = func;
			self.initializeSubviews(initDone);
		});
	}();
	return self;
};

View.prototype.initializeSubviews = function(cb){
	var self = this;

	if (self.subviews.length > 0) {
		var i = 0;
		var nextFunction = function() {
			if (i < self.subviews.length) {
				self.subviews[i++].init(function(){
					nextFunction();
				});
			} else {
				if (cb) cb();
			}
		};
		nextFunction();
	} else {
		if (cb) cb();
	}
};

View.prototype.enqueue = function(aFunction){
	var self = this;

	if ((!self.initStarted) && (!self.initialized)) {
		self.init();
	}


	// Here we intentionally check to see if we're initialized
	// right away. If we just called init(), we want to queue the callback.
	if (self.initialized) {
		aFunction();
	} else {
		self.queue.add(aFunction);
	}
	return self;
};


/**
 * Bind View to an element in the DOM, using routing from the app.
 * @param {App} anApp The parent app. We need its router to hijack links.
 * @param {Element} anElement The container element in the DOM
 * @param {Function} cb A callback
 */
View.prototype.bind = function(anApp, anElement, cb) {
	var self = this;

	self.enqueue(function() {
		if (anElement) {
			println("Trying to bind " + self.name);
			anElement.innerHTML = self.render(true);
			if (cb) cb(null, self.uniqueId);
		} else {
			println("Error! No element!");
		}
	});

	return self;
};


/**
 * Fill locals once update is ready
 * @param {Function} cb A callback
 */
View.prototype.updateLocals = function(cb) {
	var self = this;
	var err = null;
	// No op for now
	if (cb) cb(err, self.uniqueId);
	return self;
};

/**
 * Update View using routing from the app.
 * @param {Function} cb A callback
 */
View.prototype.update = function(cb) {
	var self = this;

	if (window === 'undefined') {
		println("Can't update in Node.");
		return;
	}

	if (!self.initialized) {
		return;
	}

	self.enqueue(function() {
		self.initializeSubviews(function() {
			var err = null;
			var elements = document.querySelectorAll("[data-ish=\"" + self.uniqueId + "\"]");

			if (elements.length > 0) {
				var anElement = elements[0];
				var dummy = document.createElement('div');
				dummy.innerHTML = self.render(true);
				anElement.parentNode.replaceChild(dummy.firstChild, anElement);
				dummy = null;
			} else {
				println("Warning: Can't find element for view " + self.name + " (" + self.uniqueId + ")");
			}
			if (cb) cb(err, self.uniqueId);
		});

	});

	return self;
};



/**
 * Add Subview. Not chainable, because init() must come either before or after.
 * @param {View} aView The View to add
 */
View.prototype.addSubview = function(aView) {
	var self = this;

	self.subviews.push(aView);
	aView.superview = self;
};

/**
 * Remove All Subviews.
 */
View.prototype.removeAllSubviews = function() {
	var self = this;
	println("Remove all subviews");

	while (self.subviews.length > 0) {
		var aSubview = self.subviews.pop();
		aSubview.removeAllSubviews();
	}

	// self.update();
	return self;
};


/**
 * Render
 */
View.prototype.render = function(isBrowser) {
	var self = this;

	var subviewString = '';
	for (var i = 0; i < self.subviews.length; i++) {
		subviewString += self.subviews[i].render(isBrowser);
	}

	self.updateLocals();
	self.locals['subviews'] = subviewString;

	if (!self.template) {
		println("No template for " + self.name + " (" + self.uniqueId + ")");
	}
	self.renderedHTML = self.template(self.locals);
	if (isBrowser) {
		// println("About to render " + self.name);
		self.renderedHTML = self.renderedHTML.replace(/^([^<]*<[a-z0-9]+)([>\s])/i, "$1 data-ish=\"" + self.uniqueId + "\"$2");
		// println("Came away with  " + self.renderedHTML);
	}

	return self.renderedHTML;
};

/**
 * Render to HTML asynchronously
 * @param {Function} cb A callback
 */
View.prototype.renderHTML = function(cb) {
	var self = this;

	self.enqueue(function() {
		if (cb) cb(self.render());
	});

	return self;
};


/**
 * Ishamel object for Waterline integration
 * @constructor
 */
var Ishmael = function(){

	/* Ships can be initialized with Sails Waterline objects as well as JSON */
	var Ship = function(endpointName) {
		this.endpoint = endpointName || '';
	};

	Ship.prototype.status = function() {
		return "I'm Sailing!";
	};

	/* Factory method for Ships */
	var Shipwright = function(shipName) {
		var ship = function() {
			var self = this;
			Ship.call(this, shipName);
		};
		ship.prototype = Object.create(Ship.prototype);
		ship.prototype.constructor = ship;
		return ship;
	};


	var User = Shipwright('user');
	var ishmael = new User();

	println(ishmael.endpoint);
};


// Ishmael();

var module = module || {};
module.exports = module.exports || {};
