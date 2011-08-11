var assert = require('assert');
var fs = require('fs');
var parser = require('../lib/jsHtmlParser');
var html = require('../lib/html');
exports.testSet = {};
fs.readdirSync(__dirname).forEach(function(file) {
    var match = /(.+)\.jshtml$/i.exec(file);
    if (!match) return;
    exports.testSet[match[1]] = function() {
        var body = '';
        var p = parser.create(function(str) {
            body += str;
        });
        p.write(fs.readFileSync(__dirname + '/' + match[0], 'utf8'));
        p.flush();
        try {
            new Function(body);
        }
        catch (e) {
            console.log(html.encode(body));
            throw e;
        }
    };
});