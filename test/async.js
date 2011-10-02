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
+ 'A\n'
+ '</p>\n'
+ '		sync();\n'
+ '	}, 1000);\n'
+ '}\n'
+ '\n'
+ '@async{\n'
+ '	setTimeout(function() {\n'
+ '<p>\n'
+ 'B\n'
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
+ 'A\n'
+ '</p>\n'
+ '\n'
+ '<p>\n'
+ 'B\n'
+ '</p>\n'
+ '\n'
+ '</body>\n'
+ '</html>\n'
;

var actual = '';
function write(){
	var argumentCount = arguments.length;
	for(var argumentIndex = 0; argumentIndex < argumentCount; argumentIndex++){
		var argument = arguments[argumentIndex];
		actual += argument;
	}
}
function end(){
	write.apply(this, arguments);
	
	assert.equal(actual, expect);
}

(function parse() {
	console.log(arguments.callee);

	var src = '';
	var parser = new JsHtmlParser(function(data) {
		src += data;
		//console.log(data);
	});
	parser.end(template);

	(function compile() {
		console.log(arguments.callee);

		var fn = new Function('write', 'end', src);

		(function execute() {
			console.log(arguments.callee);

			fn(write, end);

		})();//execute
	
	})();//compile

})();//parse



