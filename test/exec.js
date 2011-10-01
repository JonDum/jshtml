var assert = require('assert');
var fs = require('fs');
var JsHtmlParser = require('../lib/JsHtmlParser');
var util = require('../lib/util');

exports.testSet = {
    'implicitGroup': function() {
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

	    var expect = '<html><head><title>Test</title></head><body><p>test123!!!</p></body></html>';
        var actual = '';
		try {
	        var fn = new Function(fnText);
		    fn({
		        write: function(str) {
		            actual += str;
		        }
				, htmlEncode: util.htmlEncode
		    });
		    assert.equal(actual, expect);
		}
		catch (e) {
			console.log(fnText);
		    throw e;
        }
    },
    'implicitBlock': function() {
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

        var expect = '<html><head><title>Test</title></head><body><p>test!!!</p></body></html>';
	    var actual = '';
        try	{
		    var fn = new Function(fnText);
		    fn({
		        write: function(str) {
		            actual += str;
		        }
				, htmlEncode: util.htmlEncode
		    });
		    assert.equal(actual, expect);
		}
		catch (e) {
			console.log(fnText);
		    throw e;
        }
    },
    'explicitGroup': function() {
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
        parser.write('     @(i)\n');
        parser.write('     </text>\n');
        parser.write('     }\n');
        parser.write('     !!!\n');
        parser.write(' </p>\n');
        parser.write('</body>\n');
        parser.write('</html>\n');
        parser.end();

	    var expect = '<html><head><title>Test</title></head><body><p>test123!!!</p></body></html>';
        var actual = '';
		try {
	        var fn = new Function(fnText);
		    fn({
		        write: function(str) {
		            actual += str;
		        }
				, htmlEncode: util.htmlEncode
		    });
		    assert.equal(actual, expect);
		}
		catch (e) {
			console.log(fnText);
		    throw e;
        }
    },
    
    'explicitBlock': function() {
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
        parser.write('     @{i;}\n');
        parser.write('     </text>\n');
        parser.write('     }\n');
        parser.write('     !!!\n');
        parser.write(' </p>\n');
        parser.write('</body>\n');
        parser.write('</html>\n');
        parser.end();

	    var expect = '<html><head><title>Test</title></head><body><p>test!!!</p></body></html>';
        var actual = '';
		try {
	        var fn = new Function(fnText);
		    fn({
		        write: function(str) {
		            actual += str;
		        }
				, htmlEncode: util.htmlEncode
		    });
		    assert.equal(actual, expect);
		}
		catch (e) {
			console.log(fnText);
		    throw e;
        }
    }
    
};

exports.testSet['implicitGroup']();



