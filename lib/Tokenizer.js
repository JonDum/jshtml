/*!
 * Tokenizer
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */

var assert = require('assert');
var util = require('./util');

function Tokenizer(tokenCallback, options) {
    var options = util.overload({
        bufferSize: 4096
    }, options);
    var tokenizer = this;
    var buffer = '';

	function write(data) {
        buffer += data;
		flush(options.bufferSize);
	}

	function flush(bufferSize) {
		var bufferSize = bufferSize || 0;
        while (buffer.length > bufferSize) {
            process();
        }
	}

    function process() {
        var token = getToken();
        tokenCallback.call(tokenizer, token, buffer);
        buffer = (token && token.match)
        	? buffer.substr(token.match.index + token.match[0].length)
        	: buffer = ''
        	;
    }

    function getToken() {
        var token = null;
        assert.ok(tokenizer.expressionSet, 'no expressionSet');
        for (var category in tokenizer.expressionSet) {
            var expression = tokenizer.expressionSet[category];
            var match = expression.exec(buffer);
            if (match && (!token || match.index < token.match.index)) {
                token = {
                    category: category
                    , match: match
                };
            }
        }
        return token;
    }

    this.write = write;
    this.flush = flush;
}
//exports
module.exports = Tokenizer;

