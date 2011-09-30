var util = require('./util');

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


function HtmlWriter(writeCallback, options) {
	var writer = this;
	var options = util.extend({
		streaming: true
		, whitespaceMode : 'keep'
	}, options);
	var buffer = '';

	function write(data, raw) {
		if(!data) return;
		
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
module.exports = HtmlWriter;

