/*!
 * jshtml
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */

var fs = require('fs');
var JsHtmlParser = require('./lib/JsHtmlParser');
var util = require('./lib/util');
var cache = {};

function compile(template, options) {
	var fnSrc = '';
	var parser = new JsHtmlParser(function(data) {
		fnSrc += data;
	}, options);
	parser.end(template);
	var fn = new Function('locals', 'context', 'with(locals)with(context){' + fnSrc + '}');

	return function(locals) {
		var buffer = '';

		fn(locals
		, {
			write: function(data) {
				buffer += data;
				}
			, tag: function(tagName) {
				var tagAttributeSetList = [];
				var tagContentList = [];
				var argumentCount = arguments.length;
				var hasContent = false;
				for(var argumentIndex = 1; argumentIndex < argumentCount; argumentIndex++){
					var argument = arguments[argumentIndex];
					switch(typeof argument) {
						case 'object':
						tagAttributeSetList.push(argument);
						break;

						default:
						hasContent = true;
						tagContentList.push(argument);
					}
				}

				buffer += '<';
				buffer += tagName;
				tagAttributeSetList.forEach(function(tagAttributeSet) {
					buffer += ' ';
					buffer += util.htmlAttributeEncode(tagAttributeSet);
				});
				if(hasContent) {
					buffer += '>';

					tagContentList.forEach(function(tagContent) {
						switch(typeof tagContent) {
							case 'function':
							tagContent();
							break;

							default:
							buffer += util.htmlLiteralEncode(tagContent);
						}
					});

					buffer += '</';
					buffer += tagName;
					buffer += '>';
				}
				else{
					buffer += ' />';
				}
				
			}
			, htmlEncode: util.htmlEncode
		});

		return buffer;
	};
}

function render(template, options) {
	var options = util.extend({}, options);
	var fn = options.filename ? (cache[options.filename] || (cache[options.filename] = compile(
			template, options)))
			: compile(template, options);
	return fn.call(options.scope, options.locals || {});
}

exports.compile = compile;
exports.render = render;

