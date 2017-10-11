	var nodeUrl = '';




	function doLoadBalance(base58SenderAccountAddress, elementAccountbalance)
	{
		if(base58SenderAccountAddress == '') {
			elementAccountbalance.val('');
			return;
		}

		var nodeUrl = $("#nodeUrl").val();

		$.post( nodeUrl + "/index/api.html", { type: "get", apiurl: "/addresses/balance/" + base58SenderAccountAddress } )
			.done(function( data ) {

				if(data.type == 'success'){
					var balanceOfAccount = data.result;
					elementAccountbalance.val(addCommas(balanceOfAccount));
				}

				if(data.type == 'apicallerror'){
					$("#output").val(parseError(data.errordetail));
					elementAccountbalance.val('');
				}

			})
			.fail(function() {
				$("#output").val( "error" );
			});
	}

	function doLoadInfoForName(name, elementNameInfo)
	{
		if(name == '') {
			elementNameInfo.val('');
			return;
		}

		if( name.toLowerCase() != name ) {
			elementNameInfo.val('You must use lowercase letters.');
			return;
		}

		var nodeUrl = $("#nodeUrl").val();

		$.post( nodeUrl + "/index/api.html", { type: "get", apiurl: "/names/" + encodeURIComponent(name) } )
			.done(function( data ) {

				if(data.type == 'success'){
					var info = JSON.parse(data.result);
					elementNameInfo.val("Registered by " + info.owner);
				}

				if(data.type == 'apicallerror'){
					if(parseError(data.errordetail) == 'name does not exist') {
						elementNameInfo.val('Name is free. You can register it.');
					} else {
						elementNameInfo.val(parseError(data.errordetail));
					}
				}

			})
			.fail(function() {
				$("#output").val( "error" );
			});
	}

	function doNowTime()
	{
		var date = new Date();
		$('#datetime').val(date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
		$('#timestamp').val(date.getTime());
	}

	function sleep(ms) {
		ms += new Date().getTime();
		while (new Date() < ms){}
	}

	function addCommas(str)
	{
		strbuf = str.toString();
		if( strbuf.indexOf('.') == -1)
		{
			return strbuf.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,');
		}
		return strbuf.replace(/(\d)(?=(\d\d\d)+([^\d]))/g, '$1,');
	}

	function removeAllexceptDotAndNumbers (str)
	{
		return str.replace(/[^.0-9]/g,"");
	}

	function removeAllexceptNumbers(str)
	{
		return str.replace(/[^0-9]/g,"");
	}

	function getTextCursorPosition(ele) {
		return ele.prop("selectionStart");
	}

	function setTextCursorPosition(ele, pos) {
		ele.prop("selectionStart", pos);
		ele.prop("selectionEnd", pos);
	}

	function parseError(error)
	{
		try {
			var error = JSON.parse(error);
			message = error.message;
		} catch (e) {
			message = error;
		}
		return message;
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

	function doLoadLastReference(address)
	{
		console.log(address)
		var base58SenderAccountAddress = address;

		$.ajax({
			type : "POST",
			url : nodeUrl + "/index/api.html",
			data : { type: "get", apiurl: "/addresses/lastreference/" + base58SenderAccountAddress + "/unconfirmed" },
			async: false,
			success : function(data) {
				if(data.type == 'success'){
					console.log(data)
					return data.result;
				}

				if(data.type == 'apicallerror'){
					return null;
				}
			},
			error: function(){
				return null;
			}
		});
	}