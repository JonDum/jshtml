/*!
 * util
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */

function extend(o) {
    var argumentCount = arguments.length;
    for (var argumentIndex = 1; argumentIndex < argumentCount; argumentIndex++) {
        var argument = arguments[argumentIndex];
        for (var argumentKey in argument) {
            if (!(argumentKey in o)) o[argumentKey] = argument[argumentKey];
        }
    }
    return o;
}

const htmlSpecial = {
    34: '&quot;',
    38: '&amp;',
    //39: '&apos;',
    60: '&lt;',
    62: '&gt;',
    160: '&nbsp;'
};
function htmlEncode(value) {
    var buffer = '';
    var charList = new String(value);
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
    return buffer;
}

//exports
exports.extend = extend;
exports.htmlEncode = htmlEncode;


