'use strict';

var Representable = Representable || require('./ishmael.js');

var Hydration = function() {
}

Hydration.prototype.decycle = function(object) {
	var objects = {};   // Keep a reference to each unique object or array

	return (function derez(value) {

// The derez recurses through the object, producing the deep copy.

		var i;
		var name;
		var nu;

// typeof null === 'object', so go on if this value is really an object but not
// one of the weird builtin objects.

		var obj = new Object();
		if ((typeof(value) === typeof( obj ))	&& 
				(value !== null)			&&
				!(value instanceof Boolean) &&
				!(value instanceof Date)	&&
				!(value instanceof Number)  &&
				!(value instanceof RegExp)  &&
				!(value instanceof String)) {

// If the value is an object or array, look to see if we have already
// encountered it. If so, return a $ref/path object. This is a hard way,
// linear search that will get slower as the number of unique objects grows.

// Ishmael: All of our cyclical structures descend from Representable, so
// we should be able to call uniqueId() and identity() to 
// reinstantiate the object.

			nu = {};
			if ((typeof(value['uniqueId']) === 'function') &&
				(typeof(value['identity']) === 'function')) {
				var id = value['uniqueId']();
				// println("UniqueID: " + id);
				var className = value['identity']();
				if (typeof (objects[id + '']) !== typeof (undefined)) {
// If we've seen the object before, return a reference.
					return { '$_ish': id };
				} else {
// If we haven't seen this object, keep going.
					nu['_uniqueId'] = id;
					nu['_className'] = className;
					objects[id + ''] = value;
				}
			}

			if (Object.prototype.toString.apply(value) === '[object Array]') {
				// If it is an array, replicate the array.
				nu = [];
				for (i = 0; i < value.length; i += 1) {
					nu[i] = derez(value[i]);
				}
			} else {
				for (name in value) {
					if (value.hasOwnProperty(name)) {
						nu[name] = derez(value[name]);
					}
				}
			}
			return nu;
		}
		return value;
	}(object));
};

Hydration.prototype.retrocycle = function($) {
// Restore an object that was reduced by decycle. Members whose values are
// objects of the form
//	  {$ref: PATH}
// are replaced with references to the value found by the PATH. This will
// restore cycles. The object will be mutated.

// The eval function is used to locate the values described by a PATH. The
// root object is kept in a $ variable. A regular expression is used to
// assure that the PATH is extremely well formed. The regexp contains nested
// * quantifiers. That has been known to have extremely bad performance
// problems on some browsers for very long strings. A PATH is expected to be
// reasonably short. A PATH is allowed to belong to a very restricted subset of
// Goessner's JSONPath.

// So,
//	  var s = '[{"$ref":"$"}]';
//	  return JSON.retrocycle(JSON.parse(s));
// produces an array containing a single element which is the array itself.


	var objects = {};   // Keep a reference to each unique object or array


	// Given an item, attempt to revive it from its class.
	var instantiateItem = function(item){
		if (!item) return null;
		var ownUniqueId = item['_uniqueId'];
		var ownClass = item['_className'];
		if ((typeof(ownUniqueId) === typeof(2) ) &&
			(typeof(ownClass) === typeof('string') )) {

			if (typeof(objects[ownUniqueId + '']) === typeof(undefined)) {
				if ((typeof(window[ownClass]) !== typeof(undefined)) &&
					(typeof(ownClass) !== typeof(undefined))) {
					var newObj = new window[ownClass]();
					for (var key in item) {
						if (item.hasOwnProperty(key)) {
							// Don't attempt to replace instance methods.
							if (typeof(item[key]) !== typeof(function(){})) {
								newObj[key] = item[key];
							}
						}
					}
					objects[ownUniqueId + ''] = newObj;
					return newObj;
				}
			}
		}
		return item;
	};

	// Dereference this item if possible
	var derefItem = function(item){
		var uniqueId = item['$_ish'];
		if ((typeof(uniqueId) === typeof (2)) &&
			(typeof(objects[uniqueId + '']) !== typeof(undefined))) {
			return objects[uniqueId + ''];
		}
		return null;
	};


	var cleaned = instantiateItem($);
	(function identifyItems(value) {
		var i, item, name;
		if (value && typeof value === 'object') {
			if (Object.prototype.toString.apply(value) === '[object Array]') {
				for (i = 0; i < value.length; i += 1) {
					item = value[i];
					if (item && typeof item === 'object') {
						value[i] = instantiateItem(value[i]);
						item = value[i];
						var obj = derefItem(item);
						if (obj !== null) {
							value[i] = obj;
						} else {
							identifyItems(item);
						}
					}
				}
			} else {
				for (name in value) {
					if (typeof value[name] === 'object') {
						value[name] = instantiateItem(value[name]);
						item = value[name];
						if (item) {
							var obj = derefItem(item);
							if (obj !== null) {
								value[name] = obj;
							} else {
								identifyItems(item);
							}	
						}
					}
				}
			}
		}
	}(cleaned));
	return cleaned;
};

Hydration.prototype.stringify = function(aRepresentableObject) {
	var self = this;
	return JSON.stringify(self.decycle(aRepresentableObject));
};

Hydration.prototype.parse = function(aJSONString) {
	var self = this;
	return self.retrocycle(JSON.parse(aJSONString));
};





