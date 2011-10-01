var assert = require('assert');
var fs = require('fs');
var jsHtml = require('../main');

const template = ''
+ '\n<html>\n'
+ '<head>\n<title> Test </title>\n</head>\n'
+ '<body>\n'
+ '\t<p>\n'
+ '\tOega boega\n'
+ '\t</p>\n'
+ '</body>\n'
+ '\n</html>\n'
;

(function keepWhitespace(whitespaceMode, expect) {
	console.log(arguments.callee);
	var actual = jsHtml.render(template	, {whitespaceMode: 'keep'});
    var expect = '\n<html>\n<head>\n<title> Test </title>\n</head>\n<body>\n\t<p>\n\tOega boega\n\t</p>\n</body>\n\n</html>\n';
    assert.equal(actual, expect);
})();

(function stripWhitespace(whitespaceMode, expect) {
	console.log(arguments.callee);
	var actual = jsHtml.render(template	, {whitespaceMode: 'strip'});
    var expect = '<html><head><title>Test</title></head><body><p>Oega boega</p></body></html>';
    assert.equal(actual, expect);
})();

(function leadingWhitespace(whitespaceMode, expect) {
	console.log(arguments.callee);
	var actual = jsHtml.render(template	, {whitespaceMode: 'leading'});
    var expect = '<html><head><title> Test</title></head><body><p>\n\tOega boega</p></body></html>';
    assert.equal(actual, expect);
})();

(function trailingWhitespace(whitespaceMode, expect) {
	console.log(arguments.callee);
	var actual = jsHtml.render(template	, {whitespaceMode: 'trailing'});
    var expect = '<html><head><title>Test </title></head><body><p>Oega boega\n\t</p></body></html>';
    assert.equal(actual, expect);
})();


