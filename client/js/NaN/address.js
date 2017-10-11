"use strict";
var qora_1 = require('./qora');
var utils_1 = require('./utils');
var Address = (function () {
    function Address(address, accountSeed, keyPair, base58addressSeed) {
        this.data = {
            address: address,
            balance: '0.00000000',
            confirmedBalance: '0.00000000',
            generatingBalance: '0.00000000',
            b58: base58addressSeed,
            seed: accountSeed,
            keyPair: keyPair,
        };
        this.getBalances();
    }
    Address.prototype.getBalances = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getBalance().then(function () {
                _this.getConfirmedBalance().then(function () {
                    _this.getGeneratingBalance().then(function () {
                        resolve();
                    }).catch(function (e) { return reject(e); });
                }).catch(function (e) { return reject(e); });
            }).catch(function (e) { return reject(e); });
        });
    };
    Address.prototype.getBalance = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            qora_1.qora.doRequest("/addresses/balance/" + _this.data.address).then(function (balance) {
                balance = utils_1.utils.toDecimalNoRound(balance);
                _this.data.balance = balance;
                resolve(balance);
            }).catch(function (data) {
                console.log(data);
            });
        });
    };
    Address.prototype.getConfirmedBalance = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            qora_1.qora.doRequest("/addresses/balance/" + _this.data.address + "/1").then(function (balance) {
                balance = utils_1.utils.toDecimalNoRound(balance);
                _this.data.confirmedBalance = balance;
                resolve(balance);
            }).catch(function (data) {
                console.log(data);
            });
        });
    };
    Address.prototype.getGeneratingBalance = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            qora_1.qora.doRequest("/addresses/generatingbalance/" + _this.data.address).then(function (balance) {
                balance = utils_1.utils.toDecimalNoRound(balance);
                _this.data.generatingBalance = balance;
                resolve(balance);
            }).catch(function (data) {
                console.log(data);
            });
        });
    };
    Address.prototype.get = function () {
        return this.data;
    };
    return Address;
}());
exports.Address = Address;
