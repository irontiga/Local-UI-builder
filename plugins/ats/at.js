Burst = new parentHelper();

Polymer({
    is: 'at-app',
    properties: {
        ats: {
            type: Array,
            value: function(){ return []; },
            notify: true,
            reflectToAttribute: true
        },
        loading: {
            trype: Boolean,
            value: true
        },
        atCount:{
            type: Number,
            value: 0
        },
        drawnAts:{
            type: Number,
            value: 0
        },
        atShowOptions:{
            type: Array,
            value: [
                "All",
                "Active",
                "Funded",
                "Not Funded"
            ]
        },
        atSorted: {
            type: Boolean,
            value: false
        },
        donateItem: {
            type: Object,
            value: {}
        },
        donateDialogueOpened: {
            type: Boolean,
            value: false
        },
        response: {
            type: Object,
            value: {}
        },
        createATData : {
            type: Object,
            value: {
                name: "",
                description: "",
                length: 1,
                goal: 0
            }
        }
    },
    
    _donateButton: function(e){
        this.donateItem = e.model.item;
        console.log(this.donateItem);
        this.donateDialogueOpened = true;
        var item = e.model.item;
        var options = {
            recipient : item.atData.at,
            recipientRS: item.atData.atRS,
            amount: item.amount,
            message: ""
        };
        Burst.request("sendMoney", options, function(response){
            if(response.error){
                this.response = {
                    title : "Error: " + response.error,
                    content : response.errorDescription
                };
            }
            console.log(response);
            this.$.responseDialog.open();
        }.bind(this));
    },
    
    _donateEnter: function(e){
        if (e.keyCode === 13) {
            this._donateButton(e);
        }
    },
    
    _niceNumber : function(number){
        return number.toLocaleString('en-US');
    },
    
    _sortAts : function(e){
        if(this.atSorted === true){
            this.ats = this.ats.sort(function(a,b){
                if(a.atData.name < b.atData.name){
                    return 1;
                }
                else{
                    return -1;
                }
            });
            this.atSorted = false;
        }
        else{
            this.ats = this.ats.sort(function(a,b){
                if(a.atData.name > b.atData.name){
                    return 1;
                }
                else{
                    return -1;
                }
            });
            this.atSorted = true;
        }
        
        var oldAts = this.ats;
        this.ats = [];
        this.ats = oldAts;
    },
    
    _showAts: function(e){
        this.loading = true;
        var showOnly = e.model.item;
        var ats = this.ats;
        this.ats = [];
        switch(showOnly){
            case "Active":
                for(var i=0; ats.length>i;i++){
                    if(ats[i].funded != 1){
                        ats[i].show = true;
                    }
                    else{
                        ats[i].show = false;
                    }
                }
                break;
            case "Funded":
                for(var i=0; ats.length>i;i++){
                    if(ats[i].funded == 1){
                        ats[i].show = true;
                    }
                    else{
                        ats[i].show = false;
                    }
                }
                break;
            case "Not Funded":
                for(var i=0; ats.length>i;i++){
                    if(ats[i].funded == 2){
                        ats[i].show = true;
                    }
                    else{
                        ats[i].show = false;
                    }
                }
                break;
            default:
                for(var i=0; ats.length>i;i++){
                    ats[i].show = true;
                }
        }
        
        setTimeout(function(){
            this.ats = ats;
            this.loading = false; 
        }.bind(this),200);       
    },

    ready: function(){
        Burst.request("burstApiCall", {
            requestType: "getATIds"
        }, function(response){
            getATs.bind(this)(response);
        }.bind(this));
    }
});

