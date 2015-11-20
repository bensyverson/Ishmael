'use strict';
if (typeof(require) === typeof(undefined)) window.require = function(){return null;};
var print = print || function(e) { console.log(e) };

var Ishmael = require('../../index.js');
var StoryView = StoryView || require('./storyview.js');

var View = View || Ishmael.View;

var StoryListView = function(templateName, aName, cb) {
	View.call(this, 'list.html#list', aName, cb);
	this.stories = [
		{
			headline: "Headline!",
			lede: "Lede!",
		},
		{
			headline: "Headline2!",
			lede: "Lede2!",
		},
	];
	this.registerClass('StoryListView');
};


StoryListView.prototype = Object.create(View.prototype);
StoryListView.prototype.constructor = StoryListView;

StoryListView.prototype.createSubviews = function() {
	var self = this;
	
	self.removeAllSubviews();

	for (var i = 0; i < self.stories.length; i++) {
		var aView = new StoryView();
		aView.locals = self.stories[i];
		self.addSubview(aView);
	}
};

module.exports = StoryListView;
