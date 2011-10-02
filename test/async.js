var assert = require('assert');
var fs = require('fs');
var JsHtmlParser = require('../lib/JsHtmlParser');
var whitespaceRegex = /\s/g;

var template = ''
+ '<html>\n'
+ '<head>\n'
+ '	<title>Test</title>\n'
+ '</head>\n'
+ '\n'
+ '<body>\n'
+ '\n'
+ '@async{\n'
+ '	setTimeout(function() {\n'
+ '<p>\n'
+ 'abc\n'
+ '</p>\n'
+ '		sync();\n'
+ '	}, 1000);\n'
+ '}\n'
+ '\n'
+ '</body>\n'
+ '</html>\n'
;

var expect = ''
+ '<html>\n'
+ '<head>\n'
+ '	<title>Test</title>\n'
+ '</head>\n'
+ '\n'
+ '<body>\n'
+ '\n'
+ '<p>\n'
+ 'abc\n'
+ '</p>\n'
+ '\n'
+ '</body>\n'
+ '</html>\n'
;

var actual = '';

(function parse() {
	var src = '';
	var parser = new JsHtmlParser(function(data) {
		src += data;
		//console.log(data);
	});
	parser.end(template);

	(function compile() {
		var fn = new Function('write', src);

		(function execute() {
			fn(function(data){
				actual += data;
				//console.log(data);
			});
			
		})();
	
	})();

})();

setTimeout(function(){
	expect = expect.replace(whitespaceRegex, '');
	actual = actual.replace(whitespaceRegex, '');
	assert.equal(actual, expect);
}, 2000);

