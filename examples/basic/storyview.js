'use strict';
var println = function(x){console.log(x);}

var Ishmael = require('../../index.js');
var View = View || Ishmael.View;
var Control = Control || Ishmael.Control;


var StoryView = function(templateName, aName, cb) {
	View.call(this, 'list.html#story', aName, cb);
	
	this.closeButton = null;

	this.registerClass('StoryView');
};

StoryView.prototype = Object.create(View.prototype);
StoryView.prototype.constructor = StoryView;


StoryView.prototype.activate = function(cb) {
	var self = this;

	self.closeButton.addTargetActionForControlEvents(Control.EventTouchUpInside, function(){
		console.log("Close button");
	});

	View.prototype.activate.apply(self, arguments);
};

module.exports = StoryView;
