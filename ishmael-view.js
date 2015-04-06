"use strict";

/**
 * Description
 * @method println
 * @param {} x
 * @returns 
 */
var println = function(x){console.log(x);}
var printWarning = function(x) { console.log('\x1b[33m• WARNING: %s\x1b[0m', x);};
var printError = function(x) { console.log('\x1b[31m• ERROR: %s\x1b[0m', x);};
var global = Function('return this')();
if (typeof(require) === typeof(undefined))  global.require = function(){return null;};

var PutStuffHere = PutStuffHere || require('./putstuffhere.js');

var OrgStuffHereQueue = OrgStuffHereQueue || require('./queue.js');

var Representable = Representable || require('./ishmael.js');

/**
 * View
 * @constructor
 * @method View
 * @param {} templateName
 * @param {} aName
 * @param {} cb
 * @returns 
 */
var View = function(templateName, aName, cb) {
	// var self = this;
	Representable.call(this);

	this.templateConst = null;
	this.templateName = templateName || null;
	this.template = null;
	this.subviews = [];
	this.superview = null;

	this.classes = [];

	this.addMarkup = true;
	this.useAutoLayout = true;
	this.hidden = false;

	this.locals = {};

	this.name = aName || 'Anonymous View';

	// hooks for live updating
	this.model = '';
	this.initialized = false;
	this.initStarted = false;

	this.registerClass('View');
	// this.uniqueId = uuid().generate();
};

View.prototype = Object.create(Representable.prototype);
View.prototype.constructor = View;


/**
 * Description
 * @method checkTemplate
 * @returns 
 */
View.prototype.checkTemplate = function() {
	var self = this;

	// No matter what, if we don't have a template, we're not initialized.
	if (!self.template) {
		self.initialized = false;	
	}

	// In a similar vein, if we don't have a queue, then the init hasn't started.
	if ((!self.queue) || !(self.queue.hasOwnProperty('add'))) {
		self.initStarted = false;
		self.queue = new OrgStuffHereQueue();
	}
};

/**
 * Init
 * @method init
 * @param {Function} cb A function to call when all subviews have init()'d
 * @returns self
 */
View.prototype.init = function(cb) {
	var self = this;

	// First, check to see if we have a template, and create a new Queue if necessary.
	self.checkTemplate();

	// We may already be initialized. If so, run the callback immediately.
	if (self.initialized) {
		if (cb) cb(null, self.uniqueId());
		return;
	}

	// If we already started the init, but haven't finished, just queue the callback and return.
	if (self.initStarted && (!self.initialized)) {
		self.enqueue(cb);
		return;
	}

	// Start initializing 
	self.initStarted = true;

	var setTemplate = function(err, template) {
		if ((!err) && template) {
			self.template = template;
		}
		self.initialized = (self.template != null);
		if (self.initialized) {
			self.initializeSubviews(function() {
				self.queue.flush();
				if (cb) cb(null, self.uniqueId());
			});
		} 
	};

	if (self.templateName) {
		if (self.useAutoLayout) {
			PutStuffHere.shared().getHTML(self.templateName, function(err, html){
				self.autoLayout(html, self.selector());
				setTemplate();
			});
		} else {
			PutStuffHere.shared().getTemplateFunction(self.templateName, setTemplate);
		}
	} else {
		if (self.useAutoLayout && self.templateConst) {
			self.autoLayout(self.templateConst, self.selector());
			setTemplate();
		} else {
			var func = PutStuffHere.shared().compileText(self.templateConst);
			setTemplate(null, func);
		}
	}
	return self;
};

View.prototype.selector = function() {
	var self = this;

	var hasId = /#([^#]+)$/;
	var idResult = hasId.exec(self.templateName);
	if (idResult && (idResult.length > 0)) {
		return {'id': idResult[1]};
	}

	return null;
};

/**
 * Description
 * @method autoLayout
 * @param {} html
 * @returns 
 */
View.prototype.autoLayout = function(html, selector) {
	var self = this;
	if (self.useAutoLayout !== true) {
		printWarning("AutoLayout called on manual layout view.");
	}
	if (self.template === null) {
		var AutoLayout = global.AutoLayout || require('./ishmael-layoutview.js');
		var al = new AutoLayout({
			requirePaths: self.app.requirePaths,
		});
		al.domUtils.isNative = false;
		al.autoLayoutViewWithHTML(self, html, selector, false);
		self.setApp(self.app);

		var func = PutStuffHere.shared().compileText(self.templateConst);
		self.template = func;
		self.initialized = (self.template != null);
	}
};

/**
 * Description
 * @method subview
 * @param {} selector
 * @returns Literal
 */
View.prototype.subview = function(selector) {
	var self = this;

	var selectByName = function(aName) {
		for (var i = 0; i < self.subviews.length; i++) {
			var aSubview = self.subviews[i];
			if (aSubview.name === aName) return aSubview;
		
			var aDeepSubview = self.subviews[i].subview(selector);
			if (aDeepSubview) return aDeepSubview;
		}
	};

	if (typeof(selector) === typeof({})){
		if (selector.hasOwnProperty('name')) {
			return selectByName(selector['name']);
		}
	} else if (typeof(selector) === typeof("string")) {
		return selectByName(selector);
	}
	return null;
};

/**
 * Description
 * @method addClass
 * @param {} className
 * @returns 
 */
View.prototype.addClass = function(className){
	var self = this;

	for (var i = 0; i < self.classes.length; i++) {
		if (self.classes[i] == className) return;
	}
	self.classes.push(className);
};

/**
 * Description
 * @method removeClass
 * @param {} className
 * @returns 
 */
View.prototype.removeClass = function(className){
	var self = this;

	var index = -1;
	for (var i = 0; i < self.classes.length; i++) {
		if (self.classes[i] == className) {
			index = i;
			break;
		}
	}
	if (index >= 0) {
		self.classes.splice(index, 1);
	}
};



/**
 * Description
 * @method element
 * @returns Literal
 */
View.prototype.element = function(){
	var self = this;
	if (typeof(document) !== typeof(undefined)) {
		var elements = document.querySelectorAll("[data-ish=\"" + self.uniqueId() + "\"]");
		if (elements.length > 0) {
			return elements[0];
		}
	}
	return null;
};


/**
 * Description
 * @method initializeSubviews
 * @param {} cb
 * @returns 
 */
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

/**
 * Description
 * @method enqueue
 * @param {} aFunction
 * @returns self
 */
View.prototype.enqueue = function(aFunction){
	var self = this;

	self.checkTemplate();

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
 * @method bindToAppElement
 * @param {App} anApp The parent app. We need its router to hijack links.
 * @param {Element} anElement The container element in the DOM
 * @param {Function} cb A callback
 */
View.prototype.bindToAppElement = function(anApp, anElement, cb) {
	var self = this;

	if (!anElement) {
		println("No root element!");
		return;
	}

	println("BINDING root view (" + self.uniqueId() + ")");
	self.renderHTML(function(err, html){
		println("************** BIND IS FINALLY DONE.");
		anElement.innerHTML = html;
		self.activate();
		if (cb) cb(null, self.uniqueId());
	});
};


/**
 * Activate the view in the DOM.
 * @method activate
 * @returns 
 */
View.prototype.activate = function() {
	var self = this;
	
	// Activate myself
	for (var i = 0; i < self.subviews.length; i++) {
		self.subviews[i].activate();
	}
};


/**
 * Fill locals once update is ready
 * @method updateLocals
 * @param {Function} cb A callback
 * @returns self
 */
View.prototype.updateLocals = function(cb) {
	var self = this;
	var err = null;
	// No op for now
	self.locals['name'] = self.name;
	if (cb) cb(null, self.uniqueId());
	return self;
};

/**
 * Layout subviews. 
 * @method layoutSubviews
 * @returns self
 */
View.prototype.layoutSubviews = function() {
	var self = this;
	// First update our locals. This gives subclasses a chance to set locals based on a custom object, data source, time of day, etc.

	// println("Laying out subviews for " + self.identity() + " : " + self.uniqueId());

	for (var i = 0; i < self.subviews.length; i++) {
		try {
			self.subviews[i].updateLocals();
			self.subviews[i].layoutSubviews();
		} catch(e) {
			printWarning("Subview: " + self.subviews[i].identity() + " " + self.subviews[i].uniqueId());
			printError(e);
		}
	}

	return self;
};

/**
 * Update View using routing from the app.
 * @method update
 * @param {Function} cb A callback
 * @returns self
 */
View.prototype.update = function(cb) {
	var self = this;

	// Just ignore if we're not in the browser.
	if (typeof (window) === typeof(undefined)) {
		return self.createInitLayoutSubviews(cb);
//		return cb();
	}

	if ((!self.initialized) && (self.initStarted)) {
		return cb();
	}

	return self.createInitLayoutSubviews(function(err, anId){
		// Get our `Element` in the DOM.
		var dummy = null;
		var anElement = null;
		var elements = document.querySelectorAll("[data-ish=\"" + self.uniqueId() + "\"]");
		if (elements.length > 0) {
			// Create a dummy `Element` and `_render` into its `innerHTML`. 
			anElement = elements[0];
			// dummy = document.createElement('div');
			// dummy.innerHTML = self._render(true);
			// We replace the element with the `firstChild` of dummy. Views should be wrapped in a single tag; this just helps enforces it.
			anElement.innerHTML = self._render(true);

			// `activate` allows subviews to wire up UI events
			self.activate();

		} else {
			err = "Couldn't find element for " + self.uniqueId() + " in the DOM.";
		}
		// Remove any reference to DOM objects.
		// dummy = null;
		anElement = null;
		elements = null;
		// Finally, run the callback.
		if (typeof(cb) === typeof(function(){})) cb(err, self.uniqueId());
	});
};

View.prototype.createInitLayoutSubviews = function(cb) {
	var self = this;
	// First, initialize ourselves if necessary, or queue this to run after we're initialized.
	self.enqueue(function() {
		// Create views if needed. This lets a subclass change its layout (add/remove subviews) based on the locals.
		self.createSubviews();

		// We need to re-initialize subviews, since createSubviews may have added / removed views.
		self.initializeSubviews(function() {
			
			// Update those locals	
			self.updateLocals();

			// Give subviews a chance to rearrange the subviews that were created and initialized
			self.layoutSubviews();

			// It shouldn't be possible to have an error, but we'll return null and our `uniqueId` to fit the standard `(err, data)` callback format.
			if (typeof(cb) === typeof(function(){})) cb(null, self.uniqueId());
		});
	});
	// Enable chaining
	return self;	
};



/**
 * Add Subview. Not chainable, because init() must come either before or after.
 * @method addSubview
 * @param {View} aView The View to add
 * @returns 
 */
View.prototype.addSubview = function(aView) {
	var self = this;
	if (self.app) aView.setApp(self.app);
	self.subviews.push(aView);
	aView.superview = self;
};

/**
 * Insert Subview
 * @method insertSubviewAtIndex
 * @param {View} aView The View to add
 * @param {} anIndex
 * @returns 
 */
View.prototype.insertSubviewAtIndex = function(aView, anIndex) {
	var self = this;
	aView.setApp(self.app);
	self.subviews.splice(anIndex, 0, aView);
	aView.superview = self;
};

/**
 * Remove from superview
 * @method removeFromSuperview
 * @returns 
 */
View.prototype.removeFromSuperview = function() {
	var self = this;

	if (self.superview) {
		var myIndex = -1;
		for (var i = 0; i < self.superview.subviews.length; i++) {
			var aSubview = self.superview.subviews[i];
			if (aSubview.uniqueId == self.uniqueId()) {
				myIndex = i;
				break;
			}
		}
		if (myIndex > -1) {
			self.superview.subviews.splice(myIndex, 1);
			self.superview = null;
		}
	}

	var element = self.element();
	if (element && element.parentNode) {
		//element.parentNode.removeChild(element);
		element = null;
	}
};

/**
 * Remove All Subviews.
 * @method removeAllSubviews
 * @returns self
 */
View.prototype.removeAllSubviews = function() {
	var self = this;

	while (self.subviews.length > 0) {
		self.subviews.pop().removeFromSuperview();
	}
	return self;
};

View.prototype.setApp = function(anApp) {
	var self = this;
	self.app = anApp;
	for (var i=0; i < self.subviews.length; i++) {
		self.subviews[i].setApp(anApp);
	}
};


/**
 * Render
 */
View.prototype._render = function(isBrowser) {
	var self = this;

	var renderedHTML = '';
	self.locals['subviews'] = '';

	// If this view is hidden, return the blank string.
	if (self.hidden) {
		return renderedHTML;
	}

	// Now we can concatenate all of our subviews together.
	var subviewString = self.subviews
							.map(function(v){ return v._render(isBrowser); })
							.join('');
	
	// `subviews` is a magic keyword in Ishmael. If you have an entry in self.locals named `subviews` it will be overwritten **silently**.
	self.locals['subviews'] = subviewString;

	if (!self.template) {
		// Unless you've unset self.template, this should not happen.
		printWarning("No template for " + self.name + " (" + self.uniqueId() + ")");
		// println(JSON.stringify(self));
		renderedHTML = '<div><!--ERROR--></div>';
	} else {
		renderedHTML = self.template(self.locals);
	}

	if (self.addMarkup) {
		renderedHTML = renderedHTML
			.replace(/^([^<]*<[a-z0-9]+)([>\s])/i, "$1 data-ish=\"" + self.uniqueId() + "\"$2");

		// Add any class names to the root element. It's important not to add style classes via Ishmael—that should be left in the HTML template. The classes are for things like 'selected', which allow CSS to reflect our internal state. If you need more than a class name or two to represent the state, the change in view is probably best represented as a different View subclass.
		if (self.classes.length > 0) {
			var classList = self.classes.join(' ');
			if (renderedHTML.match(/^[^<]*<[a-z0-9]+\s+[^>]+class\s*=/i)) {
				renderedHTML = renderedHTML
					.replace(/^([^<]*<[a-z0-9]+\s+[^>]+)\sclass\s*=\s*"([^"]+)"/i, "$1 class=\"$2 " + classList + "\"");
			} else {
				renderedHTML = renderedHTML
					.replace(/^([^<]*<[^>]+)>/i, "$1 class=\"" + classList + "\">");
			}
		}
	}


	delete self.locals['subviews'];

	return renderedHTML;
};

/**
 * Create any subviews necessary
 * @method renderHTML
 * @param {Function} cb A callback
 * @returns self
 */
View.prototype.createSubviews = function() {
	var self = this;
};

/**
 * Render to HTML asynchronously
 * @method renderHTML
 * @param {Function} cb A callback
 * @returns self
 */
View.prototype.renderHTML = function(cb) {
	var self = this;

	return self.createInitLayoutSubviews(function(err, anId){
		if (typeof(cb) === typeof(function(){})) cb(null, self._render());	
	});
};

/**
 * Render current HTML asynchronously
 * @method renderSnapshot
 * @param {Function} cb A callback
 * @returns self
 */
View.prototype.renderSnapshot = function(cb) {
	var self = this;

	self.enqueue(function() {
		// We'll skip createSubviews() and just take a snapshot of the current tree.
		if (typeof(cb) === typeof(function(){})) cb(null, self._render());	
	});
	return self;
};



module.exports = View;
