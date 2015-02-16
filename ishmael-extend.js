var Extend = function(parent, child) {
	child.prototype = Object.create(parent.prototype);
	child.prototype.constructor = child;
};

module.exports = Extend;