"use strict";

/**
 * @summary Ishmael.js is a VC layer for isomorphic development in Sails
 * @author <a href="mailto:bsyverson@ideo.com">Ben Syverson</a>
 * @version 0.1
 * @copyright © Copyright 2015 Ben Syverson
 */



/**
 * Queue
 * After http://www.dustindiaz.com/async-method-queues
 * @constructor
 */
var Queue = function() {
	// store your callbacks
	this._methods = [];

	// keep a reference to your response
	this._response = null;

	// all queues start off unflushed
	this._flushed = false;
};

/**
 * Adds callbacks to your queue
 * @param {Function} fn The callback to add
 */
Queue.prototype.add = function(fn) {
	var self = this;
	if (this._flushed) {
		// if the queue has been flushed, return immediately
		fn(this._response);
	} else {
		// otherwise push it on the queue
		this._methods.push(fn);
	}
};

/**
 * Adds callbacks to your queue
 * @param {Function} fn The callback to add
 */
Queue.prototype.flush = function(resp) {
	var self = this;
	// note: flush only ever happens once
	if (this._flushed) {
		return;
	}

	// store your response for subsequent calls after flush()
	this._response = resp;

	// mark that it's been flushed
	this._flushed = true;

	// shift 'em out and call 'em back
	while (this._methods[0]) {
		this._methods.shift()(resp);
	}
};



/**
 * Thing
 * @constructor
 */
var Thing = function() {
	this.queue = new Queue();

	this.html = '';
};

/**
 * read HTML
 * @param {String} src The src of the HTML
 */
Thing.prototype.readHTML = function(src) {
	var self = this;
	if (typeof document !== 'undefined') {
		var obj = document.createElement('object');
		obj.setAttribute('width', 0);
		obj.setAttribute('height', 0);
		obj.addEventListener('load', function(e) {
			self.html = obj.contentDocument
				.documentElement
				.getElementsByTagName("body")[0]
				.innerHTML;
			self.queue.flush(this);
		});
		obj.setAttribute('data', src);
		document.body.appendChild(obj);
	} else if (typeof fs !== 'undefined') {
		
	} else {
		console.log("Operating outside of Node or Browser context. Not sure where I am!");
	}
	return this;
};

/**
 * Print HTML
 * @param {String} src The src of the HTML
 */
Thing.prototype.printHTML = function(src) {
	var self = this;
	self.queue.add(function(resp){
		console.log(resp);
		console.log("Printing HTML •••••••••••• ");
		console.log(self.html);
	});
	return this;
};

var aThing = new Thing();
aThing.readHTML('../templates/index.html').printHTML();


