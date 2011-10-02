/*
2011-10-01

It is possible to choose your own anchor, instead of using the default '@'
character. The anchor does not have to be a single charater, it may also be
longer, like '(-:'.

Please do pick your anchor carefully. Some characters may not work (like letters
or numbers). If you think you found an anchor that is not working while it
should. Please let me know!

"Elmer Bulthuis" <elmerbulthuis@gmail.com>
*/

var assert = require('assert');
var fs = require('fs');
var jsHtml = require('../main');

(function at() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>@title</title></head>\n'
    + '<body>\n'
    + '<a href="mailto:elmerbulthuis@gmail.com">Elmer Bulthuis</a>\n'
    + '</body>\n'
    + '</html>\n'
	, {
        locals: {title: 'Yeah!'}
    });

    var expect = '<html>\n<head><title>Yeah!</title></head>\n<body>\n<a href="mailto:elmerbulthuis@gmail.com">Elmer Bulthuis</a>\n</body>\n</html>\n';

    assert.equal(actual, expect);
})();
    
    
    
(function tilde() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>~title</title></head>\n'
    + '<body>\n'
    + 'o~yeah\n'
    + '</body>\n'
    + '</html>\n'
	, {
        anchor: '~'
        , locals: {title: 'Yeah!'}
    });

    var expect = '<html>\n<head><title>Yeah!</title></head>\n<body>\no~yeah\n</body>\n</html>\n';

    assert.equal(actual, expect);
})();

(function singleColon() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>:title</title></head>\n'
    + '<body>\n'
    + '</body>\n'
    + '</html>\n'
	, {
        anchor: ':'
        , locals: {title: 'Yeah!'}
    });

    var expect = '<html>\n<head><title>Yeah!</title></head>\n<body>\n</body>\n</html>\n';

    assert.equal(actual, expect);
})();

(function doubleColon() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>::title</title></head>\n'
    + '<body>\n'
    + '</body>\n'
    + '</html>\n'
	, {
        anchor: '::'
        , locals: {title: 'Yeah!'}
    });

    var expect = '<html>\n<head><title>Yeah!</title></head>\n<body>\n</body>\n</html>\n';

    assert.equal(actual, expect);
})();

(function tripleColon() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>:::title</title></head>\n'
    + '<body>\n'
    + '</body>\n'
    + '</html>\n'
	, {
        anchor: ':::'
        , locals: {title: 'Yeah!'}
    });

    var expect = '<html>\n<head><title>Yeah!</title></head>\n<body>\n</body>\n</html>\n';

    assert.equal(actual, expect);
})();


(function percent() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>%title</title></head>\n'
    + '<body>\n'
    + '</body>\n'
    + '</html>\n'
	, {
        anchor: '%'
        , locals: {title: 'Yeah!'}
    });

    var expect = '<html>\n<head><title>Yeah!</title></head>\n<body>\n</body>\n</html>\n';

    assert.equal(actual, expect);
})();

(function star() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>*title</title></head>\n'
    + '<body>\n'
    + '</body>\n'
    + '</html>\n'
	, {
        anchor: '*'
        , locals: {title: 'Yeah!'}
    });

    var expect = '<html>\n<head><title>Yeah!</title></head>\n<body>\n</body>\n</html>\n';

    assert.equal(actual, expect);
})();

(function arrow() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>->title</title></head>\n'
    + '<body>\n'
    + '</body>\n'
    + '</html>\n'
	, {
        anchor: '->'
        , locals: {title: 'Yeah!'}
    });

    var expect = '<html>\n<head><title>Yeah!</title></head>\n<body>\n</body>\n</html>\n';

    assert.equal(actual, expect);
})();

(function smiley() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>(-:title</title></head>\n'
    + '<body>\n'
    + '</body>\n'
    + '</html>\n'
	, {
        anchor: '(-:'
        , locals: {title: 'Yeah!'}
    });

    var expect = '<html>\n<head><title>Yeah!</title></head>\n<body>\n</body>\n</html>\n';

    assert.equal(actual, expect);
})();

(function comment() {
	console.log(arguments.callee);
	var actual = jsHtml.render(''
    + '<html>\n'
    + '<head><title>//title</title></head>\n'
    + '<body>\n'
    + '</body>\n'
    + '</html>\n'
	, {
        anchor: '//'
        , locals: {title: 'Yeah!'}
    });

    var expect = '<html>\n<head><title>Yeah!</title></head>\n<body>\n</body>\n</html>\n';

    assert.equal(actual, expect);
})();

