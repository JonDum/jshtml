/*!
 * jsHtmlParser
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */
var assert = require('assert');
var tokenizer = require('./tokenizer');
var html = require('./html');
var rule = (function() {
    var source = {
        'AnchorEscaped': /@(@+)/,
        'AnchorIfElse': /@if\(/,
        'AnchorIfElse1': /\)\s*\{/,
        'AnchorIfElse2': /\}\s*(else\s*\{)?/,
        'AnchorIfElse3': /\}/,
        'AnchorFor': /@for\(/,
        'AnchorFor1': /\)\s*\{/,
        'AnchorFor2': /\}/,
        'AnchorWhile': /@while\(/,
        'AnchorWhile1': /\)\s*\{/,
        'AnchorWhile2': /\}/,
        'AnchorDoWhile': /@do\s*\{/,
        'AnchorDoWhile1': /\}\s*while\(/,
        'AnchorDoWhile2': /\)/,
        'AnchorSwitch': /@switch\(/,
        'AnchorSwitch1': /\)\s*\{/,
        'AnchorSwitch2': /\}/,
        'AnchorWith': /@with\(/,
        'AnchorWith1': /\)\s*\{/,
        'AnchorWith2': /\}/,
        'AnchorGroupOpen': /@\(/,
        'AnchorGroupClose': /\)/,
        'AnchorBlockOpen': /@\{/,
        'AnchorBlockClose': /\}/,
        'AnchorInlineOpen': /@([$_A-Za-z][$_A-Za-z0-9]*)/,
        'AnchorInlineClose': /^/,
        'TextOpen': /<text>/,
        'TextClose': /<\/text>/,
        'TagEnter': /<([A-Za-z]+)/,
        'TagExit': /\s*\/>/,
        'TagExitOpen': /\s*>/,
        'TagClose': /<\/([A-Za-z]+)>/,
        'JsMemberOpen': /^\.([$_A-Za-z][$_A-Za-z0-9]*)/,
        'JsMemberClose': /^/,
        'JsBlockOpen': /\{/,
        'JsBlockClose': /\}/,
        'JsGroupOpen': /\(/,
        'JsGroupClose': /\)/,
        'JsArrayOpen': /\[/,
        'JsArrayClose': /\]/,
        'JsDoubleQuoteOpen': /"/,
        'JsDoubleQuoteClose': /"/,
        'JsSingleQuoteOpen': /'/,
        'JsSingleQuoteClose': /'/,
        'JsStringEscaped': /\\./
    };

    function build() {
        var ruleSet = {};
        var argumentCount = arguments.length;
        for (var argumentIndex = 0; argumentIndex < argumentCount; argumentIndex++) {
            var argument = arguments[argumentIndex];
            ruleSet[argument] = source[argument];
        }
        return ruleSet;
    }
    return {
        root: build('AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen'),
        text: build('AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen', 'TextClose'),
        tagHead: build('AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen', 'TagExit', 'TagExitOpen'),
        tag: build('AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen', 'TagEnter', 'TagClose'),
        anchorInline: build('JsMemberOpen', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'AnchorInlineClose'),
        anchorGroup: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorGroupClose'),
        anchorBlock: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorBlockClose'),
        anchorIfElse1: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorIfElse1'),
        anchorIfElse2: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorIfElse2'),
        anchorIfElse3: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorIfElse3'),
        anchorFor1: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorFor1'),
        anchorFor2: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorFor2'),
        anchorWhile1: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorWhile1'),
        anchorWhile2: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorWhile2'),
        anchorDoWhile1: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorDoWhile1'),
        anchorDoWhile2: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorDoWhile2'),
        anchorSwitch1: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorSwitch1'),
        anchorSwitch2: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorSwitch2'),
        anchorWith1: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorWith1'),
        anchorWith2: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorWith2'),
        jsBlock: build('JsBlockClose', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter'),
        jsGroup: build('JsGroupClose', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen'),
        jsArray: build('JsArrayClose', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen'),
        jsMember: build('JsMemberOpen', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsMemberClose'),
        jsDoubleQuote: build('JsStringEscaped', 'JsDoubleQuoteClose'),
        jsSingleQuote: build('JsStringEscaped', 'JsSingleQuoteClose')
    };
})();

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

function create(parseCallback, options) {
    var config = extend({}, options, {
        whitespaceMode: 'keep'
    });
    var contextBuffer = '';
    var contextStack = [];

    function pushContext(context, ruleSet) {
        if (contextStack[0] != context && contextStack.length > 0) {
            flushContextBuffer(contextStack[0]);
        }
        contextStack.unshift(context);
        jsHtmlTokenizer.pushRuleSet(ruleSet);
    }

    function popContext() {
        var context = contextStack.shift();
        if (contextStack[0] != context) {
            flushContextBuffer(context);
        }
        jsHtmlTokenizer.popRuleSet();
    }

    function writeContext(data) {
        contextBuffer += data;
    }

    function flushContextBuffer(context) {
        var str;
        switch (context) {
        case 'html':
            switch (config.whitespaceMode) {
            case 'strip':
                str = contextBuffer;
                str = str.replace(/>\s+</g, '><');
                str = str.replace(/\s+</g, '<');
                str = str.replace(/>\s+/g, '>');
                str = str.replace(/^\s+/g, '');
                str = str.replace(/\s+$/g, '');
                break;
            case 'leading':
                str = contextBuffer;
                str = str.replace(/>\s+</g, '><');
                str = str.replace(/\s+</g, '<');
                str = str.replace(/\s+$/g, '');
                break;
            case 'trailing':
                str = contextBuffer;
                str = str.replace(/>\s+</g, '><');
                str = str.replace(/>\s+/g, '>');
                str = str.replace(/^\s+/g, '');
                break;
            case 'keep':
                str = contextBuffer;
                break;
            default:
                throw "unknown whitespaceMode '" + config.whitespaceMode + "'";
            }
            if (str) str = 'stream.write(' + JSON.stringify(str) + ');\n';
            break;
        case 'js':
            str = contextBuffer;
            break;
        default:
            throw 'unknown ' + context;
        }
        contextBuffer = '';
        if (str) parseCallback(str);
    }

    function ontoken(token, buffer) {
        if (token) {
            var preceding = token.match ? buffer.substr(0, token.match.index) : '';
            if (preceding) {
                writeContext(preceding);
            }
            switch (token.category) {
            case 'JsStringEscaped':
                writeContext(token.match[0]);
                break;
            case 'JsDoubleQuoteOpen':
                pushContext('js', rule.jsDoubleQuote);
                writeContext(token.match[0]);
                break;
            case 'JsDoubleQuoteClose':
                writeContext(token.match[0]);
                popContext();
                break;
            case 'JsSingleQuoteOpen':
                pushContext('js', rule.jsSingleQuote);
                writeContext(token.match[0]);
                break;
            case 'JsSingleQuoteClose':
                writeContext(token.match[0]);
                popContext();
                break;
            case 'JsGroupOpen':
                pushContext('js', rule.jsGroup);
                writeContext(token.match[0]);
                break;
            case 'JsGroupClose':
                writeContext(token.match[0]);
                popContext();
                break;
            case 'JsBlockOpen':
                pushContext('js', rule.jsBlock);
                writeContext(token.match[0]);
                break;
            case 'JsBlockClose':
                writeContext(token.match[0]);
                popContext();
                break;
            case 'JsArrayOpen':
                pushContext('js', rule.jsArray);
                writeContext(token.match[0]);
                break;
            case 'JsArrayClose':
                writeContext(token.match[0]);
                popContext();
                break;
            case 'JsMemberOpen':
                pushContext('js', rule.jsMember);
                writeContext(token.match[0]);
                break;
            case 'JsMemberClose':
                popContext();
                break;
            case 'AnchorEscaped':
                writeContext(token.match[1]);
                break;
            case 'AnchorIfElse':
                pushContext('js', rule.anchorIfElse1);
                writeContext('if(');
                break;
            case 'AnchorIfElse1':
                writeContext(') ');
                popContext();
                pushContext('js', rule.anchorIfElse2);
                writeContext('{\n');
                break;
            case 'AnchorIfElse2':
                writeContext('}\n');
                popContext();
                if (token.match[1]) {
                    pushContext('js', rule.anchorIfElse3);
                    writeContext('else {\n');
                }
                break;
            case 'AnchorIfElse3':
                writeContext('}\n');
                popContext();
                break;
            case 'AnchorFor':
                pushContext('js', rule.anchorFor1);
                writeContext('for(');
                break;
            case 'AnchorFor1':
                writeContext(') ');
                popContext();
                pushContext('js', rule.anchorFor2);
                writeContext('{\n');
                break;
            case 'AnchorFor2':
                writeContext('}\n');
                popContext();
                break;
            case 'AnchorWhile':
                pushContext('js', rule.anchorWhile1);
                writeContext('while(');
                break;
            case 'AnchorWhile1':
                writeContext(') ');
                popContext();
                pushContext('js', rule.anchorWhile2);
                writeContext('{\n');
                break;
            case 'AnchorWhile2':
                writeContext('}\n');
                popContext();
                break;
            case 'AnchorDoWhile':
                pushContext('js', rule.anchorDoWhile1);
                writeContext('do {\n');
                break;
            case 'AnchorDoWhile1':
                writeContext('} ');
                popContext();
                pushContext('js', rule.anchorDoWhile2);
                writeContext('while(');
                break;
            case 'AnchorDoWhile2':
                writeContext(');\n');
                popContext();
                break;
            case 'AnchorSwitch':
                pushContext('js', rule.anchorSwitch1);
                writeContext('switch(');
                break;
            case 'AnchorSwitch1':
                writeContext(') ');
                popContext();
                pushContext('js', rule.anchorSwitch2);
                writeContext('{\n');
                break;
            case 'AnchorSwitch2':
                writeContext('}\n');
                popContext();
                break;
            case 'AnchorWith':
                pushContext('js', rule.anchorWith1);
                writeContext('with(');
                break;
            case 'AnchorWith1':
                writeContext(') ');
                popContext();
                pushContext('js', rule.anchorWith2);
                writeContext('{\n');
                break;
            case 'AnchorWith2':
                writeContext('}\n');
                popContext();
                break;
            case 'AnchorGroupOpen':
                pushContext('js', rule.anchorGroup);
                writeContext('stream.write(html.encode(');
                break;
            case 'AnchorGroupClose':
                writeContext('));\n');
                popContext();
                break;
            case 'AnchorBlockOpen':
                pushContext('js', rule.anchorBlock);
                writeContext('\n');
                break;
            case 'AnchorBlockClose':
                writeContext('\n');
                popContext();
                break;
            case 'AnchorInlineOpen':
                pushContext('js', rule.anchorInline);
                writeContext('if(typeof ' + token.match[1] + ' == "undefined") stream.write(' + JSON.stringify(token.match[0]) + ');\n');
                writeContext('else stream.write(html.encode(' + token.match[1]);
                break;
            case 'AnchorInlineClose':
                writeContext('));\n');
                popContext();
                break;
            case 'TagEnter':
                pushContext('html', rule.tag);
                pushContext('html', rule.tagHead);
                writeContext(token.match[0]);
                break;
            case 'TagExit':
                writeContext(token.match[0]);
                popContext();
                popContext();
                break;
            case 'TagExitOpen':
                writeContext(token.match[0]);
                popContext();
                break;
            case 'TagClose':
                writeContext(token.match[0]);
                popContext();
                break;
            case 'TextOpen':
                pushContext('html', rule.text);
                break;
            case 'TextClose':
                popContext();
                break;
            default:
                throw 'unknown ' + token.category;
            }
        }
        else {
            writeContext(buffer);
        }
    }
    var jsHtmlTokenizer = tokenizer.create(ontoken, options);
    pushContext('html', rule.root);

    function write(data) {
        jsHtmlTokenizer.write(data);
    }

    function flush() {
        jsHtmlTokenizer.flush();
        flushContextBuffer(contextStack[0]);
    }
    this.write = write;
    this.flush = flush;
    return this;
}
exports.create = create;