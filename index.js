'use strict';

var App = App || 										require('./lib/app.js');
var Control = Control || 								require('./lib/control.js');
var Representable = Representable || 					require('./lib/ishmael.js');
var locales = locales || 								require('./lib/i18n.js');
var IDEvent = IDEvent || 								require('./lib/idevent.js');
var UIButton = UIButton || 								require('./lib/uibutton.js');
var UIColor = UIColor || 								require('./lib/uicolor.js');
var UserDefaults = UserDefaults || 						require('./lib/userdefaults.js');
var View = View ||										require('./lib/view.js');
var ViewController = ViewController ||					require('./lib/viewcontroller.js');

module.exports = {
	App: App,
	Control: Control,
	Representable: Representable,
	locales: locales,
	IDEvent: IDEvent,
	UIButton: UIButton,
	UIColor: UIColor,
	UserDefaults: UserDefaults,
	View: View,
	ViewController: ViewController,
};
