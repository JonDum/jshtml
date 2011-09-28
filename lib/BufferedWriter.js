/*!
 * BufferedWriter
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */
var util = require('./util');

function BufferedWriter(writeCallback, options) {
	var options = util.extend({}, options, {
		bufferSize: 0
	});
	
	function write(data) {
		buffer += data;
		if(bufferSize > 0 && buffer.length > bufferSize) {
			flush(bufferSize);
		}
	}
		
	function flush(targetBufferSize) {
		targetBufferSize = targetBufferSize || 0;
		while(targetBufferSize > buffer.length) {
			writeCallback(buffer.substr(0, bufferSize));
			buffer = buffer.substr(bufferSize);
		}
	}
	
	this,write = write;
	this.flush = flush;
}
//exports
module.exports = BufferedWriter;

