/** @const {string} */ var IDEventNameGeneric = 'com.ideo.genericEvent';

/**
 * Basic internal event
 * @param {string} anEventName The name (reverse-domain path) of the event
 * @param {number} controlEvent The control event mask (eg UIControlEventTouchDown)
 * @constructor
 */
var IDEvent = function(anEventName, controlEvent ) {
	this.userInfo = new Object();
	this.controlEvent = controlEvent || 0;
	this.eventName = anEventName || IDEventNameGeneric;
};

module.exports = IDEvent;