'use strict';


var UserDefaults = (function () {
	var instance = null;
	return {
		setSharedUserDefaults: function(anObject) {
			instance = anObject;
		},
		sharedUserDefaults: function () {
			if ( instance === null ) {
				instance = new Object();
			}
			return instance;
		}
	};
})();

module.exports = UserDefaults;