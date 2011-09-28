/*!
 * jshtml
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */

var fs = require('fs');
var JsHtmlParser = require('./lib/JsHtmlParser');
var html = require('./lib/html');
var cache = {};

function compile(template, options) {
	var fnSrc = '';
	var parser = new JsHtmlParser(function(data) {
		fnSrc += data;
	}, options);
	parser.write(template);
	parser.flush();
	var fn = new Function('stream', 'html', 'locals',
			'with(locals) {\n ' + fnSrc + '}\n');

	return function(locals) {
		var buffer = '';
		fn.call(this, {
			write : function(data) {
				buffer += data;
			}
		}, html, locals);

		return buffer;
	};
}

function render(template, options) {
	var options = options || {};
	var fn = options.filename ? (cache[options.filename] || (cache[options.filename] = compile(
			template, options)))
			: compile(template);
	return fn.call(options.scope, options.locals || {});
}

exports.compile = compile;
exports.render = render;
