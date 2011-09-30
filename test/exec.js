var assert = require('assert');
var fs = require('fs');
var JsHtmlParser = require('../lib/JsHtmlParser');
var util = require('../lib/util');
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
        parser.end();

        var fn = new Function(fnText);
        var actual = '';
        fn({
            write: function(str) {
                actual += str;
            }
			, htmlEncode: util.htmlEncode
        });
        var expect = '<html><head><title>Test</title></head><body><p>test123!!!</p></body></html>';
        assert.equal(actual, expect);
    },
    'for2': function() {
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
        parser.write('     @i;\n');
        parser.write('     </text>\n');
        parser.write('     }\n');
        parser.write('     !!!\n');
        parser.write(' </p>\n');
        parser.write('</body>\n');
        parser.write('</html>\n');
        parser.end();

        var fn = new Function(fnText);
        var actual = '';
        fn({
            write: function(str) {
                actual += str;
            }
			, htmlEncode: util.htmlEncode
        });
        var expect = '<html><head><title>Test</title></head><body><p>test!!!</p></body></html>';
        assert.equal(actual, expect);
    },
    'aap': function() {
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
        parser.end();
        var fn = new Function(fnText);
        var actual = '';
        fn({
            write: function(str) {
                actual += str;
            }
            , htmlEncode: util.htmlEncode
            , aap: 123
        });
    }
};
