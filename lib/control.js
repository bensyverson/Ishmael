'use strict';

var Representable = Representable || require('./ishmael.js');
var IDEvent = IDEvent || require('./idevent.js');

/** @const {string} */ var IDControlEventGeneric = 'com.ideo.control.genericEvent';

var nil = null;

/**
 * Simple control wrapper
 * @constructor
 * @extends UIView
 * @method Control
 * @param {} templateName
 * @param {} aName
 * @param {} cb
 * @return 
 */
var Control = function(templateName, aName, cb) {
	var self = this;
	Representable.call(this, templateName, aName, cb);
	
	this.eventTargets = {};

	this.registerClass('Control');
};

Control.prototype = Object.create(Representable.prototype);
Control.prototype.constructor = Control;


/** @const {number} */ Control.TouchDown			= 1 <<	0;
/** @const {number} */ Control.TouchDownRepeat		= 1 <<	1;
/** @const {number} */ Control.TouchDragInside		= 1 <<	2;
/** @const {number} */ Control.TouchDragOutside		= 1 <<	3;
/** @const {number} */ Control.TouchDragEnter		= 1 <<	4;
/** @const {number} */ Control.TouchDragExit		= 1 <<	5;
/** @const {number} */ Control.TouchUpInside		= 1 <<	6;
/** @const {number} */ Control.TouchUpOutside		= 1 <<	7;
/** @const {number} */ Control.TouchCancel			= 1 <<	8;
/** @const {number} */ Control.ValueChanged			= 1 << 12;
/** @const {number} */ Control.EditingDidBegin		= 1 << 16;
/** @const {number} */ Control.EditingChanged		= 1 << 17;
/** @const {number} */ Control.EditingDidEnd		= 1 << 18;
/** @const {number} */ Control.EditingDidEndOnExit 	= 1 << 19;
/** @const {number} */ Control.AllTouchEvents		= 0x00000FFF;
/** @const {number} */ Control.AllEditingEvents		= 0x000F0000;
/** @const {number} */ Control.ApplicationReserved 	= 0x0F000000;
/** @const {number} */ Control.SystemReserved		= 0xF0000000;
/** @const {number} */ Control.AllEvents			= 0xFFFFFFFF;


/**
 * a target action which will typically take the form: 
 * function(e) { self.privateAction(); }
 * @summary Add a target action (function) for the control to call
 * @method addTargetActionForControlEvents
 * @param {number} aControlEvent The control event mask (eg UIControlEventTouchDown)
 * @param {Function} aTargetAction The action to call
 * @return 
 */
Control.prototype.addTargetActionForControlEvents = function(aTarget, anAction, aControlEvent)
{
	var self = this;

	var targets = self.eventTargets;
	var targetId = aTarget.uniqueId();

	if (targets[aControlEvent] && targets[aControlEvent][aTarget] && targets[aControlEvent][aTarget][anAction]) {
		// We already have this exact target action for this control event.
		return;
	}

	if (!targets[aControlEvent]) 						targets[aControlEvent] = {};
	if (!targets[aControlEvent][targetId])				targets[aControlEvent][targetId] = {};
	if (!targets[aControlEvent][targetId][anAction])	targets[aControlEvent][targetId][anAction] = aTarget;
};

/**
 * Remove the target-action for this control event 
 * @method removeTargetActionForControlEvents
 * @param {} aTargetAction
 * @param {number} aControlEvent The control event mask (eg UIControlEventTouchDown)
 * @return 
 */
Control.prototype.removeTargetActionForControlEvents = function(aControlEvent, aTargetAction )
{
	var self = this;
	alert("stub"); // TODO FIXME
};

/**
 * Perform the target-action functions for this control event.
 * @method sendActionsForControlEvents
 * @param {number} controlEvents The control event mask (eg UIControlEventTouchDown)
 * @return 
 */
Control.prototype.sendActionsForControlEvents = function(controlEvents)
{
	var self = this;
	var controlEventMask = controlEvents | 0;
	//targets[aControlEvent][aTarget][anAction] = true;

	var allControlEvents = self.eventTargets;
	for (var anEventKey in allControlEvents) {
		if (allControlEvents.hasOwnProperty(anEventKey)) {
			if ((controlEventMask & parseInt(anEventKey)) != 0) {

				var targets = allControlEvents[anEventKey];
				for (var targetKey in targets) {
					if (targets.hasOwnProperty(targetKey)){

						var aTarget = targets[targetKey];
						for (var actionKey in aTarget) {
							if (aTarget.hasOwnProperty(actionKey)){

								var targetObject = aTarget[actionKey];

								if (typeof(targetObject[actionKey]) === typeof(function(){}) ) {
									var anEvent = new IDEvent(IDControlEventGeneric, controlEventMask);
									targetObject[actionKey](self, anEvent);
								}
							}
						}
					}
				}
			}
		}
	}
};

/**
 *
 *
 */
Control.prototype.didReceiveEvent = function(aControl, anEvent){
	var self = this;
	// For now, do nothing.
};


/**
 * Touch event handler. If the Control wants to respond, it can.
 * @method didReceiveTouch
 * @param {Event} anEvent The touch Event
 * @return Literal
 */
Control.prototype.didReceiveTouch = function(anEvent) {
	var self = this;
	
	if (self.touchesBeganWithEvent) {
		var element = self.element();
		var handleTouchMove = null;
		var handleTouchEnd = null;
		var handleTouchCancel = null;


		if (self.touchesMovedWithEvent) {
			/**
			 * Description
			 * @param {} moveEvent
			 * @return CallExpression
			 */
			handleTouchMove = function(moveEvent) {
				return self.touchesMovedWithEvent(moveEvent);
			};
			element.addEventListener('touchmove', handleTouchMove, false);
		}

		if (self.touchesEndedWithEvent) {
			/**
			 * Description
			 * @param {} endEvent
			 * @return CallExpression
			 */
			handleTouchEnd = function(endEvent) {
				element.removeEventListener('touchmove', handleTouchMove, false);
				element.removeEventListener('touchend', handleTouchEnd, false);
				element.removeEventListener('touchcancel', handleTouchCancel, false);
				window.removeEventListener('mouseup', handleTouchEnd, false);
				return self.touchesEndedWithEvent(endEvent);
			};
			element.addEventListener('touchend', handleTouchEnd, false);
			window.addEventListener('mouseup', handleTouchEnd, false);
		} 

		if (self.touchesCancelledWithEvent) {
			/**
			 * Description
			 * @param {} endEvent
			 * @return CallExpression
			 */
			handleTouchCancel = function(endEvent) {
				element.removeEventListener('touchmove', handleTouchMove, false);
				element.removeEventListener('touchend', handleTouchEnd, false);
				element.removeEventListener('touchcancel', handleTouchCancel, false);
				window.removeEventListener('mouseup', handleTouchEnd, false);
				return self.touchesCancelledWithEvent(endEvent);
			};
			element.addEventListener('touchcancel', handleTouchCancel, false);
		}

		return self.touchesBeganWithEvent(anEvent);
	} else {
		//NSLog(self.superview);
		//if (self.superview) return self.didReceiveTouch.call(self.superview, anEvent);
	}
	return true;
}

module.exports = Control;
