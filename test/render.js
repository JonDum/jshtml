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
        parser.write(fs.readFileSync(srcDir + match[0], 'utf8'));
        parser.flush();
        var fn = new Function('stream', 'html', 'locals', 'with(locals) {\n ' + fnText + '}\n');
        var content = '';
        fn({
            write: function(str) {
                content += str;
            }
        }, html, {
            title:'Test',
            stoer: true,
            lief: true,
            youlikeit:true,
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
