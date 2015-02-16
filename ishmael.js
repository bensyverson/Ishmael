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
if (typeof(require) === typeof(undefined)) window.require = function(){return null;};

var println = println || function(e) { console.log(e) };

var PutStuffHere = require('./putstuffhere.js') || PutStuffHere;

/**
 * Put Stuff Here doesn't know about Ishmael.
 * We'll insert `subviews (unescaped)` so Views can insert subviews.
 */
// psh().setDefaultHTML("<div>put subviews (unescaped) here</div>");

var _uuid = require('./autoincrement.js') || Autoincrementer;
var uuid = uuid || (_uuid ? _uuid.shared : null);

var _ = _ || require('./lodash.js');

var OrgStuffHereQueue = OrgStuffHereQueue || null;
var q = require('./queue.js') || OrgStuffHereQueue;

var App = App || require('./ishamel-app.js');


if (typeof sails === typeof(undefined)) {
	window.sails = {};
}

String.prototype.hasPrefix = function(prefix) {
    return this.indexOf(prefix) === 0;
}

/**
 * 
 */
String.prototype.makeSearchFriendly = function() {
	return this.replace(/^\s+/, '')
				.replace(/\s+$/, '')
				.replace(/\s+/, ' ')
				.toLocaleLowerCase();
};






/**
 * Ishamel object for Waterline integration
 * @constructor
 */
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


// Ishmael();
module.exports = Ishmael;
