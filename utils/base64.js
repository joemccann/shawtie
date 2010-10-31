/*
Copyright 2010 Thomas Debarochez. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
 
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/

// http://github.com/tdebarochez/node-base64.js

var cb64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    cbi64 = {};
for (var i in cb64) {
  if (!isNaN(i)) {
    cbi64[cb64[i]] = i;
  }
}

function encode(data) {
  var output = '', l = data.length;
  do {
    var char1 = data.charCodeAt(data.length - l) >> 2,
        char2 = (data.charCodeAt(data.length - l) & 0x03) << 4 | (data.charCodeAt(data.length - l + 1) & 0xf0) >> 4,
        char3 = (data.charCodeAt(data.length - l + 1) & 0x0f) << 2 | (data.charCodeAt(data.length - l + 2) & 0xc0) >> 6,
        char4 = data.charCodeAt(data.length - l + 2) & 0x3f;
    output += cb64[char1] + cb64[char2];
    if (l > 3) {
      output += cb64[char3];
      output += cb64[char4];
      l -= 2;
    }
    else {
      output += --l > 0 ? cb64[char3] : '=';
      output += --l > 0 ? cb64[char4] : '=';
    }
  } while (--l > 0);
  return output;
}

function decode(str) {
  var output = '', str = str.replace(/([\n\r]+)/gi, ''), l = str.length;
  if (l < 4 || l%4 !== 0) {
    return undefined;
  }
  var i = 0;
  do {
    var char1 = cbi64[str[str.length - l]],
        char2 = cbi64[str[str.length - l + 1]],
        char3 = cbi64[str[str.length - l + 2]],
        char4 = cbi64[str[str.length - l + 3]];
    char1 = char1 > 0 ? char1 : 0;
    char2 = char2 > 0 ? char2 : 0;
    char3 = char3 > 0 ? char3 : 0;
    char4 = char4 > 0 ? char4 : 0;
    output += String.fromCharCode((char1 << 2 | char2 >> 4) & 0xff);
    if (l > 4 || char2 > 0 && char3 > 0) {
      output += String.fromCharCode((char2 << 4 | char3 >> 2) & 0xff);
    }
    if (l > 4 || char3 > 0 && char4 > 0) {
      output += String.fromCharCode((((char3 << 6) & 0xc0) | char4) & 0xff);
    }
  } while ((l -= 4) > 0);
  return output;
}

exports.decode = decode;
exports.encode = encode;
