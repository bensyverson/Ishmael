'use strict';

var DataView = DataView || require('./ishmael-dataview.js');
var View = View || require('./ishmael-view.js');
var io = io || ((typeof(window) !== typeof(undefined)) ? require('./sails.io.js').shared() : null);
var SailsWrapper = SailsWrapper || require('./ishmael-sails.js');

var println = function(msg) { console.log(msg); }

/**
 * A Sails-backed view
 * @constructor
 */
var SailsView = function() {
	DataView.apply(this, arguments);


	this.registerClass('SailsView');
};

SailsView.prototype = Object.create(DataView.prototype);
SailsView.prototype.constructor = SailsView;


/**
 * Set up the socket.io callback in `initializeSubviews`
 * @param {Function} cb The callback
 */
SailsView.prototype.initializeSubviews = function(cb) {
	var self = this;

	//self.enqueue(function() {
		// println("INITIALIZING " + self.uniqueId());
		if (io && io.socket && io.socket.on) {
			io.socket.on(self.modelIdentity, self.didReceiveSocketUpdate );
		}

		SailsWrapper.shared().models[self.modelIdentity]
			.findOneById(self.modelId)
			.populateAll()
			.exec(function(err, model) {
				if (err) {
					println("ERROR: ");
					println(err);
				} else if (model ) {
					self.modelObject = model.toObject();

					self.layoutSubviews();
					self.updateLocals();
					
					View.prototype.initializeSubviews.call(self, function(){
						if (typeof(cb) === typeof(function(){})) {
							// println("SAILS VIEW IS ALL DONE APARENTLY " + self.uniqueId());
							cb(null, self.uniqueId());
						} else {
							println("NO CALLBACK");
						}
					});
				}
			});
	//});
};

SailsView.prototype.didReceiveSocketUpdate = function(msg) {
	var self = this;
	println("SOCKET UPDATE: ----------- ");
	println(msg);
};

SailsView.prototype.layoutSubviews = function() {
	var self = this;
	// println("Layoutsubviews");
	DataView.prototype.layoutSubviews.apply(self, arguments);
};

/**
 * Refresh the view with new data
 * @param {Function} cb A callback
 */
SailsView.prototype.dataDidReload = function(cb) {
	var self = this;

	// Do whatever you need to prepare the view for redrawing
	self.layoutSubviews();
	self.updateLocals();

	self.update(cb);
};

module.exports = SailsView;
