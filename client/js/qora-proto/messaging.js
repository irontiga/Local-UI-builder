var casheBase58addressSeed = '';
var casheBase58SenderAccountAddress = '';
var casheBase58RecipientAccountAddress = '';
var casheTimestamp = '';
var casheFee = '';
var casheAmount = '';


function doMessageTransaction() {
  text = $('.input-box_text').val();
  address = $('#selected-name option:selected').val();
  room = $('.message-history .active').attr('id').split('-')[0];

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
        var recipientAccountAddress = Base58.decode(room);

        if(base58LastReferenceOfAccount == null || base58LastReferenceOfAccount.length != 64) {
          document.getElementById('result').innerHTML = "<div class=\"alert alert-error\" role=\"alert\">invalid reference<br></div>"
          return;
        }

        var amount = 1;
        var fee = 1;
        var timestamp = new Date().getTime();
        var messageData = stringtoUTF8Array(text);
        var isText = 1;
        var isEncrypted = 0;

        signature = generateSignatureMessageTransaction(keyPair, base58LastReferenceOfAccount, recipientAccountAddress, amount, fee, timestamp, messageData, isText, isEncrypted);

        paymentTransactionRaw = generateMessageTransaction(keyPair, base58LastReferenceOfAccount, recipientAccountAddress, amount, fee, timestamp, messageData, isText, isEncrypted, signature);

        doProcess(Base58.encode(paymentTransactionRaw));

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