var assert = require('assert');
var fs = require('fs');
var JsHtmlParser = require('../lib/JsHtmlParser');
var html = require('../lib/html');
exports.testSet = {
    'for': function() {
        var fnText = '';
        var parser = new JsHtmlParser(function(str) {
            fnText += str;
        }, {
            whitespaceMode: 'strip'
        });
        parser.write('<html>\n');
        parser.write('<head><title>Test</title></head>\n');
        parser.write('<body>\n');
        parser.write(' <p>\n');
        parser.write('     test \n');
        parser.write('     @for(var i = 1; i <= 3; i++)\n');
        parser.write('     {\n');
        parser.write('     <text>\n');
        parser.write('     @i\n');
        parser.write('     </text>\n');
        parser.write('     }\n');
        parser.write('     !!!\n');
        parser.write(' </p>\n');
        parser.write('</body>\n');
        parser.write('</html>\n');
        parser.flush();
        var fn = new Function('stream', 'html', fnText);
        var actual = '';
        fn({
            write: function(str) {
                actual += str;
            }
        }, html);
        var expect = '<html><head><title>Test</title></head><body><p>test123!!!</p></body></html>';
        assert.equal(actual, expect);
    },
    'debug': function() {
        var fnText = '';
        var parser = new JsHtmlParser(function(str) {
            fnText += str;
        }, {
            debug: true
        });
        parser.write('<html>\n');
        parser.write('<head><title>Test</title></head>\n');
        parser.write('<body>\n');
        parser.write('@(aap)\n');
        parser.write('</body>\n');
        parser.write('</html>\n');
        parser.flush();
        var fn = new Function('stream', 'html', fnText);
        var actual = '';
        fn({
            write: function(str) {
                actual += str;
            }
        }, html);
    },
    'error': function() {
        var fnText = '';
        var parser = new JsHtmlParser(function(str) {
            fnText += str;
        }, {
            debug: true
        });
        parser.write('<html>\n');
        parser.write('<head><title>Test</title></head>\n');
        parser.write('<body>\n');
        parser.write('@(aap)\n');
        parser.write('</body>\n');
        parser.write(')\n');
        parser.write('</html>\n');
        parser.write('@for(){\n');
        parser.flush();
        var fn = new Function('stream', 'html', fnText);
        var actual = '';
        fn({
            write: function(str) {
                actual += str;
            }
        }, html);
    }
};
