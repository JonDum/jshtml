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
        var fn = new Function('stream', 'html', 'locals', 'with(locals) {\n ' + body + '}\n');
        var content = '';
        fn({
            write: function(str) {
                content += str;
            }
        }, html, {
            stoer: true,
            lief: true,
            taskList: [{
                id: 1,
                name: 'build a house'
            }, {
                id: 2,
                name: 'run a marathon'
            }, {
                id: 3,
                name: 'grow a beard'
            }],
            productList: [{
                id: 1,
                name: 'Blend',
                price: 9.5
            }, {
                id: 1,
                name: 'I LOVE FAKE',
                price: 12.5
            }, {
                id: 1,
                name: 'Gup',
                price: 19.5
            }]
        });
        //console.log(html.encode(content));
    };
});