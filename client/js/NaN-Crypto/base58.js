"use strict";
var Base58 = (function () {
    function Base58() {
        this.ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        this.ALPHABET_MAP = {};
        var i = 0;
        while (i < this.ALPHABET.length) {
            this.ALPHABET_MAP[this.ALPHABET.charAt(i)] = i;
            i++;
        }
    }
    Base58.prototype.encode = function (buffer) {
        var _this = this;
        buffer = new Uint8Array(buffer);
        if (buffer.length === 0) {
            return '';
        }
        var digits = [0];
        var i = 0;
        while (i < buffer.length) {
            var j = 0;
            while (j < digits.length) {
                digits[j] <<= 8;
                j++;
            }
            digits[0] += buffer[i];
            var carry = 0;
            j = 0;
            while (j < digits.length) {
                digits[j] += carry;
                carry = (digits[j] / 58) | 0;
                digits[j] %= 58;
                ++j;
            }
            while (carry) {
                digits.push(carry % 58);
                carry = (carry / 58) | 0;
            }
            i++;
        }
        i = 0;
        while (buffer[i] === 0 && i < buffer.length - 1) {
            digits.push(0);
            i++;
        }
        return digits.reverse().map(function (digit) {
            return _this.ALPHABET[digit];
        }).join('');
    };
    return Base58;
}());
exports.Base58 = Base58;
