"use strict";
var Representable = Representable || require('./ishmael.js');


/**
 * Endpoint
 * @constructor
 */
var Endpoint = function(name) {
	Representable.call(this);
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

	this.registerClass('Endpoint');
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

Router.prototype.itemForRoute = function(aPath) {
	var self = this;

	// TODO
	return self.routes[0];
	
	return null;
};

module.exports = Router;

