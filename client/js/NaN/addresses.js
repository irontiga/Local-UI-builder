"use strict";
var address_1 = require('./address');
var Addresses = (function () {
    function Addresses() {
    }
    Addresses.prototype.add = function (address, accountSeed, keyPair, base58addressSeed) {
        this.list.push(new address_1.Address(address, accountSeed, keyPair, base58addressSeed));
    };
    Addresses.prototype.empty = function () {
        this.list = [];
    };
    Addresses.prototype.get = function (index) {
        if (index === void 0) { index = 0; }
        return this.list[index];
    };
    Addresses.prototype.getAll = function () {
        return this.list;
    };
    return Addresses;
}());
exports.Addresses = Addresses;
