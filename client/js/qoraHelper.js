function QoraCalls(){
    // url = "transactions/limit/50 "
    // method = "GET", "POST", "PUT", "DELETE"
    // data = Object, eg {name: "james"}
    // callback....well duh...function(JSONresponse)
    
    //this.apiCall = function(url, data, method, callback){
    
    /*
    
    options = {
        path: "blah",
        method: "GET/POST",
        data: Obj
    }
    
    */
    this.apiCall = function(options, qoraNode, callback){
        if(!("method" in options)){
            options.method = "GET";
        }
        
        function doApiCall(cb, errcb){
            //console.log(qoraNode);

            options.protocol = qoraNode.protocol;
            options.host = qoraNode.url;
            if(options.type == "api"){
                options.port = qoraNode.apiPort;
            }
            else{
                options.port = qoraNode.explorerPort;
            }
            

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function(){
                // Check the request is complete:
                if(xhttp.readyState == 4){
                    // If successful
                    if (xhttp.status == 200) {
                        console.log(xhttp.responseText);
                        var parsedResponse = JSON.parse(xhttp.responseText);

                        cb(parsedResponse);
                    }
                    // Otherwise...
                    else{
                        // Callback
                        if(errcb == undefined){
                            cb(xhttp.statusText);
                        }
                        // Promise
                        else{
                            errcb(xhttp.statusText);
                        }
                    }
                }
                
            };

            xhttp.open("GET", "/proxy/" + JSON.stringify(options), true);
            xhttp.send();
        }
        
        // If no callback then return a promise.
        if(callback == undefined){
            return new Promise(function(resolve, reject){
                doApiCall(resolve, reject);
            })
        }
        // Otherwise just do the usual callback stuff
        else{
            doApiCall(callback);
        }
        
        //console.log(qoraNode);
        
        /*options.protocol = qoraNode.protocol + ":";
        options.host = qoraNode.url;
        options.port = qoraNode.port;
        
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if (xhttp.readyState == 4 && xhttp.status == 200) {

                var parsedResponse = JSON.parse(xhttp.responseText);
                
                callback(parsedResponse);
            }
        };
        
        xhttp.open("GET", "/proxy/" + JSON.stringify(options), true);
        xhttp.send();*/
    }
    /*
    this.apiCall = function(options, callback){
        return;
    }
    */
    this.sendMoney = function(options, qoraNode, callback){
        
        // IN case of errorrrsss
        function returnError(err){
            if(callback == undefined){
                // Promise...
                return Promise.reject(err)
            }
            else{
                callback(err)
            }
        }
        
        // Convert this to promises as well...
        
        //var base58SenderAccountSeed = $('#selected-name option:selected').val();
        // data.sender.address.base58addressSeed

        //var senderAccountSeed = Base58.decode(base58SenderAccountSeed);
        let senderSeed = Base58.decode(options.sender.address.base58addressSeed);

        if(senderSeed.length != 32) {
            console.log("Invalid seeeeed");
            return returnError("Invalid seeeeed");
        }

        //keyPair = getKeyPairFromSeed(senderAccountSeed);
        // data.sender.address.kePpair

        let base58SenderAddress = getAccountAddressFromPublicKey(options.sender.address.keyPair.publicKey);

        //let base58LastReferenceOfAccount =  Base58.decode(senderAddress[highest tx number].reference);
        // Find the last reference
        // MIGHT NOT WORK, MAY NEED TO BE LAST REF OF ACCOUNT, NOT ADDRESS, I REALLY DON'T KNOW
        // WHAT IF 0 TRANSACTIONS...
        let i = 1;
        while(options.sender.info[i] != undefined){i++;}
        let base58LastReferenceOfAccount =  Base58.decode(options.sender.info[i-1].transaction.reference);

        let recipientAccountAddress = Base58.decode(options.recipient);

        if(base58LastReferenceOfAccount == null || base58LastReferenceOfAccount.length != 64) {
            console.log("Invalid last reference :/");
            return returnError("Invald last reference");
        }

        //var fee = 1;
        // data.fee
        var timestamp = new Date().getTime();

        // SIGN 'EM BABY
        let signature = generateSignaturePaymentTransaction(options.sender.address.keyPair, base58LastReferenceOfAccount, recipientAccountAddress, options.amount, options.fee, timestamp);
        let paymentTransactionRaw = generatePaymentTransaction(options.sender.address.keyPair, base58LastReferenceOfAccount, recipientAccountAddress, options.amount, options.fee, timestamp, signature);

        // And rewrite this one :/
        // doProcess(Base58.encode(paymentTransactionRaw));
        // Base58.encode(paymentTransactionRaw)4
        let finalData = {
            type: "api",
            path: "/transactions/process",
            data: Base58.encode(paymentTransactionRaw)
        }

        if(callback == undefined){
            // Promise...
            return this.apiCall(finalData, qoraNode)
        }
        else{
            this.apiCall(finalData, qoraNode, callback)
        }
    }
}




function doProcess(txRaw)
{
    if(!txRaw) {
        return;
    }

    $.ajax({
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

}
/*function doPaymentTransaction(recipient, amount) {

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
    });
}*/