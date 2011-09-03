var assert = require('assert');
var fs = require('fs');
var Parser = require('../lib/JsHtmlParser');
var html = require('../lib/html');
var srcDir = __dirname + '/../examples/';
exports.testSet = {};
fs.readdirSync(srcDir).forEach(function(file) {
    var match = /(.+)\.jshtml$/i.exec(file);
    if (!match) return;
    exports.testSet[match[1]] = function() {
        var fnText = '';
        var parser = Parser.create(function(str) {
            fnText += str;
        });
        parser.write(fs.readFileSync(srcDir + match[0], 'utf8'));
        parser.flush();
        //console.log(html.encode(fnText));
        try {
            new Function(fnText);
        }
        catch (e) {
            //console.log(html.encode(fnText));
            throw e;
        }
    };
});