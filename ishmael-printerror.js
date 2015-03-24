'use strict';
var printError = function(x) { console.log('\x1b[31mERROR: %s\x1b[0m', x);};
module.exports = printError;