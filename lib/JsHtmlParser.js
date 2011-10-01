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


	, jsStringEscaped : /\\./

	, jsMember : /(^\.[$_A-Za-z][$_A-Za-z0-9]*)/
	, jsMember1 : /(^)/

	, jsDoubleQuote:	/\s*(")/
	, jsDoubleQuote1:	/(")\s*/
	, jsSingleQuote:	/\s*(')/
	, jsSingleQuote1:	/(')\s*/

	, jsBlock : /(\{)/
	, jsBlock1 : /(\})/
	, jsGroup : /(\()/
	, jsGroup1 : /(\))/
	, jsArray : /(\[)/
	, jsArray1 : /(\])/


	, text:	/<text>/
	, text1:	/<\/text>/

	, tag:	/<([A-Za-z]+)/
	, tag1:	/\s*\/>/
	, tag2:	/\s*>/
	, tag3:	/<\/([A-Za-z]+)>/

};

const expressionSetDictionary = {
	root:		util.map(expressionSetSource, 'anchorEscaped', 'anchorIfElse', 'anchorFor', 'anchorWhile', 'anchorDoWhile', 'anchorSwitch', 'anchorWith', 'anchorGroup', 'anchorBlock', 'anchorInline')
	, text:		util.map(expressionSetSource, 'anchorEscaped', 'anchorIfElse', 'anchorFor', 'anchorWhile', 'anchorDoWhile', 'anchorSwitch', 'anchorWith', 'anchorGroup', 'anchorBlock', 'anchorInline', 'text1')
	, tagHead:	util.map(expressionSetSource, 'anchorEscaped', 'anchorIfElse', 'anchorFor', 'anchorWhile', 'anchorDoWhile', 'anchorSwitch', 'anchorWith', 'anchorGroup', 'anchorBlock', 'anchorInline', 'tag1', 'tag2')
	, tagBody:		util.map(expressionSetSource, 'anchorEscaped', 'anchorIfElse', 'anchorFor', 'anchorWhile', 'anchorDoWhile', 'anchorSwitch', 'anchorWith', 'anchorGroup', 'anchorBlock', 'anchorInline', 'tag', 'tag3')

	, anchorInline:	util.map(expressionSetSource, 'jsMember', 'jsBlock', 'jsGroup', 'jsArray', 'anchorInline1')
	, anchorGroup:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'anchorGroup1')
	, anchorBlock:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'text', 'tag', 'anchorBlock1')

	, anchorIfElse:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'anchorIfElse1')
	, anchorIfElse1:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'text', 'tag', 'anchorIfElse2')
	, anchorIfElse2:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'text', 'tag', 'anchorIfElse3')

	, anchorFor:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'anchorFor1')
	, anchorFor1:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'text', 'tag', 'anchorFor2')

	, anchorWhile:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'anchorWhile1')
	, anchorWhile1:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'text', 'tag', 'anchorWhile2')

	, anchorDoWhile:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'text', 'tag', 'anchorDoWhile1')
	, anchorDoWhile1:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'anchorDoWhile2')

	, anchorSwitch:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'anchorSwitch1')
	, anchorSwitch1:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'text', 'tag', 'anchorSwitch2')

	, anchorWith:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'anchorWith1')
	, anchorWith1:	util.map(expressionSetSource, 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'text', 'tag', 'anchorWith2')

	, jsBlock:	util.map(expressionSetSource, 'jsBlock1', 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote', 'text', 'tag')
	, jsGroup:	util.map(expressionSetSource, 'jsGroup1', 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote')
	, jsArray:	util.map(expressionSetSource, 'jsArray1', 'jsBlock', 'jsGroup', 'jsArray', 'jsSingleQuote', 'jsDoubleQuote')
	, jsMember:	util.map(expressionSetSource, 'jsMember', 'jsBlock', 'jsGroup', 'jsArray', 'jsMember1')
	, jsDoubleQuote:	util.map(expressionSetSource, 'jsStringEscaped', 'jsDoubleQuote1')
	, jsSingleQuote:	util.map(expressionSetSource, 'jsStringEscaped', 'jsSingleQuote1')
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


				case 'jsStringEscaped':
				writeContext(token.match[0]);
				break;

				case 'jsMember':
				case 'jsDoubleQuote':
				case 'jsSingleQuote':
				case 'jsGroup':
				case 'jsBlock':
				case 'jsArray':
				pushContext(expressionSetDictionary[token.category], new StackableWriter(getWriter()));
				writeContext(token.match[1]);
				break;

				case 'jsMember1':
				case 'jsDoubleQuote1':
				case 'jsSingleQuote1':
				case 'jsGroup1':
				case 'jsBlock1':
				case 'jsArray1':
				writeContext(token.match[1]);
				popContext();
				break;


				case 'tag':
				pushContext(expressionSetDictionary.tagBody, new StackableWriter(getWriter(), htmlWriteOptions));
				pushContext(expressionSetDictionary.tagHead, new StackableWriter(getWriter(), htmlWriteOptions));
				writeContext(token.match[0]);
				break;

				case 'tag1':
				writeContext(token.match[0]);
				popContext();
				popContext();
				break;

				case 'tag2':
				writeContext(token.match[0]);
				popContext();
				break;

				case 'tag3':
				writeContext(token.match[0]);
				popContext();
				break;

				case 'text':
				pushContext(expressionSetDictionary.text, new StackableWriter(getWriter(), htmlWriteOptions));
				break;

				case 'text1':
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



