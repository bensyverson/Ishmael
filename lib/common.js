'use strict';

/**
    Creates a new CGPoint.
    @constructor 
*/ 
function CGPoint(inX, inY) {
	this.x = (inX === undefined) ? 0.0 : inX;
	this.y = (inY === undefined) ? 0.0 : inY;
};

/**
    Creates a new CGSize.
    @constructor 
*/ 
function CGSize(aWidth, aHeight) {
	this.width = (aWidth === undefined) ? 0.0 : aWidth;
	this.height = (aHeight === undefined) ? 0.0 : aHeight;
};

/**
    Creates a new CGRect.
    @constructor 
*/ 
function CGRect(xOff, yOff, aWidth, aHeight) {
	this.origin = new CGPoint(xOff, yOff);
	this.size = new CGSize(aWidth, aHeight);
};


function findPos(obj) {
	var curleft = 0;
	var curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return new CGPoint(curleft, curtop);
}

module.exports = {
	CGRect: CGRect,
	CGSize: CGSize,
	CGPoint: CGPoint,
	findPos: findPos,
};
