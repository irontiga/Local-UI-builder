"use strict";
var Utils = (function () {
    function Utils() {
    }
    Utils.prototype.appendBuffer = function (buffer1, buffer2) {
        buffer1 = new Uint8Array(buffer1);
        buffer2 = new Uint8Array(buffer2);
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(buffer1, 0);
        tmp.set(buffer2, buffer1.byteLength);
        return tmp;
    };
    Utils.prototype.int32ToBytes = function (word) {
        var byteArray = [];
        for (var b = 0; b < 32; b += 8) {
            byteArray.push((word >>> (24 - b % 32)) & 0xFF);
        }
        return byteArray;
    };
    Utils.prototype.int64ToBytes = function (int64) {
        var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
        for (var index = 0; index < byteArray.length; index++) {
            var byte = int64 & 0xff;
            byteArray[byteArray.length - index - 1] = byte;
            int64 = (int64 - byte) / 256;
        }
        return byteArray;
    };
    Utils.prototype.toDecimalNoRound = function (num, decimals) {
        if (decimals === void 0) { decimals = 8; }
        return (Math.floor(num * 100) / 100).toFixed(decimals);
    };
    return Utils;
}());
exports.utils = new Utils;
