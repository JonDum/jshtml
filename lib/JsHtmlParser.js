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
	anchorEscaped:	/@(@+)/

	, anchorGroup:	/@\(/
	, anchorGroup1:	/\)/

	, anchorBlock:	/@\{/
	, anchorBlock1:	/\}/

	, anchorInline:	/@([$_A-Za-z][$_A-Za-z0-9]*)/
	, anchorInline1:	/^(;)?/

	, anchorIfElse:	/@(if\()\s*/
	, anchorIfElse1:	/\s*(\))\s*(\{)/
	, anchorIfElse2:	/(\})\s*(else\s*\{)?/
	, anchorIfElse3:	/(\})/

	, anchorFor:	/@(for\()\s*/
	, anchorFor1:	/\s*(\s*\))\s*(\{)/
	, anchorFor2:	/(\})/

	, anchorWhile:	/@(while\()\s*/
	, anchorWhile1:	/\s*(\))\s*(\{)/
	, anchorWhile2:	/(\})/
	
	, anchorDoWhile:	/@(do\s*\{)/
	, anchorDoWhile1:	/(\})\s*(while\()\s*/
	, anchorDoWhile2:	/\s*(\))/

	, anchorSwitch:	/@(switch\()/
	, anchorSwitch1:	/(\))\s*(\{)/
	, anchorSwitch2:	/(\})/

	, anchorWith:	/@(with\()\s*/
	, anchorWith1:	/\s*(\))\s*(\{)/
	, anchorWith2: /(\})/

	, TextOpen : /<text>/
	, TextClose : /<\/text>/

	, TagEnter : /<([A-Za-z]+)/
	, TagExit : /\s*\/>/
	, TagExitOpen : /\s*>/
	, TagClose : /<\/([A-Za-z]+)>/

	, JsStringEscaped : /\\./
	, JsMemberOpen : /^\.([$_A-Za-z][$_A-Za-z0-9]*)/
	, JsMemberClose : /^/
	, JsBlockOpen : /\{/
	, JsBlockClose : /\}/
	, JsGroupOpen : /\(/
	, JsGroupClose : /\)/
	, JsArrayOpen : /\[/
	, JsArrayClose : /\]/
	, JsDoubleQuoteOpen : /\s*"/
	, JsDoubleQuoteClose : /"\s*/
	, JsSingleQuoteOpen : /\s*'/
	, JsSingleQuoteClose : /'\s*/

};

const expressionSetDictionary = {
	root:		util.map(expressionSetSource, 'anchorEscaped', 'anchorIfElse', 'anchorFor', 'anchorWhile', 'anchorDoWhile', 'anchorSwitch', 'anchorWith', 'anchorGroup', 'anchorBlock', 'anchorInline')
	, text:		util.map(expressionSetSource, 'anchorEscaped', 'anchorIfElse', 'anchorFor', 'anchorWhile', 'anchorDoWhile', 'anchorSwitch', 'anchorWith', 'anchorGroup', 'anchorBlock', 'anchorInline', 'TextClose')
	, tagHead:	util.map(expressionSetSource, 'anchorEscaped', 'anchorIfElse', 'anchorFor', 'anchorWhile', 'anchorDoWhile', 'anchorSwitch', 'anchorWith', 'anchorGroup', 'anchorBlock', 'anchorInline', 'TagExit', 'TagExitOpen')
	, tag:		util.map(expressionSetSource, 'anchorEscaped', 'anchorIfElse', 'anchorFor', 'anchorWhile', 'anchorDoWhile', 'anchorSwitch', 'anchorWith', 'anchorGroup', 'anchorBlock', 'anchorInline', 'TagEnter', 'TagClose')

	, anchorInline:	util.map(expressionSetSource, 'JsMemberOpen', 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'anchorInline1')
	, anchorGroup:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'anchorGroup1')
	, anchorBlock:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'anchorBlock1')

	, anchorIfElse:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'anchorIfElse1')
	, anchorIfElse1:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'anchorIfElse2')
	, anchorIfElse2:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'anchorIfElse3')

	, anchorFor:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'anchorFor1')
	, anchorFor1:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'anchorFor2')

	, anchorWhile:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'anchorWhile1')
	, anchorWhile1:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'anchorWhile2')

	, anchorDoWhile:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'anchorDoWhile1')
	, anchorDoWhile1:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'anchorDoWhile2')

	, anchorSwitch:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'anchorSwitch1')
	, anchorSwitch1:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'anchorSwitch2')

	, anchorWith:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'anchorWith1')
	, anchorWith1:	util.map(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen', 'TagEnter', 'anchorWith2')

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
				case 'anchorEscaped':
				writeContext(token.match[1]);
				break;

				case 'anchorGroup':
				pushContext(expressionSetDictionary[token.category], new StackableWriter(getWriter(), jsWriteOptions));
				break;

				case 'anchorGroup1':
				popContext();
				break;


				case 'anchorBlock':
				pushContext(expressionSetDictionary[token.category], new StackableWriter(getWriter()));
				break;
			
				case 'anchorBlock1':
				popContext();
				break;


				case 'anchorInline':
				pushContext(expressionSetDictionary[token.category], new StackableWriter(getWriter(), bufferOptions));
				writeContext(token.match[1]);
				break;

				case 'anchorInline1':
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


				case 'anchorIfElse':
				case 'anchorFor':
				case 'anchorWhile':
				case 'anchorDoWhile':
				case 'anchorSwitch':
				case 'anchorWith':
				pushContext(expressionSetDictionary[token.category], new StackableWriter(getWriter()));
				writeContext(token.match[1]);
				break;

				case 'anchorIfElse1':
				case 'anchorIfElse2':
				case 'anchorIfElse3':
				case 'anchorFor1':
				case 'anchorFor2':
				case 'anchorWhile1':
				case 'anchorWhile2':
				case 'anchorDoWhile1':
				case 'anchorDoWhile2':
				case 'anchorSwitch1':
				case 'anchorSwitch2':
				case 'anchorWith1':
				case 'anchorWith2':
				writeContext(token.match[1]);
				popContext();
				if (token.match[2]) {
					pushContext(expressionSetDictionary[token.category], new StackableWriter(getWriter()));
					writeContext(token.match[2]);
				}
				break;


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

	util.extend(this, innerParser, {
	});
}

// exports
module.exports = JsHtmlParser;



