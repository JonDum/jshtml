var assert = require('assert');
var fs = require('fs');
var jsHtml = require('../main');
var srcDir = __dirname + '/../examples/';

fs.readdirSync(srcDir).forEach(function(file) {
    var match = /(.+)\.html$/i.exec(file);
    if (!match) return;
	
	console.log('[' + match[1] + ']');
	var expect = fs.readFileSync(srcDir + match[1] + '.html', 'utf8');
	var actual = jsHtml.render(fs.readFileSync(srcDir + match[1] + '.jshtml', 'utf8'));
	
    assert.equal(actual, expect);
});


