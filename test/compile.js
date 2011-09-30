var assert = require('assert');
var fs = require('fs');
var JsHtmlParser = require('../lib/JsHtmlParser');
var html = require('../lib/html');
var srcDir = __dirname + '/../examples/';
exports.testSet = {};
fs.readdirSync(srcDir).forEach(function(file) {
    var match = /(.+)\.jshtml$/i.exec(file);
    if (!match) return;
    exports.testSet[match[1]] = function() {
        var fnText = '';
        var parser = new JsHtmlParser(function(str) {
            fnText += str;
        });
        parser.end(fs.readFileSync(srcDir + match[0], 'utf8'));
        try {
            new Function(fnText);
        }
        catch (e) {
	        console.log(fnText);
            throw e;
        }
    };
});
