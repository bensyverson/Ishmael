"use strict";

/**
 * @summary Ishmael.js is a VC layer for isomorphic development in Sails
 * @author <a href="mailto:bsyverson@ideo.com">Ben Syverson</a>
 * @version 0.1
 * @copyright © Copyright 2015 Ben Syverson
 */

// flask stubb starbuck harpoon 

var require = require || function(){};
var psh = psh || require('putstuffhere');

var module = module || {};
module.exports = module.exports || {};

var println = println || function(e) { console.log(e) };


/**
 * Update Manager
 * @constructor
 */
var UpdateMangager = function() {
	this.endpoints = [];
};

/**
 * Add Observer
 * @param {argumentType} argumentName The view to observe
 */
UpdateMangager.prototype.addObserver = function(argumentName) {
	var self = this;
};


/**
 * View
 * @constructor
 */
var View = function() {
	this.template = null;
	this.subviews = [];
	this.superview = null;

	// hooks for live updating
	this.model = '';
	this.id = -1;
};

/**
 * Add Subview
 * @param {View} aView The View to add
 */
View.prototype.addSubview = function(aView) {
	var self = this;
	var self = this;
	self.subviews.push(aView);
	aView.superview = self;
};


/**
 * Render
 */
View.prototype.render = function() {
	var self = this;

	var string = '';
	for (var i = 0; i < self.subviews.length; i++) {
		string += self.subviews[i].render();
	}
	return string;
};

var Ishmael = function(){

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

