const parentWindow = new ParentHelper();

class WalletApp extends Polymer.Element {
    static get is(){ return 'wallet-app' }

    static get properties() {
        return {
            addresses: {
                type: Array,
                value: []
            },
            fee: {
                type:Number,
                value: 1
            },
            amount: {
                type: Number
            }
        }
    }

    constructor() {
        super();
    }

    _arrayItem(arr, i){
        return arr[i];
    }

    _checkAmount(){
        if(this.amount > this.selectedAddress.balance - this.fee || this.amount <= 0){
            this.validAmount = true;
        }
        else{
            this.validAmount = false;
        }
    }

    toggle(event) {
        var id = event.currentTarget.getAttribute('ident');
        var collapse = this.shadowRoot.querySelector('iron-collapse[ident="' + id + '"]');
        collapse.toggle();
    }

    _sendMoneyDialog(e){
        this.$.sendMoneyDialog.open()
    }

    _sendMoney(e){
        var address = this.selectedAddress;
        var amount = this.amount;
        var recipient = this.recipient;
        var fee = this.fee;

        // Check for valid...^

        parentWindow.request("sendMoney", {
            address: address.address,
            amount: amount,
            recipient: recipient,
            fee: fee
        }, function(response){
            console.log(response);
        });

        //this.$.sendMoneyDialog.close();
    }

    _getTransactions(){
        return;
    }
    
    _round (num){
        return Math.round(num);
    }

    connectedCallback() {
        super.connectedCallback();
        //console.log('wallet-app element created!');
    }

    ready(){
        super.ready();
        //console.log("hey");
        // Fetch the addresssses, and refresh 'em
        parentWindow.request("getQoraAddresses", {}, function(addresses){
            //console.log("================ HEYY ============");
            console.log(addresses);

            this.addresses = addresses;
            this.selectedAddress = this.addresses[0];

        }.bind(this))
    }
}


window.addEventListener('WebComponentsReady', function(){
    window.customElements.define(WalletApp.is, WalletApp);
});

/*
"help":{
    "Unconfirmed Transactions":"blockexplorer.json?unconfirmed",
        "Block":"blockexplorer.json?block={block}",
            "Blocks List":"blockexplorer.json?blocks[&start={height}]",
                "Assets List":"blockexplorer.json?assets",
                    "Assets List Lite":"blockexplorer.json?assetsLite",
                        "Asset":"blockexplorer.json?asset={asset}",
                            "Asset Trade":"blockexplorer.json?asset={assetHave}&asset={assetWant}",
                                "Polls List":"blockexplorer.json?polls",
                                    "Poll":"blockexplorer.json?poll={poll}",
                                        "AT TX":"blockexplorer.json?atTx={atTx}",
                                            "Trade":"blockexplorer.json?trade={initiatorSignature}/{targetSignature}",
                                                "Transaction":"blockexplorer.json?tx={txSignature}",
                                                    "Name":"blockexplorer.json?name={name}",
                                                        "Name (additional)":"blockexplorer.json?name={name}&start={offset}&allOnOnePage",
                                                            "Address":"blockexplorer.json?addr={address}",
                                                                "Address (additional)":"blockexplorer.json?addr={address}&start={offset}&allOnOnePage&withoutBlocks&showWithout={1,2,blocks}&showOnly={type}",
                                                                    "Top Richest":"blockexplorer.json?top={limit}&asset={asset}",
                                                                        "Address All Not Zero":"blockexplorer.json?top=allnotzero",
                                                                            "Address All Addresses":"blockexplorer.json?top=all",
                                                                                "AT List":"blockexplorer.json?aTs",
                                                                                    "Names List":"blockexplorer.json?names",
                                                                                        "BlogPosts of Address":"blockexplorer.json?blogposts={addr}",
                                                                                            "Search":"blockexplorer.json?q={text}",
                                                                                                "Balance":"blockexplorer.json?balance={address}[&balance=address2...]"
}
*/