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
        //'AnchorInlineClose': /^(?!\.[$_A-Za-z][$_A-Za-z0-9]*)/,
        'AnchorInlineClose': /^/,
        'TextOpen': /<text>/,
        'TextClose': /<\/text>/,
        'TagEnter': /<([A-z]+)/,
        'TagRecurse': /<([A-z]+)/,
        'TagExit': /\s*\/>/,
        'TagExitOpen': /\s*>/,
        'TagClose': /<\/([A-z]+)>/,
        'JsMemberOpen': /^\.([$_A-Za-z][$_A-Za-z0-9]*)/,
        //'JsMemberClose': /^(?!\.[$_A-Za-z][$_A-Za-z0-9]*)/,
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
        
        tagHead: build('AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen',  'TagExit', 'TagExitOpen'),
        tag: build('AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen', 'TagRecurse', 'TagClose'),
        
        anchorInline: build('JsMemberOpen', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'AnchorInlineClose'),
        anchorGroup: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen','AnchorGroupClose'),
        anchorBlock: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen','JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter','AnchorBlockClose'),
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
        anchorWith1: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorWhith1'),
        anchorWith2: build('JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorWhith2'),
        jsBlock: build('JsBlockClose', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter'),
        jsGroup: build('JsGroupClose', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen'),
        jsArray: build('JsArrayClose', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen'),
        jsMember: build('JsMemberOpen', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsMemberClose'),
        jsDoubleQuote: build('JsStringEscaped', 'JsDoubleQuoteClose'),
        jsSingleQuote: build('JsStringEscaped', 'JsSingleQuoteClose')
    };
})();

function create(parseCallback, bufferSize) {
    function ontoken(token, buffer) {
        if (token) {
            var preceding = token.match?buffer.substr(0, token.match.index):'';
            switch (token.category) {
            case 'JsStringEscaped':
                parseCallback(preceding + token.match[0]);
                break;
            case 'JsDoubleQuoteOpen':
                parseCallback(preceding + token.match[0]);
                this.pushRuleSet(rule.jsDoubleQuote);
                break;
            case 'JsDoubleQuoteClose':
                parseCallback(preceding + token.match[0]);
                this.popRuleSet();
                break;
            case 'JsSingleQuoteOpen':
                parseCallback(preceding + token.match[0]);
                this.pushRuleSet(rule.jsSingleQuote);
                break;
            case 'JsSingleQuoteClose':
                parseCallback(preceding + token.match[0]);
                this.popRuleSet();
                break;
            case 'JsGroupOpen':
                parseCallback(preceding + token.match[0]);
                this.pushRuleSet(rule.jsGroup);
                break;
            case 'JsGroupClose':
                parseCallback(preceding + token.match[0]);
                this.popRuleSet();
                break;
            case 'JsBlockOpen':
                parseCallback(preceding + token.match[0]);
                this.pushRuleSet(rule.jsBlock);
                break;
            case 'JsBlockClose':
                parseCallback(preceding + token.match[0]);
                this.popRuleSet();
                break;
            case 'JsArrayOpen':
                parseCallback(preceding + token.match[0]);
                this.pushRuleSet(rule.jsArray);
                break;
            case 'JsArrayClose':
                parseCallback(preceding + token.match[0]);
                this.popRuleSet();
                break;
            case 'JsMemberOpen':
                parseCallback(token.match[0]);
                this.pushRuleSet(rule.jsMember);
                break;
            case 'JsMemberClose':
                this.popRuleSet();
                break;
            case 'AnchorEscaped':
                parseCallback('stream.write(' + JSON.stringify(preceding + token.match[1]) + ');\n');
                break;
            case 'AnchorIfElse':
                parseCallback('stream.write(' + JSON.stringify(preceding) + ');\n');
                parseCallback('if(');
                this.pushRuleSet(rule.anchorIfElse1);
                break;
            case 'AnchorIfElse1':
                parseCallback(preceding);
                parseCallback(') {\n');
                this.popRuleSet();
                this.pushRuleSet(rule.anchorIfElse2);
                break;
            case 'AnchorIfElse2':
                parseCallback(preceding);
                parseCallback('}\n');
                this.popRuleSet();
                if (token.match[1]) {
                    parseCallback('else {\n');
                    this.pushRuleSet(rule.anchorIfElse3);
                }
                break;
            case 'AnchorIfElse3':
                parseCallback(preceding);
                parseCallback('}\n');
                this.popRuleSet();
                break;
            case 'AnchorFor':
                parseCallback('stream.write(' + JSON.stringify(preceding) + ');\n');
                parseCallback('for(');
                this.pushRuleSet(rule.anchorIfElse1);
                break;
            case 'AnchorFor1':
                parseCallback(preceding);
                parseCallback(') {\n');
                this.popRuleSet();
                this.pushRuleSet(rule.anchorIfElse2);
                break;
            case 'AnchorFor2':
                parseCallback(preceding);
                parseCallback('}\n');
                this.popRuleSet();
                break;
            case 'AnchorWhile':
                parseCallback('stream.write(' + JSON.stringify(preceding) + ');\n');
                parseCallback('while(');
                this.pushRuleSet(rule.anchorWhile1);
                break;
            case 'AnchorWhile1':
                parseCallback(preceding);
                parseCallback(') {\n');
                this.popRuleSet();
                this.pushRuleSet(rule.anchorWhile2);
                break;
            case 'AnchorWhile2':
                parseCallback(preceding);
                parseCallback('}\n');
                this.popRuleSet();
                break;
            case 'AnchorDoWhile':
                parseCallback('stream.write(' + JSON.stringify(preceding) + ');\n');
                parseCallback('do {\n');
                this.pushRuleSet(rule.anchorDoWhile1);
                break;
            case 'AnchorDoWhile1':
                parseCallback(preceding);
                parseCallback('} while(');
                this.popRuleSet();
                this.pushRuleSet(rule.anchorDoWhile2);
                break;
            case 'AnchorDoWhile2':
                parseCallback(preceding);
                parseCallback(');\n');
                this.popRuleSet();
                break;
            case 'AnchorSwitch':
                parseCallback('stream.write(' + JSON.stringify(preceding) + ');\n');
                parseCallback('switch(');
                this.pushRuleSet(rule.anchorWhile1);
                break;
            case 'AnchorSwitch1':
                parseCallback(preceding);
                parseCallback(') {\n');
                this.popRuleSet();
                this.pushRuleSet(rule.anchorWhile2);
                break;
            case 'AnchorSwitch2':
                parseCallback(preceding);
                parseCallback('}\n');
                this.popRuleSet();
                break;
            case 'AnchorWith':
                parseCallback('stream.write(' + JSON.stringify(preceding) + ');\n');
                parseCallback('with(');
                this.pushRuleSet(rule.anchorWhile1);
                break;
            case 'AnchorWith1':
                parseCallback(preceding);
                parseCallback(') {\n');
                this.popRuleSet();
                this.pushRuleSet(rule.anchorWhile2);
                break;
            case 'AnchorWith2':
                parseCallback(preceding);
                parseCallback('}\n');
                this.popRuleSet();
                break;
            case 'AnchorGroupOpen':
                parseCallback('stream.write(' + JSON.stringify(preceding) + ');\n');
                parseCallback('stream.write(html.encode(');
                this.pushRuleSet(rule.anchorGroup);
                break;
            case 'AnchorGroupClose':
                parseCallback(preceding);
                parseCallback('));\n');
                this.popRuleSet();
                break;
            case 'AnchorBlockOpen':
                parseCallback('stream.write(' + JSON.stringify(preceding) + ');\n');
                this.pushRuleSet(rule.anchorBlock);
                break;
            case 'AnchorBlockClose':
                parseCallback(preceding);
                this.popRuleSet();
                break;
            case 'AnchorInlineOpen':
                parseCallback('stream.write(' + JSON.stringify(preceding) + ');\n');
                parseCallback('if(typeof ' + token.match[1] + ' == "undefined") stream.write(' + JSON.stringify(token.match[0]) + ');\n');
                parseCallback('else stream.write(html.encode(' + token.match[1]);
                this.pushRuleSet(rule.anchorInline);
                break;
            case 'AnchorInlineClose':
                parseCallback('));\n');
                this.popRuleSet();
                break;
            
            case 'TagRecurse':
                parseCallback('stream.write(' + JSON.stringify(preceding + token.match[0]) + ');\n');
                this.pushRuleSet(rule.tag);
                this.pushRuleSet(rule.tagHead);
                break;
            case 'TagEnter':
                parseCallback(preceding);
                parseCallback('stream.write(' + JSON.stringify(token.match[0]) + ');\n');
                this.pushRuleSet(rule.tag);
                this.pushRuleSet(rule.tagHead);
                break;
            case 'TagExit':
                parseCallback('stream.write(' + JSON.stringify(preceding + token.match[0]) + ');\n');
                this.popRuleSet();
                this.popRuleSet();
                break;
            case 'TagExitOpen':
                parseCallback('stream.write(' + JSON.stringify(preceding + token.match[0]) + ');\n');
                this.popRuleSet();
                break;
            case 'TagClose':
                parseCallback('stream.write(' + JSON.stringify(preceding + token.match[0]) + ');\n');
                this.popRuleSet();
                break;
            case 'TextOpen':
                parseCallback(preceding);
                this.pushRuleSet(rule.text);
                break;
            case 'TextClose':
                parseCallback('stream.write(' + JSON.stringify(preceding) + ');\n');
                this.popRuleSet();
                break;
            default:
                throw 'unknown ' + token.category;
            }
        }
        else {
            parseCallback('stream.write(' + JSON.stringify(buffer) + ');\n');
        }
    }
    var jsHtmlTokenizer = tokenizer.create(ontoken);
    jsHtmlTokenizer.pushRuleSet(rule.root);
    this.write = jsHtmlTokenizer.write;
    this.flush = jsHtmlTokenizer.flush;
    return this;
}
exports.create = create;