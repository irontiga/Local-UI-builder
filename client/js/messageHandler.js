function pluginMessageHandler(event){
    
    //console.log(this.urls);
    
    //console.log("event");
    //console.log(event)
	const message = JSON.parse(event.data);
    const data = message.data;
	//console.log("Message: ");
    //console.log(message);
    
    //this.nodeUrl -- has access
    
	let response = {
        requestID: message.requestID
    };
    
    function finish(responseData){
        // If there is no responseData...eg it's called as finish()
        if(typeof(responseData) == "undefined"){
            responseData = {
                success : true
            };
        }
        response.data = responseData;
        event.source.postMessage(JSON.stringify(response), "*");
    }
    
	switch(message.request){
        case "pluginsLoaded":
            this.pluginsLoaded = true;
            finish();
            break;
		case "registerUrl":
			let parent = false;
            if(data.parent){
				parent = true;
			}
			
			this.push("urls",{
                url :  data.url,
                title : data.title,
                menus : data.menus,
                page : data.page,
				parent: parent
			});
            
            // ----
            // Dirty updating url array https://www.polymer-project.org/1.0/docs/devguide/model-data#array-mutation
            let allUrls = this.urls;
            this.urls = [];
            this.urls = allUrls;
            // ----
            
            //console.log(this.urls);
			
			finish();
			break;
		case "addMenuItem":
			finish();
			break;
        case "getAccountInfo":
            let account = this.account;
            account.success = true;
            finish(account);
            break;
        case "burstApiCall":
            BurstCall.apiCall(data, finish);
            break;
        case "qoraApiCall":
            Qora.apiCall(data, this.qoraNode, finish);
            break;
        case "getQoraAddresses":
            //console.log("getting addresses ready...");
            const addressIDS = this.addresses.map(function(address, index){
                let response = {
                    address: address.address.address,
                    color: address.color,
                    index: index,
                    info: address.info
                }
                if(address.info.error){
                    response.balance = 0
                }
                else{
                    response.balance = address.info.balance.total["0"]
                }
                return response;
            })
            finish(addressIDS);
            break;
        case "sendMoney":
            if(this.sendMoneyPrompt.open){
                finish({
                    success: false,
                    errorMessage: "Send money request already pending."
                })
            }
            console.log(data);
            
            // Find the address info
            let i = 0;
            while(data.address != this.addresses[i].address.address){
                i++;
            }
            data.sender = this.addresses[i];
            // Last referene at senderAddress[highest tx number].reference;
            
            this.sendMoneyPrompt = {};
            this.sendMoneyPrompt = {
                open: true,
                address: data.address,
                recipient : data.recipient,
                amount: data.amount,
                fee: data.fee,
                accept : function(){
                    this.sendMoneyPrompt = {open:false};
                    Qora.sendMoney(data, this.qoraNode, finish);
                }.bind(this),
                reject: function(){
                    this.sendMoneyPrompt = {open:false};
                    finish({
                        success: false,
                        errorMessage : "User rejected transaction"
                    });
                }
            };
            this.$.sendMoneyConfirmDialog.open();
            break;
        case "createAT":
            console.log("Created...not");
            break;
		default:
			finish({
				success: false,
                errorMessage : "Unrecognized request '" + message.request + "'"
			});
	}
};