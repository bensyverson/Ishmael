'use strict';

// If we're Sails running on the server, use the global Waterline. 
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
	var _sails = sails;
	return {
		shared: function() {
			return _sails;
		},
		initialize: function(modelDefinitions, cb) {
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
							attributes: dict[key].attributes,
							schema: true,
						});
						myOrm.loadCollection(MyObject);
					}
				}
			})(modelDefinitions);

			myOrm.initialize(config, function(err, models) {
//				if(err) throw err;
				println("ERR:? " + err);
				
				_sails.models = models.collections;
				
				if (typeof(cb) === typeof(function(){})) cb(err, models);
			});
		},

	}
})(sails);

module.exports = SailsWrapper;