"use strict";

if (typeof(module) === typeof(undefined)) window.module = {};
if (typeof(require) === typeof(undefined)) window.require = function(){return null;};
var println = println || function(e) { console.log(e) };

var OrgStuffHereModel = function(def) {
	this.identity = def['identity'];
	this.connection = def['connection'];
	this.attributes = def['attributes'];
	this.schema = def['schema'];
};

OrgStuffHereModel.prototype.findOne = function(criteria) {
	var self = this;
	return self;
};

OrgStuffHereModel.prototype.exec = function(cb) {
	var self = this;
	if (typeof(cb) === typeof(function(){})) cb(null, {});
};


var OrgStuffHereWaterline = function() {
	this.models = {};
};

OrgStuffHereWaterline.prototype.loadCollection = function(aModel) {
	var self = this;

	this.models[aModel.identity.toLocaleLowerCase()] = aModel;
};

OrgStuffHereWaterline.prototype.initialize = function(config, cb) {
	var self = this;
	println(self.models);

	if (typeof(cb) === typeof(function(){})) cb(null, {collections: self.models});
};

OrgStuffHereWaterline.Collection = {};

OrgStuffHereWaterline.Collection.extend = function(def) {
	var aModel = new OrgStuffHereModel(def);
	return aModel; // haha
};


if (typeof(Waterline) === typeof(undefined)) window.Waterline = OrgStuffHereWaterline;
