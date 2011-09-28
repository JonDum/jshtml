/*!
 * Tokenizer
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */
var assert = require('assert');

function extend(o) {
    var argumentCount = arguments.length;
    for (var argumentIndex = 1; argumentIndex < argumentCount; argumentIndex++) {
        var argument = arguments[argumentIndex];
        for (var argumentKey in argument) {
            if (!(argumentKey in o)) o[argumentKey] = argument[argumentKey];
        }
    }
    return o;
}

function Tokenizer(tokenCallback, options) {
    var config = extend({}, options, {
        bufferSize: 1024
    });
    var tokenizer = this;
    var buffer = '';

    function write(data) {
        buffer += data;
        while (buffer.length > config.bufferSize) {
            process();
        }
    }

    function flush() {
        while (buffer.length > 0) {
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
        if (token && token.match) buffer = buffer.substr(token.match.index + token.match[0].length);
        else buffer = '';
    }
    tokenizer.write = write;
    tokenizer.flush = flush;
}
//exports
module.exports=Tokenizer;
