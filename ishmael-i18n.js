// var i18n = i18n || require('i18next');

/**
 * NSLocalizedString: Please note that this must be 
 * called after i18n.init finishes. For that reason,
 * you should launch Ishamel from inside i18n.init.
 */
var NSLocalizedString = function(key) {
	return key;//i18n.t(key);
};



module.exports = {
	NSLocalizedString: NSLocalizedString,
};