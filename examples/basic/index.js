'use strict';
if (typeof(require) === typeof(undefined)) window.require = function(){return null;};

var BasicApp = require('./basicapp.js');
var PutStuffHere = require('putstuffhere');
var fs = require('fs');
var path = require('path');

if (PutStuffHere.shared()) {
	PutStuffHere.shared().setTemplateRoot(__dirname);
}

var appInstance = new BasicApp();

appInstance.rootViewController().loadView(function(){
	appInstance.rootViewController().viewDidLoad();
	appInstance.packAndShipFromPath('/', function(err, html){
		if (err) {
			console.log("ERROR: " + err);
			return;
		}

		var data = fs.readFileSync(path.resolve(__dirname, 'template.html'));
		var template = data.toString('utf8');

		template = template.replace(/put html here/, html);
		console.log(template);
	});
});
