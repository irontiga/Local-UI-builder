Burst.request(
	{
		request: "registerUrl",
		url: "transactions",
		page: "transactions/index.html",
		title: "Transactions",
		menus: [],
		parent : false
	},
	function(response){
		console.log(response);
	}
);