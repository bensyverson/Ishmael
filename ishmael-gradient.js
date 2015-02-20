"use strict";
var Representable = Representable || require('./ishmael.js');

var UIColor = UIColor || require('./ishmael-uicolor.js');

var Gradient = function() {
	Representable.call(this);
	this.colors = [];
	this.registerClass('Gradient');
};

Gradient.prototype.push = function(aColor) {
	var self = this;
	self.colors.push(aColor);
};

Gradient.prototype.pop = function() {
	var self = this;
	return self.colors.pop();
};

Gradient.prototype.colorForX = function(x) {
	var self = this;

	var floatIndex = (self.colors.length - 1) * Math.min(Math.max(x, 0.0), 1.0);
	var color1idx = Math.floor(floatIndex)|0;
	var color2idx = Math.ceil(floatIndex)|0;
	var color1 = self.colors[color1idx];
	var color2 = self.colors[color2idx];

	var ratio = floatIndex - color1idx;

	return new UIColor(
			color1.red 	+ (color2.red 	- color1.red) 	* ratio,
			color1.green+ (color2.green - color1.green) * ratio,
			color1.blue + (color2.blue 	- color1.blue) 	* ratio,
			color1.alpha+ (color2.alpha - color1.alpha) * ratio
		);
}

module.exports = Gradient;
