var PutStuffHere = PutStuffHere || require('./putstuffhere.js');

var OrgStuffHereQueue = OrgStuffHereQueue || null;
var q = require('./queue.js') || OrgStuffHereQueue;

var _uuid = require('./autoincrement.js') || Autoincrementer;
var uuid = uuid || (_uuid ? _uuid.shared : null);


/**
 * View
 * @constructor
 */
var View = function(templateName, aName, cb) {
	var self = this;

	this.queue = new q();
	this.templateConst = "<div>put subviews (unescaped) here</div>";
	this.templateName = templateName || null;
	this.template = null;
	this.subviews = [];
	this.renderedHTML = '';
	this.superview = null;
	this.uniqueId = null;

	this.classes = [];

	this.locals = {};

	this.name = aName || 'Anonymous View';

	// hooks for live updating
	this.model = '';
	this.id = -1;
	this.initialized = false;
	this.initStarted = false;

};


/**
 * Init
 * @param {Function} cb A function to call when all subviews have init()'d
 */
View.prototype.init = function(cb) {
	var self = this;

	if (self.initStarted && (!self.initialized)) {
		self.enqueue(cb);
		return;
	}

	self.initStarted = true;
	self.locals = {};

	/* 
	 * Generate a UUID, set ourselves as initialized, run the queue, and do our callback.
	 */
	var initDone = function() {
		self.uniqueId = uuid().generate();
		self.initialized = true;
		self.queue.flush();
		if (cb) cb(null, self.uniqueId);
	};


	var doInit = function() {
		if (self.templateName) {
			PutStuffHere.shared().getTemplateFunction(self.templateName, function(err, func){
				self.template = func;
				self.initializeSubviews(initDone);
			});
		} else {
			self.template = PutStuffHere.shared().compileText(self.templateConst);
			self.initializeSubviews(initDone);
		}
	}();
	return self;
};

View.prototype.addClass = function(className){
	var self = this;

	for (var i = 0; i < self.classes.length; i++) {
		if (self.classes[i] == className) return;
	}
	self.classes.push(className);
};

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



View.prototype.element = function(){
	var self = this;
	var elements = document.querySelectorAll("[data-ish=\"" + self.uniqueId + "\"]");
	if (elements.length > 0) {
		return elements[0];
	} else {
		return null;
	}
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
View.prototype.bindToAppElement = function(anApp, anElement, cb) {
	var self = this;

	self.enqueue(function() {
		if (anElement) {
			anElement.innerHTML = self.render(true);

			self.activate();

			if (cb) cb(null, self.uniqueId);
		} else {
			println("Error! No element!");
		}
	});

	return self;
};


/**
 * Activate the view in the DOM.
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
 * @param {Function} cb A callback
 */
View.prototype.updateLocals = function(cb) {
	var self = this;
	var err = null;
	// No op for now
	self.locals['name'] = self.name;
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

				self.activate();

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
 * Remove from superview
 * @param {View} aView The View to add
 */
View.prototype.removeFromSuperview = function() {
	var self = this;

	if (self.superview) {
		var myIndex = -1;
		for (var i = 0; i < self.superview.subviews.length; i++) {
			var aSubview = self.superview.subviews[i];
			if (aSubview.uniqueId == self.uniqueId) {
				myIndex = i;
				break;
			}
		}
		if (myIndex > -1) {
			delete self.superview.subviews[myIndex];
		}
	}

	var element = self.element();
	if (element && element.parentNode) {
		element.parentNode.removeChild(element);
	}
};

/**
 * Remove All Subviews.
 */
View.prototype.removeAllSubviews = function() {
	var self = this;

	while (self.subviews.length > 0) {
		self.subviews.pop().removeFromSuperview();
	}
	
	return self;
};


/**
 * Render
 */
View.prototype.render = function(isBrowser) {
	var self = this;

	var subviewString = self.subviews
							.map(function(v){ return v.render(isBrowser); })
							.join('');
	
	self.updateLocals();
	self.locals['subviews'] = subviewString;

	if (!self.template) {
		println("No template for " + self.name + " (" + self.uniqueId + ")");
		self.renderedHTML = '<div><!--ERROR--></div>';
	} else {
		self.renderedHTML = self.template(self.locals);
	}
	// Add data attribute for our unique id
	if (isBrowser) {
		self.renderedHTML = self.renderedHTML
			.replace(/^([^<]*<[a-z0-9]+)([>\s])/i, "$1 data-ish=\"" + self.uniqueId + "\"$2");
	}

	// add our classes
	if (self.classes.length > 0) {
		var classList = self.classes.join(' ');
		if (self.renderedHTML.match(/^[^<]*<[a-z0-9]+\s+[^>]+class\s*=/i)) {
			self.renderedHTML = self.renderedHTML
				.replace(/^([^<]*<[a-z0-9]+\s+[^>]+)\sclass\s*=\s*"([^"]+)"/i, "$1 class=\"$2 " + classList + "\"");
		} else {
			self.renderedHTML = self.renderedHTML
				.replace(/^([^<]*<[^>]+)>/i, "$1 class=\"" + classList + "\">");
		}
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
		if (typeof(cb) === typeof(function(){})) cb(self.render());
	});

	return self;
};

module.exports = View;
