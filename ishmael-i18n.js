// var i18n = i18n || require('i18next');

var global = Function('return this')();
var println = function(msg) { console.log(msg); }
var SailsWrapper = SailsWrapper || require('./ishmael-sails.js');
var localizable = localizable || require('./localizable.js');
var IntlMessageFormat = IntlMessageFormat || require('intl-messageformat')
if (!global.Intl) {
	global.Intl = require('intl');
}

var getLocale = global.getLocale || null;

/**
 * NSLocalizedString: Please note that this must be 
 * called after i18n.init finishes. For that reason,
 * you should launch Ishamel from inside i18n.init.
 * @method NSLocalizedString
 * @param {} key
 * @return key
 */
var NSLocalizedString = function(key, values) {
	if (getLocale == null) {
		getLocale = SailsWrapper.shared().getLocale;
	}
	var loc = getLocale();

	if (localizable && localizable[loc] && localizable[loc][key]) {
		var msg = new IntlMessageFormat(localizable[loc][key], loc);
		if (msg && msg.format && (typeof(msg.format) === typeof(function(){}))) {
			return msg.format(values);
		}
	}
	return key;
};



module.exports = {
	NSLocalizedString: NSLocalizedString,
};