'use strict';

var DataView = DataView || require('./ishmael-dataview.js');
var View = View || require('./ishmael-view.js');
var io = io || ((typeof(window) !== typeof(undefined)) ? require('./sails.io.js').shared() : null);
var SailsWrapper = SailsWrapper || require('./ishmael-sails.js');
var printError = printError || require('./ishmael-printerror.js');

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

	if (io && io.socket && io.socket.on) {
		io.socket.on(self.modelIdentity, function(msg) {
			self.didReceiveSocketUpdate(msg);
		});
	}

	SailsWrapper.shared().models[self.modelIdentity]
		.findOneById(self.modelId)
		.populateAll()
		.exec(function(err, model) {
			if (err) {
				printError(err);
			} else if (model) {
				self.modelObject = model.toObject();

				// self.createSubviews();
				self.layoutSubviews();
				self.updateLocals();
			}
			View.prototype.initializeSubviews.call(self, cb);
		});
};

SailsView.prototype.removeFromSuperview = function() {
	var self = this;

	View.prototype.removeFromSuperview.call(this);
};

SailsView.prototype.didReceiveSocketUpdate = function(msg) {
	var self = this;
	println("SOCKET UPDATE " + self.uniqueId() +  ": ----------- ");
	if (msg && msg.id && (msg.id == self.modelId) && msg.data ) {
		println(msg);
		for (var property in msg) {
			if (msg.hasOwnProperty(property)) {
				self.modelObject[property] = msg[property];
			}
		}
		self.dataDidReload();
	}
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
