/*!
 * tokenizer
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */
var assert = require('assert');

function create(tokenCallback, bufferSize) {
    var tokenizer = this;
    var buffer = '';
    bufferSize = bufferSize || 1024;
    var ruleSetStack = [];

    function pushRuleSet(ruleSet) {
        ruleSetStack.unshift(ruleSet);
    }

    function popRuleSet() {
        return ruleSetStack.shift();
    }

    function write(data) {
        buffer += data;
        while (buffer.length > bufferSize) {
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
        var ruleSet = ruleSetStack[0];
        assert.ok(ruleSet);
        for (var category in ruleSet) {
            var expression = ruleSet[category];
                var match = expression.exec(buffer);
                if (match && (!token || !token.match||match.index < token.match.index)) {
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
        if (token &&token.match) buffer = buffer.substr(token.match.index + token.match[0].length);
        else buffer = '';
    }
    tokenizer.write = write;
    tokenizer.flush = flush;
    tokenizer.pushRuleSet = pushRuleSet;
    tokenizer.popRuleSet = popRuleSet;
    return tokenizer;
}
exports.create = create;