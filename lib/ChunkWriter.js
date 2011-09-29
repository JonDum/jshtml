/*!
 * ChunkWriter
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */
var util = require('./util');

function ChunkWriter(chunkCallback, options) {
	var writer = this;
	var options = util.extend({}, options, {
		chunkSize: 1024
	});
	var chunk = '';

	function write(data) {
		chunk += data;
		if(options.chunkSize > 0 && chunk.length > options.chunkSize) {
			flush(options.chunkSize);
		}
	}

	function flush(chunkSize) {
		var chunkSize = chunkSize || 0;
		while(chunk.length > chunkSize) {
			chunkCallback.call(writer, chunk.substr(0, options.chunkSize));
			chunk = chunk.substr(options.chunkSize);
		}
	}
	
	this.write = write;
	this.flush = flush;
}
//exports
module.exports = ChunkWriter;

