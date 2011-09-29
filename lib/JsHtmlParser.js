/*!
 * JsHtmlParser
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */

var assert = require('assert');
var Tokenizer = require('./Tokenizer');
var util = require('./util');
var html = require('./html');

const whitespaceModeMethod = {
	'keep': function(data) {
		return data;
	}
	, 'strip': function(data) {
		data = data.replace(/>\s+</g, '><');
		data = data.replace(/\s+</g, '<');
		data = data.replace(/>\s+/g, '>');
		data = data.replace(/^\s+/g, '');
		data = data.replace(/\s+$/g, '');
		return data;
	}
	, 'leading': function(data) {
		data = data.replace(/>\s+</g, '><');
		data = data.replace(/\s+</g, '<');
		data = data.replace(/\s+$/g, '');
		return data;
	}
	, 'trailing': function(data) {
		data = data.replace(/>\s+</g, '><');
		data = data.replace(/>\s+/g, '>');
		data = data.replace(/^\s+/g, '');
		return data;
	}
};

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
	AnchorInlineClose : /^(;?)/,
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

const expressionSetDictionary =  {
	root : util.from(expressionSetSource, 'AnchorEscaped', 'AnchorIfElse', 'AnchorFor',
			'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith',
			'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen'),
	text : util.from(expressionSetSource, 'AnchorEscaped', 'AnchorIfElse', 'AnchorFor',
			'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith',
			'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen',
			'TextClose'),
	tagHead : util.from(expressionSetSource, 'AnchorEscaped', 'AnchorIfElse', 'AnchorFor',
			'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith',
			'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen',
			'TagExit', 'TagExitOpen'),
	tag : util.from(expressionSetSource, 'AnchorEscaped', 'AnchorIfElse', 'AnchorFor',
			'AnchorWhile', 'AnchorDoWhile', 'AnchorSwitch', 'AnchorWith',
			'AnchorGroupOpen', 'AnchorBlockOpen', 'AnchorInlineOpen',
			'TagEnter', 'TagClose'),
	anchorInline : util.from(expressionSetSource, 'JsMemberOpen', 'JsBlockOpen',
			'JsGroupOpen', 'JsArrayOpen', 'AnchorInlineClose'),
	anchorGroup : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen',
			'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorGroupClose'),
	anchorBlock : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen',
			'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen',
			'TagEnter', 'AnchorBlockClose'),
	anchorIfElse1 : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen',
			'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen',
			'AnchorIfElse1'),
	anchorIfElse2 : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen',
			'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen',
			'TextOpen', 'TagEnter', 'AnchorIfElse2'),
	anchorIfElse3 : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen',
			'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen',
			'TextOpen', 'TagEnter', 'AnchorIfElse3'),
	anchorFor1 : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen',
			'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorFor1'),
	anchorFor2 : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen',
			'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen',
			'TagEnter', 'AnchorFor2'),
	anchorWhile1 : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen',
			'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorWhile1'),
	anchorWhile2 : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen',
			'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen',
			'TagEnter', 'AnchorWhile2'),
	anchorDoWhile1 : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen',
			'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen',
			'TextOpen', 'TagEnter', 'AnchorDoWhile1'),
	anchorDoWhile2 : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen',
			'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen',
			'AnchorDoWhile2'),
	anchorSwitch1 : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen',
			'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen',
			'AnchorSwitch1'),
	anchorSwitch2 : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen',
			'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen',
			'TextOpen', 'TagEnter', 'AnchorSwitch2'),
	anchorWith1 : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen',
			'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'AnchorWith1'),
	anchorWith2 : util.from(expressionSetSource, 'JsBlockOpen', 'JsGroupOpen', 'JsArrayOpen',
			'JsSingleQuoteOpen', 'JsDoubleQuoteOpen', 'TextOpen',
			'TagEnter', 'AnchorWith2'),
	jsBlock : util.from(expressionSetSource, 'JsBlockClose', 'JsBlockOpen', 'JsGroupOpen',
			'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen',
			'TextOpen', 'TagEnter'),
	jsGroup : util.from(expressionSetSource, 'JsGroupClose', 'JsBlockOpen', 'JsGroupOpen',
			'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen'),
	jsArray : util.from(expressionSetSource, 'JsArrayClose', 'JsBlockOpen', 'JsGroupOpen',
			'JsArrayOpen', 'JsSingleQuoteOpen', 'JsDoubleQuoteOpen'),
	jsMember : util.from(expressionSetSource, 'JsMemberOpen', 'JsBlockOpen', 'JsGroupOpen',
			'JsArrayOpen', 'JsMemberClose'),
	jsDoubleQuote : util.from(expressionSetSource, 'JsStringEscaped', 'JsDoubleQuoteClose'),
	jsSingleQuote : util.from(expressionSetSource, 'JsStringEscaped', 'JsSingleQuoteClose')
};

function HtmlWriter(writeCallback, options) {
	var writer = this;
	var options = util.overload({
		streaming: true
		, whitespaceMode : 'keep'
	}, options);
	var buffer = '';
	function write(data, raw) {
		if(raw) {
			buffer += data;
		}
		else {
			buffer += 'write(' 
			buffer += JSON.stringify(whitespaceModeMethod[options.whitespaceMode](data));
			buffer += ')';
			buffer += ';';
		}
		options.streaming && flush();
	}
	
	function flush() {
		if(buffer) {
			writeCallback.call(writer, buffer);
			buffer = '';
		}
	}
	
	function setOptions(value){
		util.overload(options, value);
	}

	this.flush = flush;
	this.write = write;
	this.setOptions = setOptions;
}

function JsWriter(writeCallback, options) {
	var writer = this;
	var options = util.overload({
		streaming: true
		, echo: false
	}, options);
	var buffer = '';
	
	function write(data, raw) {
		if(raw) {
			buffer += data;
		}
		else {
			buffer += data;
		}
		options.streaming && flush();
	}
	
	function flush() {
		if(buffer) {
			if(options.echo) {
				writeCallback.call(writer, 'write(htmlEncode(' + buffer + '));');
			}
			else {
				writeCallback.call(writer, buffer);
			}
		buffer = '';
		}
	}
	
	function setOptions(value){
		util.overload(options, value);
	}

	this.flush = flush;
	this.write = write;
	this.setOptions = setOptions;
}

function JsHtmlParser(writeCallback, options) {
	var parser = this;
	var options = util.overload({}, options);
	var tokenizer = new Tokenizer(onToken, options);
	var currentContext = {
		expressionSet: expressionSetDictionary.root
		, writer: new HtmlWriter(onWrite, options)
		};
	var contextStack = [currentContext];
	tokenizer.expressionSet = currentContext.expressionSet;

	function pushContext(expressionSet, Writer, writerOptions) {
		currentContext = (function(currentContext){
			return {
				expressionSet: expressionSet
				, writer: new Writer(function(data) {
					currentContext.writer.write(data, true);
				}, util.overload({}, options, writerOptions))
			}
		})(currentContext);
		
		contextStack.unshift(currentContext);
		tokenizer.expressionSet = currentContext.expressionSet;
	}

	function popContext() {
		currentContext.writer.flush();
		contextStack.shift();
		currentContext = contextStack[0];
		tokenizer.expressionSet = currentContext.expressionSet;
	}
	
	function writeContext(data) {
		if(!data) return;
		currentContext.writer.write(data);
	}

	function onWrite(data) {
		writeCallback.call(parser, data);
	}
	
	function onToken(token, buffer) {
		if (token) {
			if (token.match) {
				writeContext(buffer.substr(0, token.match.index));
			}
			switch (token.category) {
			case 'JsStringEscaped':
				writeContext(token.match[0]);
				break;
			case 'JsDoubleQuoteOpen':
				pushContext(expressionSetDictionary.jsDoubleQuote, JsWriter);
				writeContext(token.match[0]);
				break;
			case 'JsDoubleQuoteClose':
				writeContext(token.match[0]);
				popContext();
				break;
			case 'JsSingleQuoteOpen':
				pushContext(expressionSetDictionary.jsSingleQuote, JsWriter);
				writeContext(token.match[0]);
				break;
			case 'JsSingleQuoteClose':
				writeContext(token.match[0]);
				popContext();
				break;
			case 'JsGroupOpen':
				pushContext(expressionSetDictionary.jsGroup, JsWriter);
				writeContext(token.match[0]);
				break;
			case 'JsGroupClose':
				writeContext(token.match[0]);
				popContext();
				break;
			case 'JsBlockOpen':
				pushContext(expressionSetDictionary.jsBlock, JsWriter);
				writeContext(token.match[0]);
				break;
			case 'JsBlockClose':
				writeContext(token.match[0]);
				popContext();
				break;
			case 'JsArrayOpen':
				pushContext(expressionSetDictionary.jsArray, JsWriter);
				writeContext(token.match[0]);
				break;
			case 'JsArrayClose':
				writeContext(token.match[0]);
				popContext();
				break;
			case 'JsMemberOpen':
				pushContext(expressionSetDictionary.jsMember, JsWriter);
				writeContext(token.match[0]);
				break;
			case 'JsMemberClose':
				popContext();
				break;
			case 'AnchorEscaped':
				writeContext(token.match[1]);
				break;
			case 'AnchorIfElse':
				pushContext(expressionSetDictionary.anchorIfElse1, JsWriter);
				writeContext('if(');
				break;
			case 'AnchorIfElse1':
				writeContext(') ');
				popContext();
				pushContext(expressionSetDictionary.anchorIfElse2, JsWriter);
				writeContext('{');
				break;
			case 'AnchorIfElse2':
				writeContext('}');
				popContext();
				if (token.match[1]) {
					pushContext(expressionSetDictionary.anchorIfElse3, JsWriter);
					writeContext('else {');
				}
				break;
			case 'AnchorIfElse3':
				writeContext('}');
				popContext();
				break;
			case 'AnchorFor':
				pushContext(expressionSetDictionary.anchorFor1, JsWriter);
				writeContext('for(');
				break;
			case 'AnchorFor1':
				writeContext(') ');
				popContext();
				pushContext(expressionSetDictionary.anchorFor2, JsWriter);
				writeContext('{');
				break;
			case 'AnchorFor2':
				writeContext('}');
				popContext();
				break;
			case 'AnchorWhile':
				pushContext(expressionSetDictionary.anchorWhile1, JsWriter);
				writeContext('while(');
				break;
			case 'AnchorWhile1':
				writeContext(') ');
				popContext();
				pushContext(expressionSetDictionary.anchorWhile2, JsWriter);
				writeContext('{');
				break;
			case 'AnchorWhile2':
				writeContext('}');
				popContext();
				break;
			case 'AnchorDoWhile':
				pushContext(expressionSetDictionary.anchorDoWhile1, JsWriter);
				writeContext('do {');
				break;
			case 'AnchorDoWhile1':
				writeContext('} ');
				popContext();
				pushContext(expressionSetDictionary.anchorDoWhile2, JsWriter);
				writeContext('while(');
				break;
			case 'AnchorDoWhile2':
				writeContext(');');
				popContext();
				break;
			case 'AnchorSwitch':
				pushContext(expressionSetDictionary.anchorSwitch1, JsWriter);
				writeContext('switch(');
				break;
			case 'AnchorSwitch1':
				writeContext(') ');
				popContext();
				pushContext(expressionSetDictionary.anchorSwitch2, JsWriter);
				writeContext('{');
				break;
			case 'AnchorSwitch2':
				writeContext('}');
				popContext();
				break;
			case 'AnchorWith':
				pushContext(expressionSetDictionary.anchorWith1, JsWriter);
				writeContext('with(');
				break;
			case 'AnchorWith1':
				writeContext(') ');
				popContext();
				pushContext(expressionSetDictionary.anchorWith2, JsWriter);
				writeContext('{');
				break;
			case 'AnchorWith2':
				writeContext('}');
				popContext();
				break;
			case 'AnchorGroupOpen':
				pushContext(expressionSetDictionary.anchorGroup, JsWriter, {echo:true, streaming:false});
				break;
			case 'AnchorGroupClose':
				popContext();
				break;
			case 'AnchorBlockOpen':
				pushContext(expressionSetDictionary.anchorBlock, JsWriter);
				break;
			case 'AnchorBlockClose':
				popContext();
				break;
			case 'AnchorInlineOpen':
				pushContext(expressionSetDictionary.anchorInline, JsWriter, {streaming:false});
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
				currentContext.writer.setOptions({echo: !token.match[1]});
				popContext();
				break;
			case 'TagEnter':
				pushContext(expressionSetDictionary.tag, HtmlWriter);
				pushContext(expressionSetDictionary.tagHead, HtmlWriter);
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
				pushContext(expressionSetDictionary.text, HtmlWriter);
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

	function flush() {
		tokenizer.flush();
		assert.equal(1, contextStack.length, 'Parse error.');
		currentContext.writer.flush();
		writeCallback.call(tokenizer, '}');
	}

	function write(data) {
		tokenizer.write(data);
	}

	writeCallback.call(tokenizer, 'var context = arguments[0];');
	writeCallback.call(tokenizer, 'with(context){');

	this.flush = flush;
	this.write = write;
}

// exports
module.exports = JsHtmlParser;


