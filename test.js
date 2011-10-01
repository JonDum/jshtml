var assert = require('assert');
var fs = require('fs');
var srcDir = __dirname + '/test/';

fs.readdirSync(srcDir).forEach(function(file) {
	var match = /(.+)\.js$/i.exec(file);
	if (!match) return;

	console.log(match[1]);
	require(srcDir + match[1]);
	console.log();
});


