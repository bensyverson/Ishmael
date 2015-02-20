"use strict";
var Representable = Representable || require('./ishmael.js');

/** @const {string} */ var IDEventNameGeneric = 'com.ideo.genericEvent';

/**
 * Basic internal event
 * @param {string} anEventName The name (reverse-domain path) of the event
 * @param {number} controlEvent The control event mask (eg UIControlEventTouchDown)
 * @constructor
 */
var IDEvent = function(anEventName, controlEvent ) {
	Representable.call(this);
	this.userInfo = new Object();
	this.controlEvent = controlEvent || 0;
	this.eventName = anEventName || IDEventNameGeneric;
	this.registerClass('IDEvent');
};

module.exports = IDEvent;