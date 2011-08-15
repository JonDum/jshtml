/*!
 * JsHtmlParser
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */
var assert = require('assert');
var Tokenizer = require('./Tokenizer');
var html = require('./html');
var contextSet = (function() {
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

    function build(contextType) {
        var context = {
            type: contextType,
            ruleSet: {}
        };
        for (var argumentIndex = 1, argumentCount = arguments.length; argumentIndex < argumentCount; argumentIndex++) {
            var argument = arguments[argumentIndex];
            context.ruleSet[argument] = source[argument];
        }
        return context;
    }
    return {
        root: build('html', 'AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen'),
        text: build('html', 'AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen', 'TextClose'),
        tagHead: build('html', 'AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen', 'TagExit', 'TagExitOpen'),
        tag: build('html', 'AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen', 'TagEnter', 'TagClose'),
        anchorInline: build('js', 'JsMemberOpen', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'AnchorInlineClose'),
        anchorGroup: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorGroupClose'),
        anchorBlock: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorBlockClose'),
        anchorIfElse1: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorIfElse1'),
        anchorIfElse2: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorIfElse2'),
        anchorIfElse3: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorIfElse3'),
        anchorFor1: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorFor1'),
        anchorFor2: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorFor2'),
        anchorWhile1: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorWhile1'),
        anchorWhile2: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorWhile2'),
        anchorDoWhile1: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorDoWhile1'),
        anchorDoWhile2: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorDoWhile2'),
        anchorSwitch1: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorSwitch1'),
        anchorSwitch2: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorSwitch2'),
        anchorWith1: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorWith1'),
        anchorWith2: build('js', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorWith2'),
        jsBlock: build('js', 'JsBlockClose', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter'),
        jsGroup: build('js', 'JsGroupClose', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen'),
        jsArray: build('js', 'JsArrayClose', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen'),
        jsMember: build('js', 'JsMemberOpen', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsMemberClose'),
        jsDoubleQuote: build('js', 'JsStringEscaped', 'JsDoubleQuoteClose'),
        jsSingleQuote: build('js', 'JsStringEscaped', 'JsSingleQuoteClose')
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

    function pushContext(context) {
        var currentContext = contextStack[0];
        if (currentContext && currentContext.type != context.type) {
            flushContextBuffer(currentContext.type);
        }
        contextStack.unshift(context);
        tokenizer.ruleSet = context.ruleSet;
    }

    function popContext() {
        var currentContext = contextStack.shift();
        var context = contextStack[0];
        if (currentContext.type != context.type) {
            flushContextBuffer(currentContext.type);
        }
        tokenizer.ruleSet = context.ruleSet;
        return currentContext;
    }

    function writeContext(data) {
        contextBuffer += data;
    }

    function flushContextBuffer(contextType) {
        var str;
        switch (contextType) {
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
            throw 'unknown ' + contextType;
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
                pushContext(contextSet.jsDoubleQuote);
                writeContext(token.match[0]);
                break;
            case 'JsDoubleQuoteClose':
                writeContext(token.match[0]);
                popContext();
                break;
            case 'JsSingleQuoteOpen':
                pushContext(contextSet.jsSingleQuote);
                writeContext(token.match[0]);
                break;
            case 'JsSingleQuoteClose':
                writeContext(token.match[0]);
                popContext();
                break;
            case 'JsGroupOpen':
                pushContext(contextSet.jsGroup);
                writeContext(token.match[0]);
                break;
            case 'JsGroupClose':
                writeContext(token.match[0]);
                popContext();
                break;
            case 'JsBlockOpen':
                pushContext(contextSet.jsBlock);
                writeContext(token.match[0]);
                break;
            case 'JsBlockClose':
                writeContext(token.match[0]);
                popContext();
                break;
            case 'JsArrayOpen':
                pushContext(contextSet.jsArray);
                writeContext(token.match[0]);
                break;
            case 'JsArrayClose':
                writeContext(token.match[0]);
                popContext();
                break;
            case 'JsMemberOpen':
                pushContext(contextSet.jsMember);
                writeContext(token.match[0]);
                break;
            case 'JsMemberClose':
                popContext();
                break;
            case 'AnchorEscaped':
                writeContext(token.match[1]);
                break;
            case 'AnchorIfElse':
                pushContext(contextSet.anchorIfElse1);
                writeContext('if(');
                break;
            case 'AnchorIfElse1':
                writeContext(') ');
                popContext();
                pushContext(contextSet.anchorIfElse2);
                writeContext('{\n');
                break;
            case 'AnchorIfElse2':
                writeContext('}\n');
                popContext();
                if (token.match[1]) {
                    pushContext(contextSet.anchorIfElse3);
                    writeContext('else {\n');
                }
                break;
            case 'AnchorIfElse3':
                writeContext('}\n');
                popContext();
                break;
            case 'AnchorFor':
                pushContext(contextSet.anchorFor1);
                writeContext('for(');
                break;
            case 'AnchorFor1':
                writeContext(') ');
                popContext();
                pushContext(contextSet.anchorFor2);
                writeContext('{\n');
                break;
            case 'AnchorFor2':
                writeContext('}\n');
                popContext();
                break;
            case 'AnchorWhile':
                pushContext(contextSet.anchorWhile1);
                writeContext('while(');
                break;
            case 'AnchorWhile1':
                writeContext(') ');
                popContext();
                pushContext(contextSet.anchorWhile2);
                writeContext('{\n');
                break;
            case 'AnchorWhile2':
                writeContext('}\n');
                popContext();
                break;
            case 'AnchorDoWhile':
                pushContext(contextSet.anchorDoWhile1);
                writeContext('do {\n');
                break;
            case 'AnchorDoWhile1':
                writeContext('} ');
                popContext();
                pushContext(contextSet.anchorDoWhile2);
                writeContext('while(');
                break;
            case 'AnchorDoWhile2':
                writeContext(');\n');
                popContext();
                break;
            case 'AnchorSwitch':
                pushContext(contextSet.anchorSwitch1);
                writeContext('switch(');
                break;
            case 'AnchorSwitch1':
                writeContext(') ');
                popContext();
                pushContext(contextSet.anchorSwitch2);
                writeContext('{\n');
                break;
            case 'AnchorSwitch2':
                writeContext('}\n');
                popContext();
                break;
            case 'AnchorWith':
                pushContext(contextSet.anchorWith1);
                writeContext('with(');
                break;
            case 'AnchorWith1':
                writeContext(') ');
                popContext();
                pushContext(contextSet.anchorWith2);
                writeContext('{\n');
                break;
            case 'AnchorWith2':
                writeContext('}\n');
                popContext();
                break;
            case 'AnchorGroupOpen':
                pushContext(contextSet.anchorGroup);
                writeContext('stream.write(html.encode(');
                break;
            case 'AnchorGroupClose':
                writeContext('));\n');
                popContext();
                break;
            case 'AnchorBlockOpen':
                pushContext(contextSet.anchorBlock);
                writeContext('\n');
                break;
            case 'AnchorBlockClose':
                writeContext('\n');
                popContext();
                break;
            case 'AnchorInlineOpen':
                pushContext(contextSet.anchorInline);
                writeContext('if(typeof ' + token.match[1] + ' == "undefined") stream.write(' + JSON.stringify(token.match[0]) + ');\n');
                writeContext('else stream.write(html.encode(' + token.match[1]);
                break;
            case 'AnchorInlineClose':
                writeContext('));\n');
                popContext();
                break;
            case 'TagEnter':
                pushContext(contextSet.tag);
                pushContext(contextSet.tagHead);
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
                pushContext(contextSet.text);
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
    var tokenizer = Tokenizer.create(ontoken, options);
    pushContext(contextSet.root);

    function write(data) {
        tokenizer.write(data);
    }

    function flush() {
        tokenizer.flush();
        if (contextStack.length > 1) {
            throw new SyntaxError('Error while parsing jshtml template.');
        }
        flushContextBuffer(contextStack[0].type);
    }
    this.write = write;
    this.flush = flush;
    return this;
}
exports.create = create;