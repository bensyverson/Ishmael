'use strict';
var Representable = Representable || require('./ishmael.js');

/** @const {string} */ var IDEventNameGeneric = 'com.bensyverson.genericEvent';

/**
 * Basic internal event
 * @constructor
 * @method IDEvent
 * @param {string} anEventName The name (reverse-domain path) of the event
 * @param {number} controlEvent The control event mask (eg UIControlEventTouchDown)
 * @return 
 */
var IDEvent = function(anEventName, controlEvent, userInfo ) {
	Representable.call(this);
	this.userInfo = userInfo || {};
	this.controlEvent = controlEvent || 0;
	this.eventName = anEventName || IDEventNameGeneric;
	this.registerClass('IDEvent');
};

module.exports = IDEvent;