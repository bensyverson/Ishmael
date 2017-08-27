'use strict';
var Representable = Representable || require('./ishmael.js');
var Common = Common || require('./common.js');
var CGPoint = Common.CGPoint;

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

IDEvent.prototype.pagePoint = function() {
	var self = this;
	var eventObj = self.userInfo.changedTouches ? self.userInfo.changedTouches[0] : self.userInfo;
	return new CGPoint(eventObj.pageX, eventObj.pageY);
};

module.exports = IDEvent;