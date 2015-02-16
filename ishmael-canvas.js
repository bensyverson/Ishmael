

var RetinaCanvas = function(aWidth, aHeight) {
	this.canvas = document.createElement('canvas');
	document.body.appendChild(this.canvas);
	// var G_vmlCanvasManager = G_vmlCanvasManager || 0;
	if (typeof(G_vmlCanvasManager) !== 'undefined') { // ie IE
		this.canvas = G_vmlCanvasManager.initElement(this.canvas);
	}
	this.width = aWidth || 256;
	this.height = aHeight || 256;
	this.canvas.style.width = this.width + 'px';
	this.canvas.style.height = this.height + 'px';

	var backingScale = function() {
		if ('devicePixelRatio' in window) {
			if (window.devicePixelRatio > 1) {
				return window.devicePixelRatio;
			}
		}
		return 1;
	};

	this.scaleFactor = backingScale();
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	if (this.scaleFactor > 1) {
		this.canvas.width = this.canvas.width * this.scaleFactor;
		this.canvas.height = this.canvas.height * this.scaleFactor;
	}

	var context = this.canvas.getContext("2d");
	context.scale( this.scaleFactor,this.scaleFactor);

	document.body.removeChild(this.canvas);
};


module.exports = RetinaCanvas;
