'use strict';

var View = View || require('./view.js');

/**
 * DataView is a view wich represents a database object. When the object is updated on the database, the view should refresh itself.
 * @constructor
 */
var DataView = function() {
	View.apply(this, arguments);

	this.modelObject = {};
	this.modelId = 0;
	this.modelIdentity = "";

	this.registerClass('DataView');
};

DataView.prototype = Object.create(View.prototype);
DataView.prototype.constructor = DataView;

DataView.prototype.layoutSubviews = function() {
	var self = this;
	View.prototype.layoutSubviews.apply(self, arguments);
};


DataView.prototype.subscribeToModelIdentity = function(identity) {
	var self = this;
	// stub
};

/**
 * Refresh the view with new data
 * @param {Function} cb A callback
 */
DataView.prototype.dataDidReload = function(cb) {
	var self = this;

	// Do whatever you need to prepare the view for redrawing
	self.layoutSubviews();
	self.updateLocals();
};

module.exports = DataView;