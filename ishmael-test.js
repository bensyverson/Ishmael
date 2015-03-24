
var View = require('./ishmael-view.js');
var println = println || function(x){console.log(x);}
var BlipView = require('./radarblipview.js');

var printSubviews = function(aView, anIndent) {
	println("\n" + anIndent + "• " + aView.identity() + ": '" + aView.name + "' (" + aView.uniqueId() + ")");
	println(anIndent + aView.templateConst);

	for (var i=0 ; i < aView.subviews.length; i++) {
		printSubviews(aView.subviews[i], anIndent + '    ');
	}
};

var newView = new BlipView('../../templates/radar-blip.html', 'BlipView');

newView.renderHTML(function(err, html){
//	printSubviews(newView, '');

	println("===================== FINAL CALLBACK.");
	println(newView.templateConst);

	println("----------------\n\n");
	println(html);
	println("\n\n----------");

	// println(newView.constructor.toString());
	println(newView);
});

