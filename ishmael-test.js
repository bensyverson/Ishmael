
var View = require('./ishmael-view.js');
var println = println || function(x){console.log(x);}

var printSubviews = function(aView, anIndent) {
	println("\n" + anIndent + "• " + aView.identity() + ": '" + aView.name + "' (" + aView.uniqueId() + ")");
	println(anIndent + aView.templateConst);

	for (var i=0 ; i < aView.subviews.length; i++) {
		printSubviews(aView.subviews[i], anIndent + '    ');
	}
};

var newView = new View('../../templates/radar-blip.html');

newView.renderHTML(function(err, html){
	printSubviews(newView, '');


	println("===================== FINAL CALLBACK.");
	println(newView.templateConst);

	println("----------------\n\n");
	println(html);
	println("\n\n----------");

	println("Subview: ");
	// println(newView.subview('rightIcon'));
});

