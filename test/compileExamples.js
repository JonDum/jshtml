var assert = require('assert');
var fs = require('fs');
var jsHtml = require('../main');
var srcDir = __dirname + '/../examples/';

fs.readdirSync(srcDir).forEach(function(file) {
    var match = /(.+)\.jshtml$/i.exec(file);
    if (!match) return;
	
	console.log('[' + match[1] + ']');
	jsHtml.compile(fs.readFileSync(srcDir + match[0], 'utf8'));
});
