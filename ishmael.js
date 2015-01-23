"use strict";

/**
 * @summary Ishmael.js is a VC layer for isomorphic development in Sails
 * @author <a href="mailto:ben@bensyverson.com">Ben Syverson</a>
 * @version 0.1
 * @copyright © Copyright 2015 Ben Syverson
 * @license The MIT License (MIT)
 * Copyright (c) 2015 Ben Syverson
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// flask stubb starbuck harpoon 

var require = require || function(){};
var psh = psh || require('./putstuffhere.js').shared;

var println = println || function(e) { console.log(e) };


/**
 * Update Manager
 * @constructor
 */
var UpdateMangager = function() {
	this.endpoints = {};
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
var View = function(viewName) {
	this.viewName = viewName || 'index.html';
	this.template = null;
	this.subviews = [];
	this.superview = null;

	// hooks for live updating
	this.model = '';
	this.id = -1;
};


/**
 * Init
 */
View.prototype.init = function(cb) {
	var self = this;
	
	psh().getTemplateFunction(self.viewName, function(err, func){
		self.template = func;
		cb();
	});
};

/**
 * Add Subview
 * @param {View} aView The View to add
 */
View.prototype.addSubview = function(aView) {
	var self = this;

	self.subviews.push(aView);
	aView.superview = self;
};


/**
 * Render
 */
View.prototype.render = function() {
	var self = this;

	var subviewString = '';
	for (var i = 0; i < self.subviews.length; i++) {
		subviewString += self.subviews[i].render();
	}

	var locals = {
		subviews: subviewString,
		test: '         Testing!',
	};

	return self.template(locals);
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


var aView = new View('../../templates/blue.html');
aView.init(function(){
	println(aView.render());
});

var module = module || {};
module.exports = module.exports || {};
