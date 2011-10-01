/*!
 * JsHtmlParser
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */

var assert = require('assert');
var util = require('./util');
var html = require('./html');
var StackableWriter = require('./StackableWriter');
var ContextualParser = require('./ContextualParser');

const expressionSetSource = {
	AnchorEscaped : /@(@+)/,
	AnchorIfElse : /@if\(/,
	AnchorIfElse1 : /\)\s*\{/,
	AnchorIfElse2 : /\}\s*(else\s*\{)?/,
	AnchorIfElse3 : /\}/,
	AnchorFor : /@for\(/,
	AnchorFor1 : /\)\s*\{/,
	AnchorFor2 : /\}/,
	AnchorWhile : /@while\(/,
	AnchorWhile1 : /\)\s*\{/,
	AnchorWhile2 : /\}/,
	AnchorDoWhile : /@do\s*\{/,
	AnchorDoWhile1 : /\}\s*while\(/,
	AnchorDoWhile2 : /\)/,
	AnchorSwitch : /@switch\(/,
	AnchorSwitch1 : /\)\s*\{/,
	AnchorSwitch2 : /\}/,
	AnchorWith : /@with\(/,
	AnchorWith1 : /\)\s*\{/,
	AnchorWith2 : /\}/,
	AnchorGroupOpen : /@\(/,
	AnchorGroupClose : /\)/,
	AnchorBlockOpen : /@\{/,
	AnchorBlockClose : /\}/,
	AnchorInlineOpen : /@([$_A-Za-z][$_A-Za-z0-9]*)/,
	AnchorInlineClose : /^(;)?/,
	TextOpen : /<text>/,
	TextClose : /<\/text>/,
	TagEnter : /<([A-Za-z]+)/,
	TagExit : /\s*\/>/,
	TagExitOpen : /\s*>/,
	TagClose : /<\/([A-Za-z]+)>/,
	JsMemberOpen : /^\.([$_A-Za-z][$_A-Za-z0-9]*)/,
	JsMemberClose : /^/,
	JsBlockOpen : /\{/,
	JsBlockClose : /\}/,
	JsGroupOpen : /\(/,
	JsGroupClose : /\)/,
	JsArrayOpen : /\[/,
	JsArrayClose : /\]/,
	JsDoubleQuoteOpen : /\s*"/,
	JsDoubleQuoteClose : /"\s*/,
	JsSingleQuoteOpen : /\s*'/,
	JsSingleQuoteClose : /'\s*/,
	JsStringEscaped : /\\./
};

const expressionSetDictionary = {
	root:		util.map(expressionSetSource, 'AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen')
	, text:		util.map(expressionSetSource, 'AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen', 'TextClose')
	, tagHead:	util.map(expressionSetSource, 'AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen', 'TagExit', 'TagExitOpen')
	, tag:		util.map(expressionSetSource, 'AnchorEscaped', 'AnchorIfElse', 'AnchorFor', 'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith', 'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen', 'TagEnter', 'TagClose')
	, anchorInline:	util.map(expressionSetSource, 'JsMemberOpen', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'AnchorInlineClose')
	, anchorGroup:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorGroupClose')
	, anchorBlock:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorBlockClose')
	, anchorIfElse1:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorIfElse1')
	, anchorIfElse2:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorIfElse2')
	, anchorIfElse3:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorIfElse3')
	, anchorFor1:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorFor1')
	, anchorFor2:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorFor2')
	, anchorWhile1:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorWhile1')
	, anchorWhile2:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorWhile2')
	, anchorDoWhile1:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorDoWhile1')
	, anchorDoWhile2:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorDoWhile2')
	, anchorSwitch1:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorSwitch1')
	, anchorSwitch2:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorSwitch2')
	, anchorWith1:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorWith1')
	, anchorWith2:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'AnchorWith2')
	, jsBlock:	util.map(expressionSetSource, 'JsBlockClose', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter')
	, jsGroup:	util.map(expressionSetSource, 'JsGroupClose', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen')
	, jsArray:	util.map(expressionSetSource, 'JsArrayClose', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen')
	, jsMember:	util.map(expressionSetSource, 'JsMemberOpen', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsMemberClose')
	, jsDoubleQuote:	util.map(expressionSetSource, 'JsStringEscaped', 'JsDoubleQuoteClose')
	, jsSingleQuote:	util.map(expressionSetSource, 'JsStringEscaped', 'JsSingleQuoteClose')
};

const htmlWhitespaceModeFilter = {
	'keep': function(data) {
		return data;
	}
	, 'strip': function(data, atBegin, atEnd) {
		data = data.replace(/>\s+</g, '><');
		data = data.replace(/\s+</g, '<');
		data = data.replace(/>\s+/g, '>');
		data = data.replace(/^\s+/g, '');
		data = data.replace(/\s+$/g, '');
		return data;
	}
	, 'leading': function(data, atBegin, atEnd) {
		data = data.replace(/>\s+</g, '><');
		data = data.replace(/\s+</g, '<');
		data = data.replace(/\s+$/g, '');
		return data;
	}
	, 'trailing': function(data, atBegin, atEnd) {
		data = data.replace(/>\s+</g, '><');
		data = data.replace(/>\s+/g, '>');
		data = data.replace(/^\s+/g, '');
		return data;
	}
};

function JsHtmlParser(writeCallback, options) {
	var parser = this;
	var options = util.extend({whitespaceMode: 'keep'}, options);
	var htmlWriteOptions = util.extend({}, options, {
		writeFilter: function(data) {
			return ('write(' + JSON.stringify(htmlWhitespaceModeFilter[options.whitespaceMode](data)) + ');');
		}
	});
	var jsWriteOptions = util.extend({}, options, {
		flushFilter: function(data) {
			return ('write(htmlEncode(' + data + '));');
		}
	});
	var bufferOptions = util.extend({}, options, {
		streaming: false
	});
	
	var rootContext = {
		expressionSet: expressionSetDictionary.root
		, writer: new StackableWriter(writeCallback, htmlWriteOptions)
		};
	var innerParser = new ContextualParser(onParse, rootContext, options);

	function onParse(token) {
		with(this) {
			switch (token.category) {
				case 'JsStringEscaped':
				writeContext(token.match[0]);
				break;

				case 'JsDoubleQuoteOpen':
				pushContext(expressionSetDictionary.jsDoubleQuote, new StackableWriter(getWriter()));
				writeContext(token.match[0]);
				break;

				case 'JsDoubleQuoteClose':
				writeContext(token.match[0]);
				popContext();
				break;

				case 'JsSingleQuoteOpen':
				pushContext(expressionSetDictionary.jsSingleQuote, new StackableWriter(getWriter()));
				writeContext(token.match[0]);
				break;

				case 'JsSingleQuoteClose':
				writeContext(token.match[0]);
				popContext();
				break;

				case 'JsGroupOpen':
				pushContext(expressionSetDictionary.jsGroup, new StackableWriter(getWriter()));
				writeContext(token.match[0]);
				break;

				case 'JsGroupClose':
				writeContext(token.match[0]);
				popContext();
				break;

				case 'JsBlockOpen':
				pushContext(expressionSetDictionary.jsBlock, new StackableWriter(getWriter()));
				writeContext(token.match[0]);
				break;

				case 'JsBlockClose':
				writeContext(token.match[0]);
				popContext();
				break;

				case 'JsArrayOpen':
				pushContext(expressionSetDictionary.jsArray, new StackableWriter(getWriter()));
				writeContext(token.match[0]);
				break;

				case 'JsArrayClose':
				writeContext(token.match[0]);
				popContext();
				break;

				case 'JsMemberOpen':
				pushContext(expressionSetDictionary.jsMember, new StackableWriter(getWriter()));
				writeContext(token.match[0]);
				break;

				case 'JsMemberClose':
				popContext();
				break;

				case 'AnchorEscaped':
				writeContext(token.match[1]);
				break;

				case 'AnchorIfElse':
				pushContext(expressionSetDictionary.anchorIfElse1, new StackableWriter(getWriter()));
				writeContext('if(');
				break;

				case 'AnchorIfElse1':
				writeContext(') ');
				popContext();
				pushContext(expressionSetDictionary.anchorIfElse2, new StackableWriter(getWriter()));
				writeContext('{');
				break;

				case 'AnchorIfElse2':
				writeContext('}');
				popContext();
				if (token.match[1]) {
					pushContext(expressionSetDictionary.anchorIfElse3, new StackableWriter(getWriter()));
					writeContext('else {');
				}
				break;

				case 'AnchorIfElse3':
				writeContext('}');
				popContext();
				break;

				case 'AnchorFor':
				pushContext(expressionSetDictionary.anchorFor1, new StackableWriter(getWriter()));
				writeContext('for(');
				break;

				case 'AnchorFor1':
				writeContext(') ');
				popContext();
				pushContext(expressionSetDictionary.anchorFor2, new StackableWriter(getWriter()));
				writeContext('{');
				break;

				case 'AnchorFor2':
				writeContext('}');
				popContext();
				break;

				case 'AnchorWhile':
				pushContext(expressionSetDictionary.anchorWhile1, new StackableWriter(getWriter()));
				writeContext('while(');
				break;

				case 'AnchorWhile1':
				writeContext(') ');
				popContext();
				pushContext(expressionSetDictionary.anchorWhile2, new StackableWriter(getWriter()));
				writeContext('{');
				break;

				case 'AnchorWhile2':
				writeContext('}');
				popContext();
				break;

				case 'AnchorDoWhile':
				pushContext(expressionSetDictionary.anchorDoWhile1, new StackableWriter(getWriter()));
				writeContext('do {');
				break;

				case 'AnchorDoWhile1':
				writeContext('} ');
				popContext();
				pushContext(expressionSetDictionary.anchorDoWhile2, new StackableWriter(getWriter()));
				writeContext('while(');
				break;

				case 'AnchorDoWhile2':
				writeContext(');');
				popContext();
				break;

				case 'AnchorSwitch':
				pushContext(expressionSetDictionary.anchorSwitch1, new StackableWriter(getWriter()));
				writeContext('switch(');
				break;

				case 'AnchorSwitch1':
				writeContext(') ');
				popContext();
				pushContext(expressionSetDictionary.anchorSwitch2, new StackableWriter(getWriter()));
				writeContext('{');
				break;

				case 'AnchorSwitch2':
				writeContext('}');
				popContext();
				break;

				case 'AnchorWith':
				pushContext(expressionSetDictionary.anchorWith1, new StackableWriter(getWriter()));
				writeContext('with(');
				break;

				case 'AnchorWith1':
				writeContext(') ');
				popContext();
				pushContext(expressionSetDictionary.anchorWith2, new StackableWriter(getWriter()));
				writeContext('{');
				break;

				case 'AnchorWith2':
				writeContext('}');
				popContext();
				break;

				case 'AnchorGroupOpen':
				pushContext(expressionSetDictionary.anchorGroup, new StackableWriter(getWriter(), jsWriteOptions));
				break;

				case 'AnchorGroupClose':
				popContext();
				break;

				case 'AnchorBlockOpen':
				pushContext(expressionSetDictionary.anchorBlock, new StackableWriter(getWriter()));
				break;

				case 'AnchorBlockClose':
				popContext();
				break;

				case 'AnchorInlineOpen':
				pushContext(expressionSetDictionary.anchorInline, new StackableWriter(getWriter(), bufferOptions));
				writeContext(token.match[1]);
				break;

				case 'AnchorInlineClose':
				/*
				 * with ';' at the end, we should not write it example:
				 * @instance.member();
				 *
				 * without ';' at the end, we should encode it and write it
				 * example: @instance.member()
				 */
				writeContext(token.match[1]);
				if(!token.match[1]) {
					getWriter().setOptions(jsWriteOptions);
				}
				popContext();
				break;

				case 'TagEnter':
				pushContext(expressionSetDictionary.tag, new StackableWriter(getWriter(), htmlWriteOptions));
				pushContext(expressionSetDictionary.tagHead, new StackableWriter(getWriter(), htmlWriteOptions));
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
				pushContext(expressionSetDictionary.text, new StackableWriter(getWriter(), htmlWriteOptions));
				break;

				case 'TextClose':
				popContext();
				break;

				default:
				throw 'unknown ' + token.category;
			}
		}
	}

	function end(data) {
		innerParser.end(data);
		writeCallback.call(parser, '}');
	}

	writeCallback.call(parser, 'var context = arguments[0];');
	writeCallback.call(parser, 'with(context){');

	util.extend(this, innerParser, {
		end: end
	});
}

// exports
module.exports = JsHtmlParser;


