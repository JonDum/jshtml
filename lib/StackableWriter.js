/*!
 * StackableWriter
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */

var assert = require('assert');
var util = require('./util');

function StackableWriter(writeCallback, options, state) {
	var writer = this;
	var options = util.extend({
		streaming: true
		, writeFilter: function(data, state) {return data;}
		, flushFilter: function(data, state) {return data;}
	}, options);
	var buffer = '';

	function write(data) {
		call(writer, options.writeFilter(util.str(data), state));
	}
	
	function flush() {
		writeCallback.call(writer, options.flushFilter(buffer, state));
		buffer = '';
	}
	
	function end(data) {
		write(data);
		flush();
		util.extend(this, {
			end: readerEnded
			, write: readerEnded
			, setOptions: readerEnded
			, call: readerEnded
		});
	}
	
	function setOptions(value){
		util.extend(options, value);
	}

	function call(writer, data) {
		buffer += util.str(data);
	}

	function readerEnded() {
		throw 'writer has ended';
	}

	util.extend(this, {
		end: end
		, write: write
		, setOptions: setOptions
		, call: call
	});
}


// exports
module.exports = StackableWriter;

