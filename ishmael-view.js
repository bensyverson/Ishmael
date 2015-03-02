"use strict";

/**
 * Description
 * @method println
 * @param {} x
 * @returns 
 */
var println = function(x){console.log(x);}
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

	if (!self.template) {
		self.initialized = false;	
	}

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

	self.checkTemplate();

	// If we already started the init, but haven't finished, queue the cb
	if (self.initStarted && (!self.initialized)) {
		self.enqueue(cb);
		return;
	}

	self.initStarted = true;

	/**
	 * Set ourselves as initialized, run the queue, and do our callback.
	 * @method initDone
	 * @returns 
	 */
	var initDone = function() {
		self.queue.flush();
		if (cb) cb(null, self.uniqueId());
	};

	if (self.initialized) {
		if (cb) cb(null, self.uniqueId());
		return;
	}

	/**
	 * Description
	 * @method setTemplate
	 * @param {} err
	 * @param {} template
	 * @returns 
	 */
	var setTemplate = function(err, template) {
		if ((!err) && template) {
			self.template = template;
		}
		self.initialized = (self.template != null);
		self.initializeSubviews(initDone);
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
		// self.templateConst = self.autoLayout(self.templateConst);
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
View.prototype.autoLayout = function(html) {
	var self = this;
	if (self.useAutoLayout !== true) {
		println("WARNING: autoLayout called on manual layout view.");
	}
	if (self.template == null) {
		var AutoLayout = global.AutoLayout || require('./ishmael-layoutview.js');

		var al = new AutoLayout();
		al.autoLayoutViewWithHTML(self, html, true);

		// al.printSubviews(self);

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

	/**
	 * Description
	 * @method selectByName
	 * @param {} aName
	 * @returns 
	 */
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
		/**
		 * Description
		 * @method nextFunction
		 * @returns 
		 */
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
 * @returns self
 */
View.prototype.bindToAppElement = function(anApp, anElement, cb) {
	var self = this;

	if (anElement) {
		self.renderHTML(function(err, html){
			anElement.innerHTML = html;
			self.activate();
			if (cb) cb(null, self.uniqueId());
		});
	} else {
		println("No root element!");	
	}
	return self;
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
 * Layout subviews
 * @method layoutSubviews
 * @returns self
 */
View.prototype.layoutSubviews = function() {
	var self = this;

	// First update our locals. This gives subclasses a chance to set locals based on a custom object, data source, time of day, etc.
	self.updateLocals();

	for (var i = 0; i < self.subviews.length; i++) {
		self.subviews[i].layoutSubviews();
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
		return;
	}

	if ((!self.initialized) && (self.initStarted)) {
		return;
	}

	self.enqueue(function() {
		self.layoutSubviews();

		self.initializeSubviews(function() {
			var err = null;
			var elements = document.querySelectorAll("[data-ish=\"" + self.uniqueId() + "\"]");

			if (elements.length > 0) {
				var anElement = elements[0];
				var dummy = document.createElement('div');
				dummy.innerHTML = self._render(true);
				anElement.parentNode.replaceChild(dummy.firstChild, anElement);

				self.activate();

				dummy = null;
			} 
			if (cb) cb(err, self.uniqueId());
		});
	});
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
//			delete self.superview.subviews[myIndex];
		}
	}

	var element = self.element();
	if (element && element.parentNode) {
		element.parentNode.removeChild(element);
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


/**
 * Render
 */
View.prototype._render = function(isBrowser) {
	var self = this;

	var renderedHTML = '';
	// Now we can concatenate all of our subviews together.
	var subviewString = self.subviews
							.map(function(v){ return v._render(isBrowser); })
							.join('');
	
	// `subviews` is a magic keyword in Ishmael. If you have an entry in self.locals named `subviews` it will be overwritten **silently**.
	self.locals['subviews'] = subviewString;

	if (!self.template) {
		// Unless you've unset self.template, this should not happen.
		println("No template for " + self.name + " (" + self.uniqueId() + ")");
		println(self);
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

	self.enqueue(function() {
		// Layout if needed. This lets a subclass change its layout (add/remove subviews) based on the locals.
		self.layoutSubviews();

		self.initializeSubviews(function() {
			if (typeof(cb) === typeof(function(){})) cb(null, self._render());	
		});
	});
	return self;
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
		self.layoutSubviews();

		self.initializeSubviews(function() {
			if (typeof(cb) === typeof(function(){})) cb(null, self._render());	
		});
	});
	return self;
};



module.exports = View;
