"use strict";

var Representable = Representable || require('./ishmael.js');
var Control = Control || require('./ishmael-control.js');
var View = View || require('./ishmael-view.js');
/**
 * Description
 * @method UIButton
 * @param {} templateName
 * @param {} aName
 * @param {} cb
 * @return 
 */
var UIButton = function(templateName, aName, cb) {
	var self = this;
	Control.call(this, templateName, aName, cb);
	self.templateConst = "<p>put name here\nput subviews (unescaped) here</p>";
	if (self) {
		self.touchBegan = false;
	}
	this.registerClass('UIButton');
};

UIButton.prototype = Object.create(Control.prototype);
UIButton.prototype.constructor = UIButton;

/**
 * Activate the view in the DOM.
 * @method activate
 * @return 
 */
UIButton.prototype.activate = function() {
	var self = this;
	
	// Activate myself
	var element = self.element();
	element.addEventListener('touchstart', function(e){ return self.didReceiveTouch(e);}, true);
	element.addEventListener('mousedown', function(e){  return self.didReceiveTouch(e);}, true);

	View.prototype.activate.call(this);
};

/**
 * Handle a touch down
 * @method handleTouchDown
 * @return 
 */
UIButton.prototype.handleTouchDown = function() {
	var self = this;
};


/**
 * Description
 * @method touchesBeganWithEvent
 * @param {} anEvent
 * @return 
 */
UIButton.prototype.touchesBeganWithEvent = function(anEvent)
{
	var self = this;
	self.sendActionsForControlEvents(Control.EventTouchDown);

	self.touchBegan = true;
};

/**
 * Description
 * @method touchesEndedWithEvent
 * @param {} anEvent
 * @return 
 */
UIButton.prototype.touchesEndedWithEvent = function(anEvent)
{
	var self = this;
	self.touchBegan = false;
	self.sendActionsForControlEvents(Control.EventTouchUpInside);
}

module.exports = UIButton;
