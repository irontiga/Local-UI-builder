function login(passphrase, passInput){
    
    // Show loading...and disable the input
    // console.log(passInput)
    passInput.disabled = true;
    this.set('loginpage.loading', true);
    // Clear any error messages...don't want to be confusing anyone
    this.set('loginpage.errorMessage', "");

    
    let addresses = doBrain(passphrase, this.addressCount);
    //console.log("AADDDRRRESSSSES QORA")
    //console.log(addresses)

    //console.log(this.addressColors);

    this.addresses = addresses.map(function(address, index){
        return {
            address: address,
            color: this.addressColors[index % this.addressColors.length],
            index: index
        }
    }.bind(this));
    
    
    // Address INFOOSSSS    
    Promise.all(this.addresses.map((address) => {
        return Qora.apiCall({
            type: "explorer",
            path: "/index/blockexplorer.json",
            data: {
                addr: address.address.address
            },
            method: "GET"
        }, this.qoraNode)
            .then((response, error) => {
            address.info = response;
            console.log(response);
            return address;
        })
    })).then(function(addresses, err){
        // Sort em real nice
        addresses.sort(function(a, b){
            return a.index - b.index
        });
        
        // And spread the love to the wor....app
        this.addresses = [];
        this.addresses = addresses;
        console.log(this.addresses);
        
        // Log her in....Now that the addresses are loaded.
        this.loginpage.loggedin = true;
        this.passphrase = passphrase;
        
        let loginpage = this.loginpage;
        this.loginpage = {};
        this.loginpage = loginpage;
    }.bind(this))
        .catch(function(err){
        passInput.disabled = false;
        this.set('loginpage.loading', false);
        this.set('loginpage.errorMessage', err);
        //console.log("ERRRRROR");
    }.bind(this))
    
    
    /*for(let i=0;i<addresses.length; i++){
        
        Qora.apiCall({
            type: "explorer",
            path: "/index/blockexplorer.json",
            data: {
                addr: addresses[i].address
            },
            method: "GET"
        }, this.qoraNode)
            .then((response) => {
            let address = addresses[i];
            address.info = response;
            storeAddresses.push(address);
            console.log(response);
        })
            .catch((err) => {
            storeAddresses.push(addresses[i]);
            console.log(err);
        })
    }*/
    
    
    
    // Polling to refresh acc info
    /*function loop(){
                setTimeout(function(){
                    this._accountInfo(loop.bind(this));
                }.bind(this), 10000);
            }
            this._accountInfo(loop.bind(this));*/

}