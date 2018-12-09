'use strict';

var App = App || 										require('./lib/app.js');
var Control = Control || 								require('./lib/control.js');
var Common = Common || 									require('./lib/common.js');
var Representable = Representable || 					require('./lib/ishmael.js');
var IDEvent = IDEvent || 								require('./lib/idevent.js');
var UIButton = UIButton || 								require('./lib/uibutton.js');
var UIColor = UIColor || 								require('./lib/uicolor.js');
var UserDefaults = UserDefaults || 						require('./lib/userdefaults.js');
var View = View ||										require('./lib/view.js');
var ViewController = ViewController ||					require('./lib/viewcontroller.js');

module.exports = {
	App: App,
	Control: Control,
	Common: Common,
	Representable: Representable,
	IDEvent: IDEvent,
	UIButton: UIButton,
	UIColor: UIColor,
	UserDefaults: UserDefaults,
	View: View,
	ViewController: ViewController,
};
