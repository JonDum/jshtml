var assert = require('assert');
var fs = require('fs');
var jsHtml = require('../main');

(function implicitGroup() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>Test</title></head>\n'
    + '<body>\n'
    + ' <p>\n'
    + '     test \n'
    + '     @for(var i = 1; i <= 3; i++)\n'
    + '     {\n'
    + '     <text>\n'
    + '     @i\n'
    + '     </text>\n'
    + '     }\n'
    + '     !!!\n'
    + ' </p>\n'
    + '</body>\n'
    + '</html>\n'
	, {
        whitespaceMode: 'strip'
    });

    var expect = '<html><head><title>Test</title></head><body><p>test123!!!</p></body></html>';

    assert.equal(actual, expect);
})();
    
(function implicitBlock() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>Test</title></head>\n'
    + '<body>\n'
    + ' <p>\n'
    + '     test \n'
    + '     @for(var i = 1; i <= 3; i++)\n'
    + '     {\n'
    + '     <text>\n'
    + '     @i;\n'
    + '     </text>\n'
    + '     }\n'
    + '     !!!\n'
    + ' </p>\n'
    + '</body>\n'
    + '</html>\n'
	, {
        whitespaceMode: 'strip'
    });

    var expect = '<html><head><title>Test</title></head><body><p>test!!!</p></body></html>';

    assert.equal(actual, expect);
})();

    
(function explicitBlock() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>Test</title></head>\n'
    + '<body>\n'
    + ' <p>\n'
    + '     test \n'
    + '     @for(var i = 1; i <= 3; i++)\n'
    + '     {\n'
    + '     <text>\n'
    + '     @{i;}\n'
    + '     </text>\n'
    + '     }\n'
    + '     !!!\n'
    + ' </p>\n'
    + '</body>\n'
    + '</html>\n'
	, {
        whitespaceMode: 'strip'
    });

    var expect = '<html><head><title>Test</title></head><body><p>test!!!</p></body></html>';

    assert.equal(actual, expect);
})();

(function explicitGroup() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>Test</title></head>\n'
    + '<body>\n'
    + ' <p>\n'
    + '     test \n'
    + '     @for(var i = 1; i <= 3; i++)\n'
    + '     {\n'
    + '     <text>\n'
    + '     @(i)\n'
    + '     </text>\n'
    + '     }\n'
    + '     !!!\n'
    + ' </p>\n'
    + '</body>\n'
    + '</html>\n'
	, {
        whitespaceMode: 'strip'
    });

    var expect = '<html><head><title>Test</title></head><body><p>test123!!!</p></body></html>';

    assert.equal(actual, expect);
})();


