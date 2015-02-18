"use strict";

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

// flask stubb starbuck harpoon 


if (typeof(require) === typeof(undefined)) window.require = function(){return null;};

var println = println || function(e) { console.log(e) };
var nil = null;

var _uuid = require('./autoincrement.js') || Autoincrementer;
var uuid = uuid || (_uuid ? _uuid.shared : null);

/**
 * Put Stuff Here doesn't know about Ishmael.
 * We'll insert `subviews (unescaped)` so Views can insert subviews.
 */
// psh().setDefaultHTML("<div>put subviews (unescaped) here</div>");


if (typeof sails === typeof(undefined)) {
	window.sails = {};
}

String.prototype.hasPrefix = function(prefix) {
    return this.indexOf(prefix) === 0;
}

/**
 * 
 */
String.prototype.makeSearchFriendly = function() {
	return this.replace(/^\s+/, '')
				.replace(/\s+$/, '')
				.replace(/\s+/, ' ')
				.toLocaleLowerCase();
};


/**
 * Representable Object. A fundamental in Ishamel.
 * @constructor
 */
var Representable = function() {
	var _uniqueId = uuid().generate();
	// representableObjects[_uniqueId] = this;
	this.uniqueId = function() {
		return _uniqueId;
	};
};


/*
    cycle.js
    2013-02-19
    Public Domain.
    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html
    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true, regexp: true */

/*members $ref, apply, call, decycle, hasOwnProperty, length, prototype, push,
    retrocycle, stringify, test, toString
*/

if (typeof JSON.decycle !== 'function') {
    JSON.decycle = function decycle(object) {
        'use strict';

// Make a deep copy of an object or array, assuring that there is at most
// one instance of each object or array in the resulting structure. The
// duplicate references (which might be forming cycles) are replaced with
// an object of the form
//      {$ref: PATH}
// where the PATH is a JSONPath string that locates the first occurance.
// So,
//      var a = [];
//      a[0] = a;
//      return JSON.stringify(JSON.decycle(a));
// produces the string '[{"$ref":"$"}]'.

// JSONPath is used to locate the unique object. $ indicates the top level of
// the object or array. [NUMBER] or [STRING] indicates a child member or
// property.

        var objects = {};   // Keep a reference to each unique object or array

        return (function derez(value) {

// The derez recurses through the object, producing the deep copy.

            var i,          // The loop counter
                name,       // Property name
                nu;         // The new object or array

// typeof null === 'object', so go on if this value is really an object but not
// one of the weird builtin objects.

            if (typeof value === 'object' && value !== null &&
                    !(value instanceof Boolean) &&
                    !(value instanceof Date)    &&
                    !(value instanceof Number)  &&
                    !(value instanceof RegExp)  &&
                    !(value instanceof String)) {

// If the value is an object or array, look to see if we have already
// encountered it. If so, return a $ref/path object. This is a hard way,
// linear search that will get slower as the number of unique objects grows.

// Ishmael: All of our cyclical structures descend from Representable, so
// we should be able to call uniqueId to aid in reconstructing the object
// graph.

				if (typeof(value.uniqueId) === typeof (function() {} )) {
					var id = value.uniqueId();
					if (typeof (objects[id]) !== typeof (undefined)) {
						return { '$_id': id };
					} else {
// If we haven't seen this object, keep going.
						value._uniqueId = id;
						objects[id] = value;
					}
				}
// If it is an array, replicate the array.

                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    nu = [];
                    for (i = 0; i < value.length; i += 1) {
                        nu[i] = derez(value[i]);
                    }
                } else {

// If it is an object, replicate the object.

                    nu = {};
                    for (name in value) {
                        if (Object.prototype.hasOwnProperty.call(value, name)) {
                            nu[name] = derez(value[name]);
                        }
                    }
                }
                return nu;
            }
            return value;
        }(object));
    };
}


if (typeof JSON.retrocycle !== 'function') {
    JSON.retrocycle = function retrocycle($) {
        'use strict';

// Restore an object that was reduced by decycle. Members whose values are
// objects of the form
//      {$ref: PATH}
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
//      var s = '[{"$ref":"$"}]';
//      return JSON.retrocycle(JSON.parse(s));
// produces an array containing a single element which is the array itself.


        var objects = {};   // Keep a reference to each unique object or array

        (function rez(value) {

// The rez function walks recursively through the object looking for $ref
// properties. When it finds one that has a value that is a path, then it
// replaces the $ref object with a reference to the value that is found by
// the path.

            var i, item, name, path;

            if (value && typeof value === 'object') {
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    for (i = 0; i < value.length; i += 1) {
                        item = value[i];
                        if (item && typeof item === 'object') {
                            var uniqueId = item['$_id'];
                            var ownUniqueId = item['_uniqueId'];
                            if (typeof(ownUniqueId) === typeof(2) ) {
                            	objects[ownUniqueId + ''] = item;
                            }
                            if ( (typeof(uniqueId) === typeof (2)) &&
                            	(typeof(objects[uniqueId + '']) !== typeof(undefined) ) ) {
                                value[i] = objects[uniqueId + ''];
                            } else {
                                rez(item);
                            }
                        }
                    }
                } else {
                    for (name in value) {
                        if (typeof value[name] === 'object') {
                            item = value[name];
                            if (item) {
                                var uniqueId = item['$_id'];
                                var ownUniqueId = item['_uniqueId'];
	                            if (typeof(ownUniqueId) === typeof(2) ) {
	                            	objects[ownUniqueId + ''] = item;
	                            }

	                            if ((typeof(uniqueId) === typeof (2)) &&
	                            	(typeof(objects[uniqueId + '']) !== typeof(undefined))) {
	                                value[name] = objects[uniqueId + ''];
                                } else {
                                    rez(item);
                                }
                            }
                        }
                    }
                }
            }
        }($));
        return $;
    };
}


// Ishmael();
module.exports = Representable;
