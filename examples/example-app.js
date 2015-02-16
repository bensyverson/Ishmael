"use strict";

/**
 * @summary example-app.js, part of Ishmael.js—a VC layer for isomorphic development in Sails
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


/**
 * What follows is an example app stub which connects with Waterline
 * to return objects from your models. It can be run on the server
 * or in the browser (via Browserify).
 * You may need to adjust the require() paths to match your layout. 
 */

var println = println || function(e) { console.log(e) };

var isBrowser = (typeof(window) !== typeof(undefined));
var io = isBrowser ? require('./dependencies/sails.io.js')() : function(){};

var ishmael = require('./dependencies/ishmael.js');

var MyWaterline = require('waterline');
var sailsAdapter = require('waterline-sails');

if (typeof sails === typeof(undefined)) {
	window.sails = {};
}

var init = function() {
	// As an example, search for a User with id: 1
	sails.models.user.findOne({ id: 1})
		.exec(function(err, model) {
			if (err) {
				println(err);
				return;
			}
			println("MODEL: ");
			println(model);
		});

};

var serverInit = function() {
	init();
};

var browserInit = function() {
	var myOrm = new MyWaterline();

	var config = {
		// Setup Adapters
		// Creates named adapters that have have been required
		adapters: {
			'default': sailsAdapter,
			'sails': sailsAdapter,
		},

		// Build Connections Config
		// Setup connections using the named adapter configs
		connections: {
			myLocalSails: {
				adapter: 'sails'
			},
		},

		defaults: {
			migrate: 'alter'
		}
	};

	var userModel = require('../../api/models/User');

	var MyUser = MyWaterline.Collection.extend({
		identity: 'User',
		connection: 'myLocalSails',
		attributes: userModel.attributes,
		schema: true,
	});

	myOrm.loadCollection(MyUser);

	myOrm.initialize(config, function(err, models) {
		if(err) throw err;
		sails.models = models.collections;
		init();
	});
};

var doInit = function() {
	if (isBrowser) {
		window.addEventListener('DOMContentLoaded', browserInit);
	} else {
		serverInit();
	}
}

if (isBrowser) {
	doInit();
}

module.exports = {
	initialize: doInit,
};
