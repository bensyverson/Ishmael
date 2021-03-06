'use strict';

var Representable = Representable || require('./ishmael.js');
var View = View || require('./view.js');
var Control = Control || require('./control.js');
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
	View.call(this, templateName, aName, cb);
	self.cachedElement = null;
	self.templateConst = "<p>put name here\nput subviews (unescaped) here</p>";
	if (self) {
		self.touchBegan = false;
	}
	this.registerClass('UIButton');
};

UIButton.prototype = Object.create(View.prototype);
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
	if (element !== self.cachedElement) {
		element.addEventListener('touchstart', function(e){ return self.didReceiveTouch(e);}, true);
		element.addEventListener('mousedown', function(e){  return self.didReceiveTouch(e);}, true);
		self.cachedElement = element;
	}
	View.prototype.activate.apply(this, arguments);
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
	self.sendActionsForControlEvents(Control.TouchDown);

	self.touchBegan = true;

	return true;
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
	self.sendActionsForControlEvents(Control.TouchUpInside);
}

module.exports = UIButton;
