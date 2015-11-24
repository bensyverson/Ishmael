'use strict';

var DataView = DataView || require('./dataview.js');
var View = View || require('./view.js');

var io = io || ((typeof(window) !== typeof(undefined)) ? require('./sails.io.js').shared() : null);

var SailsWrapper = SailsWrapper || require('./sails.js');
var printError = printError || require('./printerror.js');

var println = function(msg) { console.log(msg); }

/**
 * A Sails-backed view
 * @constructor
 */
var SailsView = function() {
	DataView.apply(this, arguments);

	this.isBound = false;

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

	if (!self.isBound) {
		self.isBound = true;
		if (io && io.socket && io.socket.on) {
			io.socket.on(self.modelIdentity, function(msg){
				self.didReceiveSocketUpdate(msg);
			});
		}
	}

	SailsWrapper.shared().models[self.modelIdentity]
		.findOneById(self.modelId)
		.populateAll()
		.exec(function(err, model) {
			if (err) {
				printError(err);
			} else if (model) {
				self.modelObject = model.toObject();
				self.createSubviews();
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
	if (msg && msg.id && (msg.id == self.modelId) && msg.data ) {
		for (var property in msg.data) {
			if (msg.hasOwnProperty(property)) {
				self.modelObject[property] = msg[property];
			}
		}
		self.dataDidReload();
	}
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
