'use strict';

var LayoutCache = (function () {
	var instance = new Object();
	return {
		sharedCache: function () {
			return instance;
		}
	};
})();

module.exports = LayoutCache;