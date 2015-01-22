"use strict";

/**
 * @summary Ishmael.js is a VC layer for isomorphic development in Sails
 * @author <a href="mailto:bsyverson@ideo.com">Ben Syverson</a>
 * @version 0.1
 * @copyright © Copyright 2015 Ben Syverson
 */

// flask stubb starbuck

var require = require || {};
var psh = require('putstuffhere');

var module = module || {};
module.exports = module.exports || {};

// module.exports = function(){


var UpdateManager = function() {
	this.endpoints = [];
};

UpdateManager.prototype.addObserver = function(viewOrElement) {
	var self = this;
};

UpdateManager.prototype.startListening = function(endpoint) {
	var self = this;
};

UpdateManager.prototype.stopListening = function(endpoint) {
	var self = this;
};

var View = function(){
	this.template = null;
	this.subviews = [];
	this.superview = null;

	// hooks for live updating
	this.model = '';
	this.id = -1;

};

View.prototype.addSubview = function(aView) {
	var self = this;
	self.subviews.push(aView);
	aView.superview = self;
};

View.prototype.render = function(locals) {
	var self = this;

	var string = '';
	for (int i = 0; i < self.subviews.length; i++) {
		string += self.subviews[i].render();
	}
	return string;
};

var Ishmael = function(){
	var println = function() {
		console.log(arguments);
	};
	println('-------------------');


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

module.exports = Ishmael;



// };

