var assert = require('assert');
var fs = require('fs');
var jsHtml = require('../main');
var srcDir = __dirname + '/../examples/';

fs.readdirSync(srcDir).forEach(function(file) {
    var match = /(.+)\.html$/i.exec(file);
    if (!match) return;
	
	console.log('[' + match[1] + ']');
	var expect = fs.readFileSync(srcDir + match[1] + '.html', 'utf8');
	var actual = jsHtml.render(fs.readFileSync(srcDir + match[1] + '.jshtml', 'utf8'), {
		locals: {
        	title:'Test'
        	, stoer: true
        	, lief: true
        	, youlikeit:true
		    , taskList: [
			    {id: 1, name: 'build a house'}
			    , {id: 2, name: 'run a marathon'}
			    , {id: 3, name: 'grow a beard'}
			]
            , productList: [
            	{id: 1, name: 'Blend', price: 9.5}
            	, {id: 1, name: 'I LOVE FAKE', price: 12.5}
            	, {id: 1, name: 'Gup', price: 19.5 }
            ]
        }
	});
	
    assert.equal(actual, expect);
});


