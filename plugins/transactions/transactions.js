parentWindow = new ParentHelper();

Polymer({
    is: 'transactions-app',
    properties: {
        account: {
            type: Object,
            value: {}
        },
        transactions: {
            type: Array,
            value: []
        }
    },

    ready: function(){
        parentWindow.request("getAccountInfo", {}, function(response){
            this.account = response;
            console.log(response);
            refreshTransactions.bind(this)();
        }.bind(this));
    }
});

function refreshTransactions(){
    parentWindow.request("burstApiCall", {
        requestType: "getAccountTransactions",
        account: this.account.account,
        lastIndex: 25
    }, function(response){
        console.log(response);
        this.transactions = response;
        
        setTimeout(function(){
            refreshTransactions.bind(this)();
        }.bind(this), 10000);
    });
}