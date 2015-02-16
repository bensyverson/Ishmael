

/** 
 * Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
 */

if (typeof(Object.create) !== typeof(function(){})) {
	Object.create = (function() {
		var Temp = function() {};
		return function (prototype) {
			if (arguments.length > 1) {
				throw Error('Second argument not supported');
			}
			if (typeof(prototype) != typeof ({})) {
				throw TypeError('Argument must be an object');
			}
			Temp.prototype = prototype;
			var result = new Temp();
			Temp.prototype = null;
			return result;
		};
	})();
}

/**
 *  Event handling.
 * Modified based on:
 *  https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener#Older_way_to_register_event_listeners
 */
(function() {
	if (!Event.prototype.preventDefault) {
		Event.prototype.preventDefault=function() {
			this.returnValue=false;
		};
	}
	if (!Event.prototype.stopPropagation) {
		Event.prototype.stopPropagation=function() {
			this.cancelBubble=true;
		};
	}
	if (!Element.prototype.addEventListener) {
		var eventListeners=[];
		
		var addEventListener=function(type,listener, useCapture) {
			var self=this;
			var wrapper=function(e) {
				e.target=e.srcElement;
				e.currentTarget=self;
				if (listener.handleEvent) {
					listener.handleEvent(e);
				} else {
					listener.call(self,e);
				}
			};
			if (type == 'DOMContentLoaded') {
				var wrapper2 = function(e) {
					if (document.readyState == 'complete') {
						wrapper(e);
					}
				};
				document.attachEvent('onreadystatechange',wrapper2);
				eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});
				
				if (document.readyState == 'complete') {
					var e=new Event();
					e.srcElement=window;
					wrapper2(e);
				}
			} else {
				this.attachEvent('on' + type, wrapper);
				eventListeners.push({object:this,type:type, listener:listener, wrapper:wrapper});
			}
		};
		var removeEventListener = function(type, listener, useCapture) {
			var counter=0;
			while (counter<eventListeners.length) {
				var eventListener = eventListeners[counter];
				if ((eventListener.object == this) && 
					(eventListener.type == type) && 
					(eventListener.listener == listener)) {
					if (type == 'DOMContentLoaded') {
						this.detachEvent('onreadystatechange',eventListener.wrapper);
					} else {
						this.detachEvent('on' + type, eventListener.wrapper);
					}
					break;
				}
				++counter;
			}
		};
		Element.prototype['addEventListener'] = addEventListener;
		Element.prototype['removeEventListener'] = removeEventListener;
		if (HTMLDocument) {
			HTMLDocument.prototype['addEventListener'] = addEventListener;
			HTMLDocument.prototype['removeEventListener'] = removeEventListener;
		}
		if (Window) {
			Window.prototype['addEventListener'] = addEventListener;
			Window.prototype['removeEventListener'] = removeEventListener;
		}
	}
})();

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}