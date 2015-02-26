"use strict";
var Representable = Representable || require('./ishmael.js');


/**
 * Endpoint
 * @constructor
 * @method Endpoint
 * @param {} name
 * @return 
 */
var Endpoint = function(name) {
	Representable.call(this);
	this.name = name || 'untitled';

	var observers = {};
	/**
	 * Add an observer
	 * @method addObserver
	 * @param {String} elementId The DOM element ID
	 * @return 
	 */
	Endpoint.prototype.addObserver = function(elementId) {
		var self = this;
		observers[elementId] = true;
	};

	/**
	 * Remove an observer
	 * @method removeObserver
	 * @param {String} elementId The DOM element ID
	 * @return 
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
 * @method Dispatcher
 * @return 
 */
var Dispatcher = function() {
	var endpoints = [];

	/**
	 * Add Observer
	 * @method bindElementToEndpoint
	 * @param {String} elementId The ID of the element to bind
	 * @param {} endpoint
	 * @return 
	 */
	this.bindElementToEndpoint = function(elementId, endpoint) {
		var self = this;
	};
};



/**
 * Router
 * @constructor
 * @method Router
 * @param {} routes
 * @return 
 */
var Router = function(routes) {
	// TODO
	this.routes = routes || {};
};

/**
 * Description
 * @method itemForRoute
 * @param {} aPath
 * @return Literal
 */
Router.prototype.itemForRoute = function(aPath) {
	var self = this;

	// TODO
	return self.routes[0];
	
	return null;
};

module.exports = Router;

