"use strict";
var utils_1 = require("../helpers/utils");
var addresses_1 = require('./addresses');
var Qora = (function () {
    function Qora() {
        this.localAPILink = 'http://localhost:9090/index/api.html';
        this.remoteAPILink = 'http://qora.online:9090/index/api.html';
        this.addresses = new addresses_1.Addresses;
    }
    Qora.prototype.doRequest = function (path, type, params) {
        var _this = this;
        if (type === void 0) { type = 'get'; }
        if (params === void 0) { params = {}; }
        return new Promise(function (resolve, reject) {
            $.post(_this.localAPILink, {
                type: type,
                apiurl: path,
                json: JSON.stringify(params)
            }).done(function (data) {
                if (data.type === 'success') {
                    var res = data.result;
                    try {
                        res = JSON.parse(data.result);
                    }
                    catch (e) {
                        console.log(e);
                    }
                    resolve(res);
                }
                else if (data.type === 'error') {
                    console.log(data);
                    reject(data);
                }
                else {
                    console.log(data);
                    reject(data);
                }
            });
        });
    };
    Qora.prototype.getWallet = function (walletPassphrase) {
        var byteSeed = new Uint8Array(SHA256.digest(SHA256.digest(walletPassphrase)));
        var base58BaseSeed = Base58.encode(byteSeed);
        return this.doAccounts(base58BaseSeed);
    };
    Qora.prototype.getStatus = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.doRequest('/qora/status').then(function (status) { return resolve(status); }).catch(function (e) { return reject(e); });
        });
    };
    Qora.prototype.getPeers = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.doRequest('/peers').then(function (peers) { return resolve(peers); }).catch(function (e) { return reject(e); });
        });
    };
    Qora.prototype.doProcess = function (txRaw) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: 'post',
                headers: {
                    "X-FORWARDED-FOR": "127.0.0.1"
                },
                dataType: 'json',
                url: _this.localAPILink,
                data: {
                    type: 'post',
                    apiurl: '/transactions/process',
                    json: txRaw
                },
                success: function (data) {
                    if (data.type === 'apicallerror') {
                        return reject(data.errordetail);
                    }
                    if (data.type === 'success') {
                        if (isNaN(data.result)) {
                            resolve(data.result);
                        }
                        else {
                            switch (data.result) {
                                case "1":
                                    resolve('VALIDATE_OK');
                                    break;
                                case "2":
                                    resolve('INVALID_ADDRESS');
                                    break;
                                case "3":
                                    resolve('NEGATIVE_AMOUNT');
                                    break;
                                case "4":
                                    resolve('NEGATIVE_FEE');
                                    break;
                                case "5":
                                    resolve('NO_BALANCE');
                                    break;
                                case "6":
                                    resolve('INVALID_REFERENCE');
                                    break;
                                case "7":
                                    resolve('INVALID_NAME_LENGTH');
                                    break;
                                case "8":
                                    resolve('INVALID_VALUE_LENGTH');
                                    break;
                                case "9":
                                    resolve('NAME_ALREADY_REGISTRED');
                                    break;
                                case "15":
                                    resolve('INVALID_AMOUNT');
                                    break;
                                case "17":
                                    resolve('NAME_NOT_LOWER_CASE');
                                    break;
                                case "27":
                                    resolve('INVALID_DATA_LENGTH');
                                    break;
                                case "34":
                                    resolve('INVALID_PAYMENTS_LENGTH');
                                    break;
                                case "40":
                                    resolve('FEE_LESS_REQUIRED');
                                    break;
                                case "41":
                                    resolve('INVALID_RAW_DATA');
                                    break;
                                case "1000":
                                    resolve('NOT_YET_RELEASED');
                                    break;
                            }
                        }
                    }
                }, fail: function (xhr, textStatus, errorThrown) {
                    reject(xhr.responseText);
                }
            });
        });
    };
    Qora.prototype.doAccounts = function (base58BaseSeed) {
        var countAddrs = 10;
        var seed = Base58.decode(base58BaseSeed);
        if (seed.length !== 32) {
            alert('invalid seed!');
            return;
        }
        this.addresses.empty();
        for (var nonce = 0; nonce < countAddrs; nonce++) {
            var accountSeed = this.generateAccountSeed(seed, nonce, false);
            var keyPair = this.getKeyPairFromSeed(accountSeed);
            var base58addressSeed = Base58.encode(accountSeed);
            var address = this.getAccountAddressFromPublicKey(keyPair.publicKey);
            this.addresses.add(address, accountSeed, keyPair, base58addressSeed);
        }
    };
    Qora.prototype.generateAccountSeed = function (seed, nonce, returnBase58) {
        if (returnBase58 === void 0) { returnBase58 = false; }
        if (typeof (seed) === 'string') {
            seed = new Uint8Array(Base58.decode(seed));
        }
        var nonceBytes = utils_1.utils.int32ToBytes(nonce);
        var resultSeed;
        resultSeed = utils_1.utils.appendBuffer(resultSeed, nonceBytes);
        resultSeed = utils_1.utils.appendBuffer(resultSeed, seed);
        resultSeed = utils_1.utils.appendBuffer(resultSeed, nonceBytes);
        if (returnBase58) {
            return Base58.encode(SHA256.digest(SHA256.digest(resultSeed)));
        }
        else {
            return new SHA256.digest(SHA256.digest(resultSeed));
        }
    };
    Qora.prototype.getKeyPairFromSeed = function (seed, returnBase58) {
        if (returnBase58 === void 0) { returnBase58 = false; }
        if (typeof (seed) === 'string') {
            seed = new Uint8Array(Base58.decode(seed));
        }
        var keyPair = nacl.sign.keyPair.fromSeed(seed);
        var base58privateKey = Base58.encode(keyPair.secretKey);
        var base58publicKey = Base58.encode(keyPair.publicKey);
        if (returnBase58) {
            return {
                privateKey: Base58.encode(keyPair.secretKey),
                publicKey: Base58.encode(keyPair.publicKey)
            };
        }
        else {
            return {
                privateKey: keyPair.secretKey,
                publicKey: keyPair.publicKey
            };
        }
    };
    Qora.prototype.getAccountAddressFromPublicKey = function (publicKey) {
        var ADDRESS_VERSION = 58;
        if (typeof (publicKey) === 'string') {
            publicKey = Base58.decode(publicKey);
        }
        var publicKeyHashSHA256 = SHA256.digest(publicKey);
        var ripemd160 = new RIPEMD160();
        var publicKeyHash = ripemd160.digest(publicKeyHashSHA256);
        var addressArray;
        addressArray = utils_1.utils.appendBuffer(addressArray, [ADDRESS_VERSION]);
        addressArray = utils_1.utils.appendBuffer(addressArray, publicKeyHash);
        var checkSum = SHA256.digest(SHA256.digest(addressArray));
        addressArray = utils_1.utils.appendBuffer(addressArray, checkSum.subarray(0, 4));
        return Base58.encode(addressArray);
    };
    return Qora;
}());
exports.qora = new Qora;
