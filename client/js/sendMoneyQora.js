function doProcess(txRaw){
    if(!txRaw) {
        return;
    }

    console.log(txRaw);
    
    postRequest(nodeUrl + "http://127.0.0.1:9090/index/api.html", {
        type: 'post',
        apiurl: '/transactions/process',
        json: txRaw
    }, function(data){
        console.log(data)
    })
}
    
/*    $.ajax({
        type: 'post',
        headers: {
            "X-FORWARDED-FOR": '127.0.0.1',   //If your header name has spaces or any other char not appropriate
        },
        dataType: 'json',
        url: nodeUrl + "/index/api.html",
        data :{
            type: 'post',
            apiurl: '/transactions/process',
            json: txRaw
        },
        success: function(data) {
            if(data.type == 'apicallerror')	{
                document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">"+data.errordetail+"<br></div>";

            }
            if(data.type == 'success')	{
                document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">"+data.result+"<br></div>";

                if(isNaN(data.result)){
                    document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">"+data.result+"<br></div>";
                } else {
                    switch (data.result) {
                        case "1":
                            $("#output").val('VALIDATE_OK');
                            break
                            case "2":
                            $("#output").val('INVALID_ADDRESS');
                            break
                            case "3":
                            $("#output").val('NEGATIVE_AMOUNT');
                            break
                            case "4":
                            $("#output").val('NEGATIVE_FEE');
                            break
                            case "5":
                            $("#output").val('NO_BALANCE');
                            break
                            case "6":
                            $("#output").val('INVALID_REFERENCE');
                            break
                            case "7":
                            $("#output").val('INVALID_NAME_LENGTH');
                            break
                            case "8":
                            $("#output").val('INVALID_VALUE_LENGTH');
                            break
                            case "9":
                            $("#output").val('NAME_ALREADY_REGISTRED');
                            break
                            case "15":
                            $("#output").val('INVALID_AMOUNT');
                            break
                            case "17":
                            $("#output").val('NAME_NOT_LOWER_CASE');
                            break
                            case "27":
                            $("#output").val('INVALID_DATA_LENGTH');
                            break
                            case "34":
                            $("#output").val('INVALID_PAYMENTS_LENGTH');
                            break
                            case "40":
                            $("#output").val('FEE_LESS_REQUIRED');
                            break
                            case "41":
                            $("#output").val('INVALID_RAW_DATA');
                            break
                            case "1000":
                            $("#output").val('NOT_YET_RELEASED');
                            break
                    }
                }
            }
        },
        fail:  function(xhr, textStatus, errorThrown) {
            document.getElementById('result').innerHTML = '<div class=\"alert alert-danger\" role=\"alert\">ERROR<br>'+xhr.responseText+'<br></div>';
        }
    })

}*/

function sendMoneyQora(recipient, amount, addressInfo) {

    //var base58SenderAccountSeed = $('#selected-name option:selected').val();
    var base58SenderAccountSeed = addressInfo.base58addressSeed;
    
    var senderAccountSeed = Base58.decode(base58SenderAccountSeed);

    /*if(senderAccountSeed.length != 32) {
        document.getElementById('result').innerHTML = "<div class=\"alert alert-error\" role=\"alert\">invalid seed<br></div>"
        return;
    }*/

    //var keyPair = getKeyPairFromSeed(senderAccountSeed);
    var keyPair = addressInfo.keyPair;
    
    //var base58SenderAccountAddress = getAccountAddressFromPublicKey(keyPair.publicKey);
    var base58SenderAccountAddress = addressInfo.address;

    //$('#base58SenderAccountAddress').val(base58SenderAccountAddress);

    
    postRequest("http://127.0.0.1:9090/index/api.html", {
        type: "get",
        apiurl: "/addresses/lastreference/" + base58SenderAccountAddress + "/unconfirmed"
    }, function(data){
        if(data.type == 'success'){
            console.log(data)
            var base58LastReferenceOfAccount =  Base58.decode(data.result);
            var recipientAccountAddress = Base58.decode(recipient);

            if(base58LastReferenceOfAccount == null || base58LastReferenceOfAccount.length != 64) {
                document.getElementById('result').innerHTML = "<div class=\"alert alert-error\" role=\"alert\">invalid reference<br></div>"
                return;
            }

            var fee = 1;
            var timestamp = new Date().getTime();

            var signature = generateSignaturePaymentTransaction(keyPair, base58LastReferenceOfAccount, recipientAccountAddress, amount, fee, timestamp);

            var paymentTransactionRaw = generatePaymentTransaction(keyPair, base58LastReferenceOfAccount, recipientAccountAddress, amount, fee, timestamp, signature);

            doProcess(Base58.encode(paymentTransactionRaw));

        }

        if(data.type == 'apicallerror'){
            return null;
        }
    });
    
    /*$.ajax({
        type : "POST",
        url : nodeUrl + "/index/api.html",
        data : { type: "get", apiurl: "/addresses/lastreference/" + base58SenderAccountAddress + "/unconfirmed" },
        success : function(data) {
            if(data.type == 'success'){
                console.log(data)
                base58LastReferenceOfAccount =  Base58.decode(data.result);
                var recipientAccountAddress = Base58.decode(recipient);

                if(base58LastReferenceOfAccount == null || base58LastReferenceOfAccount.length != 64) {
                    document.getElementById('result').innerHTML = "<div class=\"alert alert-error\" role=\"alert\">invalid reference<br></div>"
                    return;
                }

                var fee = 1;
                var timestamp = new Date().getTime();

                signature = generateSignaturePaymentTransaction(keyPair, base58LastReferenceOfAccount, recipientAccountAddress, amount, fee, timestamp);

                paymentTransactionRaw = generatePaymentTransaction(keyPair, base58LastReferenceOfAccount, recipientAccountAddress, amount, fee, timestamp, signature);

                doProcess(Base58.encode(paymentTransactionRaw));

            }

            if(data.type == 'apicallerror'){
                return null;
            }
        },
        error: function(){
            return null;
        }
    });*/

};
/*
sendMoneyQora("Qh5qnm9kwm9G2fi5Pr7Upk8KwokCoZTPJq", 3, {
    address:"QRHPTW4YknkuEvyuAabQqzv9cQycrCDPzM",
    base58addressSeed:"BbT9f4C2AudpMtbSFFmC6mjZMScREqWdFQYEcxc9vHVj",
    keyPair:{
        privateKey: new Uint8Array(64) [157, 104, 47, 14, 143, 87, 101, 62, 83, 165, 23, 88, 153, 182, 174, 251, 231, 122, 81, 33, 26, 77, 145, 100, 37, 83, 212, 29, 12, 194, 166, 170, 240, 188, 108, 155, 91, 101, 1, 205, 91, 204, 239, 170, 252, 223, 13, 152, 98, 212, 223, 73, 1, 206, 249, 141, 155, 148, 48, 196, 254, 195, 70, 148],
        publicKey: new Uint8Array(32) [240, 188, 108, 155, 91, 101, 1, 205, 91, 204, 239, 170, 252, 223, 13, 152, 98, 212, 223, 73, 1, 206, 249, 141, 155, 148, 48, 196, 254, 195, 70, 148]
    }
})
*/