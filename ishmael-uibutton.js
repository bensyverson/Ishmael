var Control = Control || require('./ishmael-control.js');

var UIButton = function(templateName, aName, cb) {
	var self = this;
	Control.call(this, templateName, aName, cb);
	self.templateConst = "<p>put name here\nput subviews (unescaped) here</p>"
	if (self) {
		self.touchBegan = false;
	}
};

UIButton.prototype = Object.create(Control.prototype);
UIButton.prototype.constructor = UIButton;

/**
 * Activate the view in the DOM.
 */
UIButton.prototype.activate = function() {
	var self = this;
	
	// Activate myself
	var element = self.element();

	element.addEventListener('touchstart', function(e){ return self.didReceiveTouch(e);}, false);
	element.addEventListener('mousedown', function(e){ return self.didReceiveTouch(e);}, false);

	View.prototype.activate.call(this);
};

/**
 * Handle a touch down
 */
UIButton.prototype.handleTouchDown = function() {
	var self = this;
};


UIButton.prototype.touchesBeganWithEvent = function(anEvent)
{
	var self = this;
	self.sendActionsForControlEvents(Control.EventTouchDown);
	self.touchBegan = true;
};

UIButton.prototype.touchesEndedWithEvent = function(anEvent)
{
	var self = this;
	self.touchBegan = false;
	self.sendActionsForControlEvents(Control.EventTouchUpInside);
}

module.exports = UIButton;
