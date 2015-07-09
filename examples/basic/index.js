"use strict";
if (typeof(require) === typeof(undefined)) window.require = function(){return null;};
var println = println || function(e) { console.log(e) };

var Ishmael = require('ishmael');
var View = View || Ishmael.View;
var App = App || Ishmael.App;


var BasicApp = function() {
	App.apply(this, arguments);

	var aViewController = new TabViewController('/');
	if (aViewController) {
		this.viewControllers.push(aViewController);
		aViewController.setApp(this);
	} 

	this.requirePaths = [
		'./assets/js/dependencies/ishmael-',
		'./assets/js/dependencies/radar',
		'./assets/js/dependencies/',
		'./assets/js/',
		'./radar',
		'./ishmael-',
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
