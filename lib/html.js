/*!
 * html
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */

/**
 * 
 */
var special = {
    34: '&quot;',
    38: '&amp;',
    //39: '&apos;',
    60: '&lt;',
    62: '&gt;',
    160: '&nbsp;'
};

/**
 * 
 */
var htmlReady = {};

/**
 * html-encode a string if the htmlReady property is not set
 * 
 * @param value		the string to encode
 * @return			the html encoded string, with the htmlReady property set
 */
function encode(value) {
    if (!value) return '';
    if (value[htmlReady]) return value;
    var buffer = '';
    var charList = String(value);
    var charCount = charList.length;
    for (var charIndex = 0; charIndex < charCount; charIndex++) {
        var charCode = charList.charCodeAt(charIndex);
        if (charCode in special) {
            buffer += special[charCode];
        }
        else {
            //if (charCode < 32) continue;
            if (charCode > 127) buffer += '&#' + charCode.toString() + ';';
            else buffer += String.fromCharCode(charCode);
        }
    }
    buffer[htmlReady] = true;
    return buffer;
}

/**
 * sets the htmlReady property to prevent a string from being encoded twice
 * 
 * @param value		string that should not be encoded
 * @return string	with the htmlReady property set
 */
function raw(value) {
    if (!value) return '';
    if (value[htmlReady]) return value;
    var buffer = new String(value);
    buffer[htmlReady] = true;
    return buffer;
}

/**
 * 
 */
var tagStack = [];

/**
 * Self-closing tag
 * 
 * @param tag			the name of the tag ('img')
 * @param attributeSet	attribute map ({src: 'http://luvdasun.com/favicon.ico', alt: 'LuvDaSun'})
 * @return				returns html for the tag with the attributes (<img src="http://luvdasun.com/favicon.ico" alt="LuvDaSun" />)
 */
function atomicTag(tag, attributeSet) {
    var attributeText = attr(attributeSet);
    return raw('<' + tag + (attributeText ? (' ' + attributeText) : '') + '/>');
}
/**
 * Opening tag
 * 
 * @param tag			name of the tag (a)
 * @param attributeSet	attribute map ({href: 'http://luvdasun.com/', target: '_blank'})
 * @return				returns the html for the tag (<a href="http://luvdasun.com/" target="_blank">)
 */
function openTag(tag, attributeSet) {
    tagStack.unshift(tag);
    var attributeText = attr(attributeSet);
    return raw('<' + tag + (attributeText ? (' ' + attributeText) : '') + '>');
}


/**
 * Write an closing tag for the last tag opened
 * 
 * @return		the closing tag for the last opened tag (</a>)
 */
function closeTag() {
    var tag = tagStack.shift(tag);
    return raw('</' + tag + '>');
}


/**
 * @deprecated		behavior will change in the future
 */
function tag() {
    if (arguments.length == 1) {
        if (arguments[0] === true) return closeTag();
        return openTag(arguments[0]);
    }
    if (arguments.length == 2) {
        if (arguments[1] === true) return atomicTag(arguments[0]);
        if (typeof arguments[1] != 'Object') return raw(openTag(arguments[0]) + encode(arguments[1]) + closeTag());
        return openTag(arguments[0], arguments[1]);
    }
    if (arguments.length == 3) {
        if (arguments[2] === true) return atomicTag(arguments[0], arguments[1]);
        if (typeof arguments[2] != 'Object') return raw(openTag(arguments[0], arguments[1]) + encode(arguments[2]) + closeTag());
    }
    throw 'error';
}

/**
 * build attribute string for use in html tags
 * 
 * @param attributeSet		the attribute map (type: 'checkbox', checked: true)
 * @return					the attributes as a string (type="checkbox" checked="checked")
 */
function attr(attributeSet) {
    var attributeList = [];
    for (var attributeName in attributeSet) {
        var attributeValue = attributeSet[attributeName];
        switch (attributeValue) {
        case true:
            attributeList.push('' + attributeName + '="' + attributeName + '"');
            break;
        case false:
            break;
        default:
            attributeList.push('' + attributeName + '="' + encode(attributeValue) + '"');
        }
    }
    return raw(attributeList.join(' '));
}
//exports
exports.encode = encode;
exports.raw = raw;
exports.tag = tag;
exports.attr = attr;