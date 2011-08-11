/*!
 * html
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */
var special = {
    34: '&quot;',
    38: '&amp;',
    //39: '&apos;',
    60: '&lt;',
    62: '&gt;',
    160: '&nbsp;'
};
var htmlReady = {};

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

function raw(value) {
    if (!value) return '';
    if (value[htmlReady]) return value;
    var buffer=new String(value);
    buffer[htmlReady] = true;
    return buffer;
}
var tagStack = [];

function atomicTag(tag, attributeSet) {
    var attributeText = attr(attributeSet);
    return raw('<' + tag + (attributeText ? (' ' + attributeText ): '')  +'/>');
}

function openTag(tag, attributeSet) {
    tagStack.unshift(tag);
    var attributeText = attr(attributeSet);
    return raw('<' + tag + (attributeText ? (' ' + attributeText) : '') + '>');
}

function closeTag() {
    var tag = tagStack.shift(tag);
    return raw('</' + tag + '>');
}

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