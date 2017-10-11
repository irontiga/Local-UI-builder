function doAccountAddressFromPublicKey(base58AccountPublicKey) {

    var base58AccountPublicKey = document.getElementById('base58AccountPublicKey').value;

    if(Base58.decode(base58AccountPublicKey).length != 32) {
        document.getElementById('base58AccountAddress').value = '';
        alert("invalid PublicKey!");
        return;
    }
    
    var base58AccountAddress = getAccountAddressFromPublicKey(base58AccountPublicKey);
    document.getElementById('base58AccountAddress').value = base58AccountAddress;
}

function doBrain(brainWalletPassphrase, addressCnt){
    //var brainWalletPassphrase = document.getElementById('brainWalletPassphrase').value;

    /*if(brainWalletPassphrase.length < 8) {
        alert("invalid passphrase length!\nIt should be at least 8 characters.");
        return;
    }*/

    var byteSeed = new Uint8Array(SHA256.digest(SHA256.digest(brainWalletPassphrase)));
    var base58BaseSeed = Base58.encode(byteSeed);

    // Gets 10 accounts
    var accounts = doAccounts(base58BaseSeed, addressCnt);
    return accounts;
}

function doAccountFromSeed(base58AccountSeed){
    if(base58AccountSeed) {
        document.getElementById('base58AccountSeed').value = base58AccountSeed;
    } else {
        base58AccountSeed = document.getElementById('base58AccountSeed').value;
    }

    if(Base58.decode(base58AccountSeed).length != 32) {
        alert("invalid seed!");
        return;
    }

    keyPair = getKeyPairFromSeed(base58AccountSeed, false);

    var base58AccountAddress = getAccountAddressFromPublicKey(keyPair.publicKey);

    var base58AccountPublicKey = Base58.encode(keyPair.publicKey);
    var base58AccountPrivateKey = Base58.encode(keyPair.privateKey);

}

function doAccounts(base58BaseSeed, addressCnt){

    if(base58BaseSeed == '') {
        return;
    }

    //countAddrs = 10;

    if(isNaN(addressCnt) || addressCnt < 1) {
        alert("invalid count!");
        return;
    }

    seed = Base58.decode(base58BaseSeed);

    if(seed.length != 32) {
        alert("invalid seed!");
        return;
    }
    
    var addresses = [];

    for (var nonce = 0; nonce < addressCnt; nonce ++) {
        var accountSeed = generateAccountSeed(seed, nonce, false);
        var keyPair = getKeyPairFromSeed(accountSeed);
        var base58addressSeed = Base58.encode(accountSeed);

        var address = getAccountAddressFromPublicKey(keyPair.publicKey);
        addresses.push({
            address: address,
            //accountSeed: accountSeed,
            keyPair: keyPair,
            base58addressSeed: base58addressSeed
        })
        /*
        $("#selected-name").append("<option class=\"user-menu_username\" value="+base58addressSeed+">"+address+"</option>")
        */
    }
    
    return addresses;
}
