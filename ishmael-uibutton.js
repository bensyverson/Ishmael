var Control = require('./ishmael-control');

var UIButton = function(templateName, aName, cb) {
	var self = this;
	Control.call(this, templateName, aName, cb);
	if (self) {
		
	}
};

UIButton.prototype = Object.create(Control.prototype);
UIButton.prototype.constructor = UIButton;

module.exports = UIButton;
