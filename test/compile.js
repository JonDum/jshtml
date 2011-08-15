var assert = require('assert');
var fs = require('fs');
var parser = require('../lib/jsHtmlParser');
var html = require('../lib/html');
exports.testSet = {};
fs.readdirSync(__dirname).forEach(function(file) {
    var match = /(.+)\.jshtml$/i.exec(file);
    if (!match) return;
    exports.testSet[match[1]] = function() {
        var fnText = '';
        var p = parser.create(function(str) {
            fnText += str;
        });
        p.write(fs.readFileSync(__dirname + '/' + match[0], 'utf8'));
        p.flush();
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