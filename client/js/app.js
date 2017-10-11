Polymer({
	is: 'burst-app',
	properties: {
		plugins: {
			type: Array,
			value: [],
			notify: true
		},
		urls : {
			type: Array,
			value: []
		},
        routeData: {
            type: Object,
            value:{}
        },
		route: {
			type: Object
		},
        loginpage: {
            type: Object,
            value: {
                loggedin : false,
                loading: false
            }
        },
		data: {
			type: Object
		},
        activeUrl: {
            type: Object,
            computed: "_getActiveUrl(routeData, urls)",
            notify: true
        },
        pluginsLoaded: {
            type: Boolean,
            value: false,
            notify:true
        },
        passphrase: {
            type: String,
            value: ""
        },
        qoraNode: {
            type: Object,
            value: {
                protocol: "http",
                url: "127.0.0.1",
                explorerPort: "9090",
                apiPort: "9085"
            }
        },
        // Burst
        account: {
            type: Object,
            value: {}
        },
        // Qora
        addresses: {
            type: Object,
            value: []
        },
        sendMoneyPrompt: {
            type: Object,
            value: {
                open: false
            }
        },
        addressColors: {
            type:Array,
            value: ["#f44336",
                    "#3f51b5",
                    "#e91e63",
                    "#2196f3",
                    "#4caf50",
                    "#ff9800",
                    "#795548",
                    "#9c27b0",
                    "#18ffff",
                    "#ffeb3b"]
        },
        addressCount: {
            type: Number,
            value: 10
        }
	},
	
	_messageHandler : pluginMessageHandler,
	
	_checkActiveRoute : function(item, route){
		if(route.path == "/qora" + item.url){
			return false;
		}
		else{
			return true;
		}
	},
	
	_checkPageNotFound : function(urls, route){
		var noPage = false;
		for(var i=0; i < urls.length; i++){
			if("/qora" + urls[i].url == route.path){
				noPage=true;
			}
		}
		return noPage;
	},

	_joinPluginUrl : function(url, hash){
		return "/plugins/" + url + "#" + hash;
	},
	
	_genIframeUrl : function(url){
		return "/qora/" + url;
	},
    
    _getActiveUrl :  function(routeData, urls){
        //console.log(routeData);
        var activeUrl = routeData.currentPluginUrl;
        var activePlugin = {
            url: "404",
            title: "404",
            menus:[],
            page: "404",
            parent: false
        };
        
        //console.log("Get active urls...");
        //console.log(urls);
        //console.log(routeData);
        
        for(var i=0;i<urls.length;i++){
            //console.log(urls[i]);
            //console.log(activeUrl);
            if(activeUrl == urls[i].url){
                activePlugin = urls[i];
            }
        }
        
        //console.log(activePlugin);
        return activePlugin;
    },
    
    // CONVERTING TO QORA BABY
    _accountInfo : function(callback){
        if(typeof(this.account.account) == 'undefined'){
            this.account.publicKey = converters.byteArrayToHexString(localSign.getPublicKey(this.passphrase));
            this.account.account = localSign.getAccountIdFromPublicKey(this.account.publicKey, false);
        }
        BurstCall.apiCall({
            requestType: "getAccount",
            account: this.account.account
        }, function(response){
            if(response.errorCode == 5){
                this.account.accountRS = localSign.getAccountIdFromPublicKey(this.account.publicKey, true);
                this.account.balanceNQT = 0;
            }
            else{
                this.account = response;
            }
            
            this.account.balance = this.account.balanceNQT / 100000000;
            this.account.balance = this.account.balance.toLocaleString('en-US');
            
            var account = this.account;
            this.account = {};
            this.account = account;
            
            callback();
            
        }.bind(this));
    },
	
    _acceptSendMoney : function(e){
        var data = this.sendMoneyPrompt;
        //console.log(data);
        //console.log(this.passphrase);
        data.accept(data);
    },
    _rejectSendMoney : function(e){
        var data = this.sendMoneyPrompt;
        this.sendMoneyPrompt = {
            open: false
        };
        data.reject();
    },
    
    _toggleDrawer: function(e){
        this.$.appdrawer.toggle();
    },
    
	ready: function(){
		//console.log(this);
        //console.log(this.$.appdrawer);
		window.addEventListener("message", this._messageHandler.bind(this), false);
        
        // -----------------------
        // LOGIN FUNCTION
        // -----------------------
        this.loginpage.login = login.bind(this);
	}
});

