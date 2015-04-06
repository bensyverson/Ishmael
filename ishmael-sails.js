'use strict';

// If we're Sails running on the server, use the global Waterline. 

var _ = require('lodash');

var Waterline = Waterline || null;

// Otherwise, if we're browserified, require waterline explicitly.
var MyWaterline = Waterline || require('waterline');

// The browser will need to use the `waterline-sails` adapter.
var WaterlineSails = WaterlineSails || require('waterline-sails');

// If `sails` is not defined, set it up as a dumb object.
if (typeof sails === typeof(undefined)) {
	window.sails = {};
}

var SailsWrapper = (function(sails) {
	var global = Function('return this')();

	var _sails = sails || global.sails;

	// console.log(_sails);
	return {
		shared: function() {
			return _sails;
		},
		initialize: function(modelDefinitions, useGlobal, cb) {
			var isBrowser = (typeof(window) !== typeof(undefined));

			if (!isBrowser) {
				if (typeof(cb) === typeof(function(){})) {
					cb(null, _sails.models);
				}
				return null;
			}


			var myOrm = new MyWaterline();

			var config = {
			  // Setup Adapters
			  // Creates named adapters that have have been required
			  adapters: {
			    'default': WaterlineSails,
			    'sails': WaterlineSails,
			  },

			  // Build Connections Config
			  // Setup connections using the named adapter configs
			  connections: {
			    myLocalSails: {
			      adapter: 'sails'
			    },
			  },

			  defaults: {
			    migrate: 'alter'
			  }
			};

			var loadModels = (function(dict) {
				for (var key in dict) {
					if (dict.hasOwnProperty(key)) {
						var MyObject = MyWaterline.Collection.extend({
							identity: key,
							connection: 'myLocalSails',
							tableName: key.toLocaleLowerCase(),
							attributes: dict[key].attributes,
							schema: true,
						});
						myOrm.loadCollection(MyObject);
					}
				}
			})(modelDefinitions);

			myOrm.initialize(config, function(err, orm) {
				if (err) return cb(err);

				var models = orm.collections || [];
				_sails.models = {};

				_.each(models,function eachInstantiatedModel(thisModel, modelID) {
					// Bind context for models
					// (this (breaks?)allows usage with tools like `async`)
					_.bindAll(thisModel);

					// Derive information about this model's associations from its schema
					// and attach/expose the metadata as `SomeModel.associations` (an array)
					thisModel.associations = _.reduce(thisModel.attributes, function (associatedWith, attrDef, attrName) {
						if (typeof attrDef === 'object' && (attrDef.model || attrDef.collection)) {
							var assoc = {
								alias: attrName,
								type: attrDef.model ? 'model' : 'collection'
							};
							if (attrDef.model) {
								assoc.model = attrDef.model;
							}
							if (attrDef.collection) {
								assoc.collection = attrDef.collection;
							}
							if (attrDef.via) {
								assoc.via = attrDef.via;
							}

							associatedWith.push(assoc);
						}
						return associatedWith;
					}, []);

					// Set `sails.models.*` reference to instantiated Collection
					// Exposed as `sails.models[modelID]`
					_sails.models[modelID] = thisModel;

					// Create global variable for this model
					// (if enabled in `sails.config.globals`)
					// Exposed as `[globalId]`
					//if (sails.config.globals && sails.config.globals.models) {
					// if (useGlobal) {
					// 	var globalName = _sails.models[modelID].globalId || _sails.models[modelID].identity;
					// 	global[globalName] = thisModel;
					// }
				});
				
				// _sails.models = models.collections;				
				if (typeof(cb) === typeof(function(){})) cb(err, models);
			});
		},

	}
})(sails);

module.exports = SailsWrapper;