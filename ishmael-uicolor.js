
/**
 * UIColor
 * @param {number} red The Red value
 * @param {number} green The Green value
 * @param {number} blue The Blue value
 * @param {number} alpha The Alpha value
 * @constructor
 */
var UIColor = function(red, green, blue, alpha)
{
	var self = this;
	self.red =		red ? red : 0;
	self.green =	green ? green : 0;
	self.blue =		blue ? blue : 0;
	self.alpha =	alpha ? alpha : 0;
};

UIColor.prototype.hexString = function() {
	var self = this;

	var aRed =		Math.min(Math.max(Math.round(self.red *		255.0), 0), 255);
	var aGreen =	Math.min(Math.max(Math.round(self.green *	255.0), 0), 255);
	var aBlue =		Math.min(Math.max(Math.round(self.blue *	255.0), 0), 255);
	//var anAlpha =	Math.min(Math.max(Math.round(self.alpha *	255.0), 0), 255);

	var string = '#';
	string += ((aRed	< 16) ? '0' : '')  + aRed.toString(16) ;
	string += ((aGreen	< 16) ? '0' : '')  + aGreen.toString(16) ;
	string += ((aBlue	< 16) ? '0' : '')  + aBlue.toString(16) ;
	return string;
};


UIColor.prototype.rgbString = function() {
	var self = this;
	return "rgb(" + ((self.red * 255.0)|0) + "," + ((self.green * 255.0)|0)+ "," + ((self.blue * 255.0)|0) + ")";
};

UIColor.prototype.rgbaString = function() {
	var self = this;
	return "rgba(" + ((self.red * 255.0)|0) + "," + ((self.green * 255.0)|0)+ "," + ((self.blue * 255.0)|0) + "," + self.alpha.toFixed(3)  + ")";
};

module.exports = UIColor;

