var assert = require('assert');
var fs = require('fs');
var parser = require('../lib/jsHtmlParser');
var html = require('../lib/html');

function buildTest(whitespaceMode, expect) {
    exports.testSet[whitespaceMode] = function() {
        var fnText = '';
        var p = parser.create(function(str) {
            fnText += str;
        }, {
            whitespaceMode: whitespaceMode
        });
        p.write('\n<html>\n');
        p.write('<head>\n<title> Test </title>\n</head>\n');
        p.write('<body>\n');
        p.write('\t<p>\n');
        p.write('\tOega boega\n');
        p.write('\t</p>\n');
        p.write('</body>\n');
        p.write('\n</html>\n');
        p.flush();
        var fn = new Function('stream', 'html', fnText);
        var actual = '';
        fn({
            write: function(str) {
                actual += str;
            }
        }, html);
        assert.equal(actual, expect);
    };
}
exports.testSet = {};
buildTest('keep', '\n<html>\n<head>\n<title> Test </title>\n</head>\n<body>\n\t<p>\n\tOega boega\n\t</p>\n</body>\n\n</html>\n');
buildTest('strip', '<html><head><title>Test</title></head><body><p>Oega boega</p></body></html>');
buildTest('leading', '<html><head><title> Test</title></head><body><p>\n\tOega boega</p></body></html>');
buildTest('trailing', '<html><head><title>Test </title></head><body><p>Oega boega\n\t</p></body></html>');

