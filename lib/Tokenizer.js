/*!
 * Tokenizer
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */
var assert = require('assert');
var util = require('./util');

function Tokenizer(tokenCallback, options) {
    var options = util.extend({}, options, {
        bufferSize: 4096
    });
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

    function getToken() {
        var token = null;
        var ruleSet = tokenizer.ruleSet;
        assert.ok(ruleSet,'no ruleSet');
        for (var category in ruleSet) {
            var expression = ruleSet[category];
            var match = expression.exec(buffer);
            if (match && (!token || !token.match || match.index < token.match.index)) {
                token = {
                    category: category,
                    match: match
                };
            }
        }
        return token;
    }

    function process() {
        var token = getToken();
        tokenCallback.call(tokenizer, token, buffer);
        buffer = (token && token.match)
        	? buffer.substr(token.match.index + token.match[0].length)
        	: buffer = ''
        	;
    }

    this.write = write;
    this.flush = flush;
}
//exports
module.exports=Tokenizer;
