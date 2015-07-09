'use strict';

var DataManager = (function(){
	var _sharedManager = null;

	return {
		setSharedManager: function(aDataManager) {
			_sharedManager = aDataManager;
		},

		sharedManager: function() {
			return _sharedManager;
		},
	}
})();

module.exports = SharedDataManager;