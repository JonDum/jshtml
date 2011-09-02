var assert = require('assert');
var fs = require('fs');
var Parser = require('../lib/JsHtmlParser');
var html = require('../lib/html');
exports.testSet = {};
fs.readdirSync(__dirname + '/../examples/').forEach(function(file) {
    var match = /(.+)\.jshtml$/i.exec(file);
    if (!match) return;
    exports.testSet[match[1]] = function() {
        var fnText = '';
        var parser = Parser.create(function(str) {
            fnText += str;
        });
        parser.write(fs.readFileSync(__dirname + '/' + match[0], 'utf8'));
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