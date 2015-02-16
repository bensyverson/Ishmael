
var View = View || require('./ishmael-view.js');
var IDEvent = IDEvent || require('./ishmael-idevent.js');
var nil = null;

/**
 * Simple control wrapper
 * @param {Object} anElement The original element (optional)
 * @constructor
 * @extends UIView
 */
var Control = function(templateName, aName, cb) {
	var self = this;
	View.call(this, templateName, aName, cb);
	if (self) {
		self.eventTargets = {};
	}
};

Control.prototype = Object.create(View.prototype);
Control.prototype.constructor = Control;


/** @const {number} */ Control.EventTouchDown			= 1 <<	0;
/** @const {number} */ Control.EventTouchDownRepeat		= 1 <<	1;
/** @const {number} */ Control.EventTouchDragInside		= 1 <<	2;
/** @const {number} */ Control.EventTouchDragOutside	= 1 <<	3;
/** @const {number} */ Control.EventTouchDragEnter		= 1 <<	4;
/** @const {number} */ Control.EventTouchDragExit		= 1 <<	5;
/** @const {number} */ Control.EventTouchUpInside		= 1 <<	6;
/** @const {number} */ Control.EventTouchUpOutside		= 1 <<	7;
/** @const {number} */ Control.EventTouchCancel			= 1 <<	8;
/** @const {number} */ Control.EventValueChanged		= 1 << 12;
/** @const {number} */ Control.EventEditingDidBegin		= 1 << 16;
/** @const {number} */ Control.EventEditingChanged		= 1 << 17;
/** @const {number} */ Control.EventEditingDidEnd		= 1 << 18;
/** @const {number} */ Control.EventEditingDidEndOnExit = 1 << 19;
/** @const {number} */ Control.EventAllTouchEvents		= 0x00000FFF;
/** @const {number} */ Control.EventAllEditingEvents	= 0x000F0000;
/** @const {number} */ Control.EventApplicationReserved = 0x0F000000;
/** @const {number} */ Control.EventSystemReserved		= 0xF0000000;
/** @const {number} */ Control.EventAllEvents			= 0xFFFFFFFF;


/** 
 * a target action which will typically take the form: 
 * function(e) { self.privateAction(); }
 * @summary Add a target action (function) for the control to call
 * @param {function(IDEvent)} aTargetAction The target action (function) to call with this IDEvent.
 * @param {number} aControlEvent The control event mask (eg UIControlEventTouchDown)
 */
Control.prototype.addTargetActionForControlEvents = function(aTargetAction, aControlEvent)
{
	var self = this;

	var aTargetArray = self.eventTargets[aControlEvent];
	if (!aTargetArray) {
		self.eventTargets[aControlEvent] = new Array();
		aTargetArray = self.eventTargets[aControlEvent];
	}

	for (var i = 0; i < aTargetArray.length; i++) {
		if (aTargetArray[i] == aTargetAction) {
			return; // We already have this exact target action for this control event.
		}
	}

	self.eventTargets[aControlEvent].push(aTargetAction); // Finally add the target-action.
};

/** 
 * Remove the target-action for this control event 
 * @param {function(IDEvent)} aTargetAction The target action (function) in question.
 * @param {number} aControlEvent The control event mask (eg UIControlEventTouchDown)
 */
Control.prototype.removeTargetActionForControlEvents = function(aTargetAction, aControlEvent)
{
	var self = this;
	alert("stub"); // TODO FIXME
};

/** 
 * Perform the target-action functions for this control event.
 * @param {number} controlEvents The control event mask (eg UIControlEventTouchDown)
 */
Control.prototype.sendActionsForControlEvents = function(controlEvents)
{
	var self = this;
	var controlEventMask = controlEvents | 0;
	
	for (var key in self.eventTargets) {
		if (self.eventTargets.hasOwnProperty(key)) {
			if ((controlEventMask & parseInt(key)) != 0) {
				for (var i = 0; i < self.eventTargets[key].length; i++) {
					var anEvent = new IDEvent(IDEventNameGeneric, controlEventMask);
					self.eventTargets[key][i](self, anEvent); // Actually run the control
				}
			}
		}
	}
};


/**
 * Touch event handler. If the Control wants to respond, it can.
 * @param {Event} anEvent The touch Event
 * @return {bool} A boolean indicating whether we handled this event
 */
Control.prototype.didReceiveTouch = function(anEvent) {
	var self = this;
	if (self.touchesBeganWithEvent) {
		var element = self.element();
		var handleTouchMove = nil;
		var handleTouchEnd = nil;
		var handleTouchCancel = nil;


		if (self.touchesMovedWithEvent) {
			handleTouchMove = function(moveEvent) {
				return self.touchesMovedWithEvent(moveEvent);
			};
		}

		if (self.touchesEndedWithEvent) {
			handleTouchEnd = function(endEvent) {
				element.removeEventListener('touchmove', handleTouchMove, false);
				element.removeEventListener('touchend', handleTouchEnd, false);
				element.removeEventListener('touchcancel', handleTouchCancel, false);
				element.removeEventListener('mouseup', handleTouchEnd, false);
				return self.touchesEndedWithEvent(endEvent);
			};
		}

		if (self.touchesCancelledWithEvent) {
			handleTouchCancel = function(endEvent) {
				element.removeEventListener('touchmove', handleTouchMove, false);
				element.removeEventListener('touchend', handleTouchEnd, false);
				element.removeEventListener('touchcancel', handleTouchCancel, false);
				element.removeEventListener('mouseup', handleTouchEnd, false);
				return self.touchesCancelledWithEvent(endEvent);
			};
		}

		if (handleTouchMove) element.addEventListener('touchmove', handleTouchMove, false);

		if (handleTouchEnd) element.addEventListener('touchend', handleTouchEnd, false);
		if (handleTouchEnd) element.addEventListener('mouseup', handleTouchEnd, false);

		if (handleTouchCancel) element.addEventListener('touchcancel', handleTouchCancel, false);

		return self.touchesBeganWithEvent(anEvent);
	} else {
		//NSLog(self.superview);
		//if (self.superview) return self.didReceiveTouch.call(self.superview, anEvent);
	}
	return true;
}

module.exports = Control;
