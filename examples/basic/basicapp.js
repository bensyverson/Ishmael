'use strict';
if (typeof(require) === typeof(undefined)) window.require = function(){return null;};
var println = println || function(e) { console.log(e) };

var Ishmael = require('../../index.js');
var View = View || Ishmael.View;
var ViewController = ViewController || Ishmael.ViewController;
var App = App || Ishmael.App;
var StoryListView = require('./storylistview.js');

var BasicApp = function() {
	App.apply(this, arguments);


	var storyListView = new StoryListView();

	var aViewController = new ViewController('/', storyListView);
	if (aViewController) {
		this.viewControllers.push(aViewController);
		aViewController.setApp(this);
	}

	this.requirePaths = [
		'../../lib/',
		'./',
	];

	this.registerClass('BasicApp');
};
BasicApp.prototype = Object.create(App.prototype);
BasicApp.prototype.constructor = BasicApp;

BasicApp.prototype.applicationWillFinishLaunching = function(cb) {
	var self = this;

	// Override this method in subclasses to do any asynchronous loading, before calling:
	console.log("Done");
};


if (typeof(module) === typeof(undefined)) window.module = {};
module.exports = BasicApp;
