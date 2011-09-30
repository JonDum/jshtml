var util = require('./util');

function JsWriter(writeCallback, options) {
	var writer = this;
	var options = util.extend({
		streaming: true
		, echo: false
	}, options);
	var buffer = '';
	
	function write(data, raw) {
		if(!data) return;

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

	function end(data) {
		write(data);
		flush();
	}
	
	function setOptions(value){
		util.extend(options, value);
	}

	util.extend(this, {
		end: end
		, write: write
		, setOptions: setOptions
	});
}


// exports
module.exports = JsWriter;

