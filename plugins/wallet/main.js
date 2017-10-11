var parentWindow = new ParentHelper();

parentWindow.request("registerUrl", {
		url: "wallet",
		page: "wallet/index.html",
		title: "Wallet",
		menus: [],
		parent : false
	},
	function(response){
		//console.log(response);	
	}
);