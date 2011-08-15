var assert = require('assert');
var fs = require('fs');
var parser = require('../lib/jsHtmlParser');
var html = require('../lib/html');
exports.testSet = {
    'for': function() {
        var body = '';
        var p = parser.create(function(str) {
            body += str;
        }, {
            whitespaceMode: 'strip'
        });
        p.write('<html>\n');
        p.write('<head><title>Test</title></head>\n');
        p.write('<body>\n');
        p.write(' <p>\n');
        p.write('     test \n');
        p.write('     @for(var i = 1; i <= 3; i++)\n');
        p.write('     {\n');
        p.write('     <text>\n');
        p.write('     @i\n');
        p.write('     </text>\n');
        p.write('     }\n');
        p.write('     !!!\n');
        p.write(' </p>\n');
        p.write('</body>\n');
        p.write('</html>\n');
        p.flush();
        var fn = new Function('stream', 'html', body);
        var actual = '';
        fn({
            write: function(str) {
                actual += str;
            }
        }, html);
        var expect = '<html><head><title>Test</title></head><body><p>test123!!!</p></body></html>';
        assert.equal(actual, expect);
    }
};