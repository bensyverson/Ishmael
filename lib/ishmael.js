'use strict';

/**
 * @summary Ishmael.js is a VC layer for isomorphic development in Sails
 * @author <a href="mailto:ben@bensyverson.com">Ben Syverson</a>
 * @version 0.1
 * @copyright © Copyright 2015 Ben Syverson
 * @license The MIT License (MIT)
 * Copyright (c) 2015 Ben Syverson
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


var global = Function('return this')();

if (typeof(require) === typeof(undefined))  global.require = function(){return null;};

var nil = null;

var _uuid = require('./autoincrement.js') || Autoincrementer;
var uuid = uuid || (_uuid ? _uuid.shared : null);


if (typeof sails === typeof(undefined)) {
	global.sails = {};
}

/**
 * Determine if a string has this prefix (case-sensitive)
 * @param {String} prefix The prefix to check
 * @returns {Boolean} True if the prefix matches
 * @examples
 * "JavaScript".hasPrefix("Java") // => true
 * "javascript".hasPrefix("Java") // => false
 */
String.prototype.hasPrefix = function(prefix) {
	return this.indexOf(prefix) === 0;
}

/**
 * Lowercase and trim the string to make it easy to search
 * @returns {String} A search-friendly string
 * @examples
 * "   TÉSTing 	".makeSearchFriendly() // => "tésting"
 */
String.prototype.makeSearchFriendly = function() {
	return this.replace(/^\s+/, '')
				.replace(/\s+$/, '')
				.replace(/\s+/, ' ')
				.toLocaleLowerCase();
};

/**
 * Representable Object. The fundamental object in Ishamel.
 * @class Representable
 * @constructor
 * @method Representable
 * @returns {Representable} A new Representable object
 */
var Representable = function() {
	var _privateClassName = "Representable";
	var _privateUniqueId = uuid().generate();

	/**
	 * Get the unique Id of this object (read only)
	 * @memberOf Representable
	 * @method uniqueId
	 * @returns {String} A unique ID
	 */
	this.uniqueId = function() {
		if (this._uniqueId) {
			_privateUniqueId = this._uniqueId;
			delete this._uniqueId;
		}
		return _privateUniqueId;
	};

	/**
	 * Get the class name of this object (read only)
	 * @method identity
 	 * @memberOf Representable
	 * @returns {String} A class name
	 */
	this.identity = function() {
		if (this._className) {
			_privateClassName = this._className;
			delete this._className;
		}
		return _privateClassName;
	};

	/**
	 * Set the class name for a new Class (call this in the new constructor)
	 * @method registerClass
 	 * @memberOf Representable
	 * @param {String} aClassName The new class name
	 * @examples
	 * var Person = function() {
	 * 	 Representable.call(this);
	 *   this.registerClass('Person');
	 * };
	 * Person.prototype = Object.create(Representable.prototype);
	 * Person.prototype.constructor = Person;
	 * var adrianFrutiger = new Person();
	 *
	 * adrianFrutiger.identity() // => "Person"
	 * adrianFrutiger // instanceof Person
	 * adrianFrutiger // instanceof Representable
	 */
	this.registerClass = function(aClassName) {
		_privateClassName = aClassName;
	};
};


/**
 * The toJSON method prepares a Representable object (including object references) for serialization. Despite the name of this method, it does not return JSON; the name is purely for API compatibility with `JSON.stringify`
 * @memberOf Representable
 * @method toJSON
 * @returns {Object} An `Object` representation of this Representable instance, ready to be serialized with `JSON.stringify`
 * @examples
 * var parent = new Representable();
 * var child = new Representable();
 * child.parent = parent;
 * parent.child = child;
 *
 * JSON.stringify(child) // =~ /\{(("_uniqueId":[^,]+,?)|("_className":[^,]+,?)|("parent":\{("_uniqueId":[^,]+,?)|("_className":[^,]+,?)|("child":\{"\$_ish":[^,]+\})\}))+\}/
 */
Representable.prototype.toJSON = function() {
	var self = this;

	var decycle = function(object) {
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

	return decycle(self);
};



/**
 * The Thaw method de-serializes a Representable object from JSON, including object references
 * @methodOf Representable
 * @method thaw
 * @param {String} aJSONString A JSON string generated by running `JSON.stringify` on a `Representable`
 * @param {Object} globalObject A global context. It will default to `global` or `window`, but for testing or edge cases, we can pass in another object.
 * @param {[String]} requirePaths If we can't find a Class in this context, and `require()` is available, try to require it from the paths specified in requirePaths (eg `assets/js/`)
 * @returns {Representable} The defrosted object
 * @examples
 * var Person = function() {
 * 	 Representable.call(this);
 *   this.registerClass('Person');
 * };
 * Person.prototype = Object.create(Representable.prototype);
 * Person.prototype.constructor = Person;
 *
 * var Rebel = function() {
 * 	 Person.call(this);
 *   this.registerClass('Rebel');
 * };
 * Rebel.prototype = Object.create(Person.prototype);
 * Rebel.prototype.constructor = Rebel;
 *
 * this.Rebel = Rebel; this.Person = Person;
 *
 * var hanSolo = Representable.thaw('{"_uniqueId":5,"_className":"Rebel","name":"Han","hates":{"_uniqueId":6,"_className":"Person","name":"Darth","hates":{"$_ish":5}}}', this);
 *
 * var darth = hanSolo.hates;
 *
 * hanSolo // instanceof Representable
 * hanSolo // instanceof Person
 * hanSolo // instanceof Rebel
 * hanSolo.uniqueId() // => 5
 * hanSolo.identity() // => "Rebel"
 * darth // instanceof Person
 * darth.name // => "Darth"
 * darth.uniqueId() // => 6
 * darth.identity() // => "Person"
 * darth.hates // => instanceof Rebel
 * darth.hates.name // => "Han"
 * darth.hates.uniqueId() // => 5
 * (darth.hates === hanSolo) // => true
 * (hanSolo.hates.hates === hanSolo) // => true
 */
Representable.thaw = function(aJSONString, globalObject, requirePaths) {
	var localGlobal = globalObject || Function('return this')();
	//console.log(aJSONString.substr(0,16));
	var newString = aJSONString + '';
	var retrocycle = function(inputObject) {
		// Restore an object that was reduced by decycle.

		var objects = {};   // Keep a reference to each unique object or array

		// Given an item, attempt to revive it from its class.
		var instantiateItem = function(item){
			if (!item) return null;
			var ownUniqueId = item['_uniqueId'];
			var ownClass = item['_className'];
			if ((typeof(ownUniqueId) === typeof(2) ) 						&&
				(typeof(ownClass) === typeof('string') ) 					&&
				(typeof(objects[ownUniqueId + '']) === typeof(undefined))	&&
				(typeof(ownClass) !== typeof(undefined))) {

				var newObj = null;
				if (typeof(localGlobal[ownClass]) !== typeof(undefined)) {
					newObj = new localGlobal[ownClass]();
				} else if ((typeof(require) === typeof(function(){})) &&
						   (typeof(requirePaths) === typeof([])) ) {
					var reqObj = null;
					var lowerClass = ownClass.toLocaleLowerCase();
					var j = 0;
					for (j = 0; j < requirePaths.length; j++) {
						try {
							reqObj = require(requirePaths[j] + lowerClass + '.js');
						} catch(e){ }
						if (reqObj) break;

						try {
							reqObj = require(requirePaths[j] + ownClass + '.js');
						} catch(e){ }
						if (reqObj) break;

						try {
							reqObj = require('ishmael')[ownClass];
						} catch(e){ }
						if (reqObj) break;
					}
					if (!reqObj) {
						console.log("Couldn't find `" + ownClass + "`");
					} else if (reqObj && (typeof(reqObj) === typeof(function(){}))) {
						newObj = new reqObj();
					}
				}

				if (!newObj) {
					console.log("Couldn't get new Object.");
					return null;
				}
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

		// Instantiate the root object using its class

		var cleaned = instantiateItem(inputObject);

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
		objects = {};
		return cleaned;
	};

	var newObj;
	try {
		newObj = retrocycle(JSON.parse(aJSONString));
	} catch(e){
		console.log(e);
	}
	return newObj;
};



// Ishmael();
module.exports = Representable;
