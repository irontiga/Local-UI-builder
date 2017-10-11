function doRegisterName(name, value) {

  var base58SenderAccountSeed = $('#selected-name option:selected').val();

  var senderAccountSeed = Base58.decode(base58SenderAccountSeed);

  if(senderAccountSeed.length != 32) {
    document.getElementById('result').innerHTML = "<div class=\"alert alert-error\" role=\"alert\">invalid seed<br></div>"
    return;
  }

  keyPair = getKeyPairFromSeed(senderAccountSeed);

  var base58SenderAccountAddress = getAccountAddressFromPublicKey(keyPair.publicKey);

  $('#base58SenderAccountAddress').val(base58SenderAccountAddress);


  $.ajax({
    type : "POST",
    url : nodeUrl + "/index/api.html",
    data : { type: "get", apiurl: "/addresses/lastreference/" + base58SenderAccountAddress + "/unconfirmed" },
    success : function(data) {
      if(data.type == 'success'){
        console.log(data)
        base58LastReferenceOfAccount =  Base58.decode(data.result);

        if(base58LastReferenceOfAccount == null || base58LastReferenceOfAccount.length != 64) {
          document.getElementById('result').innerHTML = "<div class=\"alert alert-error\" role=\"alert\">invalid reference<br></div>"
          return;
        }

        var fee = 1;
        var timestamp = new Date().getTime();
        var nameBytes = stringtoUTF8Array(name);
	var valueBytes = stringtoUTF8Array(value);
	var owner = Base58.decode(base58SenderAccountAddress);


        signature = generateSignatureRegisterNameTransaction(keyPair, base58LastReferenceOfAccount, owner, nameBytes, valueBytes, fee, timestamp);

        nameTransactionRaw = generateRegisterNameTransaction(keyPair, base58LastReferenceOfAccount, owner, nameBytes, valueBytes, fee, timestamp, signature);

        doProcess(Base58.encode(nameTransactionRaw));

      }

      if(data.type == 'apicallerror'){
        return null;
      }
    },
    error: function(){
      return null;
    }
  });

}