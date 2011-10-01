/*!
 * Parser
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */

var assert = require('assert');
var Tokenizer = require('./Tokenizer');
var util = require('./util');

function Parser(parseCallback, rootContext, options) {
	var parser = this;
	var currentContext = rootContext;
	var contextStack = [currentContext];
	var tokenizer = new Tokenizer(onToken, options);
	tokenizer.setExpressionSet(currentContext.expressionSet);

	function onToken(token, buffer) {
		if (token) {
			if (token.match) {
				writeContext(buffer.substr(0, token.match.index));
			}
	        parseCallback.call(parser, token);
		} 
		else {
			writeContext(buffer);
		}
	}

	function pushContext(expressionSet, writer) {
		currentContext = {
			expressionSet: expressionSet
			, writer: writer
		};
		contextStack.unshift(currentContext);
		tokenizer.setExpressionSet(currentContext.expressionSet);
	}

	function popContext() {
		currentContext.writer.end('');
		contextStack.shift();
		currentContext = contextStack[0];
		tokenizer.setExpressionSet(currentContext.expressionSet);
	}
	
	function writeContext(data) {
		currentContext.writer.write(util.str(data));
	}

	function end(data) {
		tokenizer.end(data);
		assert.equal(1, contextStack.length, 'Parse error.');
		currentContext.writer.end();
	}

	function getExpressionSet(){
		return currentContext.expressionSet;
	}
	function getWriter(){
		return currentContext.writer;
	}

	util.extend(this, tokenizer, {
		end: end
		, getExpressionSet: getExpressionSet
		, getWriter: getWriter
		, pushContext: pushContext
		, popContext: popContext
		, writeContext: writeContext
	});
}

// exports
module.exports = Parser;



