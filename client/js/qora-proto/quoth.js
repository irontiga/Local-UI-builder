$("#login").show();

    $("#btn-save-settings").click(function(e) {
        e.preventDefault();

        updateValue();
    })

    $("#btn-login").click(function(e) {
        e.preventDefault();
        pass = $("#password").val();
        $("#login").hide();

        doBrain(pass)
    })




    var updateValue;
    updateValue = function() {

        document.getElementById('result').innerHTML = '<div class=\"alert alert-info\" role=\"alert\">Saving...please confirm the security call and then wait until you get a success message! If the transaction amount is high this may take some time...<br></div>';

        image = document.getElementById('icon-data').value
        username = document.getElementById('settings-username').value
        address = $('#settings-name option:selected').val();
        var iconStr = "qrack-icon"
        var userStr = "qrack-username"


        jsonstring = {
            "addcomplete": "{\"" + iconStr + "\":\"" + image + "\",\"" + userStr + "\":\"" + username + "\"}"
        }


        $.post(
                nodeUrl + "/index/api.html", {
                    type: 'post',
                    apiurl: '/namestorage/update/' + address,
                    json: JSON.stringify(jsonstring)
                })
            .done(function(data) {
                if (data.type == 'success') {
                    document.getElementById('result').innerHTML = "<div class=\"alert alert-success\" role=\"alert\">Key successfully saved.<br></div>";
                } else if (data.type == 'parametersMissing') {
                    document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">Some parameters are missing.<br></div>";
                } else if (data.type == 'badKey') {
                    document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">This key is an internal qora key and can't be edited this way!<br></div>";
                } else if (data.type == 'error') {
                    try {
                        var error = JSON.parse(data.error);
                        message = error.message;
                    } catch (e) {
                        message = data.error;
                    }

                    document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">An error occurred while saving the website.<br>" + message + "<br></div>";
                } else {
                    document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">Unknown response:<br>" + data + "<br></div>";
                }
            })
            .fail(function(xhr, textStatus, errorThrown) {
                try {
                    var error = JSON.parse(xhr.responseText);
                    message = error.message;
                } catch (e) {
                    message = xhr.responseText;
                }

                document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">An error occurred while saving the website.<br>" + message + "<br></div>";
            });
    };

    function processCommand() {
      command = $(".input-box_text").val();
      commandParts = command.split(" ");
      if (commandParts[0].toLowerCase() == "/post") {
        commandParts[0] = "post"
      } else if (commandParts[0].toLowerCase() == "/get") {
        commandParts[0] = "get"
      } else if  (commandParts[0].toLowerCase() == "/send") {
        if (commandParts.length != 3) {
          return false;
        }
        doPaymentTransaction(commandParts[1], commandParts[2]);
        return;
      } else if  (commandParts[0].toLowerCase() == "/registername") {
        if (commandParts.length != 2) {
          return false;
        }
        doRegisterName(commandParts[1], '{"defaultkey":""}');
        return;
      } 
      else {
        document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">Should be either 'post' or 'get'<br></div>";
        return false;
      }
      $.post(
              nodeUrl + "/index/api.html", {
                  type: commandParts[0],
                  apiurl: commandParts[1],
                  json: (commandParts[2])?commandParts[2]:""
              })
          .done(function(data) {
              if (data.type == 'success') {
                var results = JSON.parse(data.result)

                        htmlT = '<div class="message">' +
                            '<a href="" class="message_profile-pic"></a>' +
                            '<a href="" class="message_username">System Response</a>' +
                            '<span class="message_timestamp">' + new Date() + '</span>' +
                            '<span class="message_star"></span>' +
                            '<span class="message_content">' + JSON.stringify(results,null,"\t") + '</span>' +
                            '</div>'

                        $(".message-history .active").append(htmlT);

                        var objDiv = document.getElementById("message-scroll");
                        objDiv.scrollTop = objDiv.scrollHeight + 100;

                  document.getElementById('result').innerHTML = "<div class=\"alert alert-success\" role=\"alert\">Request successfully sent.<br></div>";
              } else if (data.type == 'parametersMissing') {
                  document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">Some parameters are missing.<br></div>";
              } else if (data.type == 'badKey') {
                  document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">This key is an internal qora key and can't be edited this way!<br></div>";
              } else if (data.type == 'error') {
                  try {
                      var error = JSON.parse(data.error);
                      message = error.message;
                  } catch (e) {
                      message = data.error;
                  }

                  document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">An error occurred while saving the website.<br>" + message + "<br></div>";
              } else {
                  document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">Unknown response:<br>" + data + "<br></div>";
              }
          })
          .fail(function(xhr, textStatus, errorThrown) {
              try {
                  var error = JSON.parse(xhr.responseText);
                  message = error.message;
              } catch (e) {
                  message = xhr.responseText;
              }

              document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">An error occurred while saving the website.<br>" + message + "<br></div>";
          });
    }

    $("#btn-send").click(function(e) {
        e.preventDefault();
        if ($(".input-box_text").val().startsWith("/")) {
            processCommand();
        } else {
          rawTx = doMessageTransaction();
        }
        $(".input-box_text").val("");
        return false;
    });

    var channels = {
        "QaWkWmYSvdsi8WBqwN2ScdXQfSBb5sm6Zk": "General",
        "QaxiR439Q9nwwqg4WX9i5N88wfwFoKKJBb": "Technical",
        "Qai3un9xKMbhUEAjhUj2X3aC9wFq6XVvcM": "Trolling"
    };

    $('.user-settings-btn').click(function(e) {

        e.preventDefault();
        $(".message-history").toggle();
        $(".user-settings").toggle();
        return false;
    });
    first = true;
    Array.prototype.filter.call(Object.keys(channels), function(item) {
        channelStr = '<li class="channel" id="' + item + '">' +
            '<span class="channel_name">' +
            '	<span class="unread">' +
            '		0' +
            '	</span>' +
            '	<span>' +
            '		<span class="prefix">#</span>' +
            '<span class="channel-name">' + channels[item] + '</span>' +
            '</span>' +
            '</span>' +
            '</li>';
        $(".channel_list").append(channelStr)
        if (first) {
            $(".message-history").append('<div id="' + item + '-messages" class="active"></div>');
            first = false;
        } else {
            $(".message-history").append('<div style="display:none" id="' + item + '-messages"></div>');

        }

        getTxs(item, 2000);

    });

    function txComparator(a, b) {
      return (a.blockHeight == b.blockHeight) ? a.timestamp * 1 - b.timestamp * 1 : a.blockHeight * 1 - b.blockHeight * 1;

    }

    function getTxs(item, limit) {

        $.post(
                nodeUrl + "/index/api.html", {
                    type: 'get',
                    apiurl: 'transactions/address/' + item + '/type/17/limit/' + limit
                })
            .done(function(data) {
                if (data.type == "success") {
                    parseData(data.result, item)
                } else if (data.type == 'apicallerror') {
                    parseData(data.errordetail, item)
                } else if (data.type == 'error') {
                    try {
                        var error = JSON.parse(data.error);
                        message = error.message;
                    } catch (e) {
                        message = data.error;
                    }

                    document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">An error occurred while fetching chat history.<br>" + message + "<br></div>";
                } else {
                    document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">Unknown response:<br>" + data.type + "<br></div>";
                }
            })
            .fail(function(xhr, textStatus, errorThrown) {
                document.getElementById('result').innerHTML = '<div class=\"alert alert-danger\" role=\"alert\">ERROR<br>' + xhr.responseText + '<br></div>';
            });
    }

    function parseData(data, item) {
    var results = JSON.parse(data)
    results = results.sort(txComparator);
    Array.prototype.filter.call(results, function(message) {

        if (document.getElementById(message.signature) === null) {

            htmlT = '<div class="message" id=' + message.signature + '>' +
                '<a href="" class="message_profile-pic"></a>' +
                '<a href="" class="message_username">' + message.creator + '</a>' +
                '<span class="message_timestamp">' + new Date(message.timestamp * 1) + '</span>' +
                '<span class="message_star"></span>' +
                '<span class="message_content">' + $( $.parseHTML(message.data) ).text() + '</span>' +
                '</div>'

            $("#" + item + "-messages").append(htmlT);

            var objDiv = document.getElementById("message-scroll");
            objDiv.scrollTop = objDiv.scrollHeight + 100;
        } else {
            htmlT = '<a href="" class="message_profile-pic"></a>' +
                '<a href="" class="message_username">' + message.creator + '</a>' +
                '<span class="message_timestamp">' + new Date(message.timestamp * 1) + '</span>' +
                '<span class="message_star"></span>' +
                '<span class="message_content">' + $( $.parseHTML(message.data) ).text() + '</span>'
            $("#" + message.signature).html(htmlT);

        }
    });
    }

    function syncChat() {
        Array.prototype.filter.call(Object.keys(channels), function(item) {
            getTxs(item, 200);
        });
    }

    lastBlock = 0;
    //check unconfirmed
    setInterval(function() {
        Array.prototype.filter.call(Object.keys(channels), function(item) {
            $.post(
                    nodeUrl + "/index/api.html", {
                        type: 'get',
                        apiurl: '/transactions/network'
                    })
                .done(function(data) {
                    if (data.type == "success") {
                        var results = JSON.parse(data.result)
                        results = results.sort(txComparator);
                        Array.prototype.filter.call(results, function(message) {
                            if (message.recipient == item && message.type == 17 && document.getElementById(message.signature) === null) {
                                htmlT = '<div class="message" id=' + message.signature + '>' +
                                    '<a href="" class="message_profile-pic"></a>' +
                                    '<a href="" class="message_username">' + message.creator + '</a>' +
                                    '<span class="message_timestamp">' + new Date(message.timestamp * 1) + ' (unconfirmed)</span>' +
                                    '<span class="message_star"></span>' +
                                    '<span class="message_content">' + $( $.parseHTML(message.data) ).text() + '</span>' +
                                    '</div>'
                                $("#" + item + "-messages").append(htmlT);

                                var objDiv = document.getElementById("message-scroll");
                                objDiv.scrollTop = objDiv.scrollHeight + 100;

                            }
                        });
                    }
                })
                .fail(function(xhr, textStatus, errorThrown) {
                    document.getElementById('result').innerHTML = '<div class=\"alert alert-danger\" role=\"alert\">ERROR<br>' + xhr.responseText + '<br></div>';
                });

            $.post(
                    nodeUrl + "/index/api.html", {
                        type: 'get',
                        apiurl: 'blocks/height'
                    })
                .done(function(data) {
                    if (data.type == "success") {
                        var blockHeight = JSON.parse(data.result)
                        if (lastBlock != blockHeight) {
                            syncChat();
                            lastBlock = blockHeight;
                        }
                        $('.channel-menu_prefix').html('#' + blockHeight + ' blocks');

                    }
                })
                .fail(function(xhr, textStatus, errorThrown) {
                    document.getElementById('result').innerHTML = '<div class=\"alert alert-danger\" role=\"alert\">ERROR<br>' + xhr.responseText + '<br></div>';
                });
        });
        setTimeout(function() {
            $('.alert').remove();
        }, 5000);
    }, 3000);

    $(".channel").click(function(e) {
        e.preventDefault();
        $(".message-history .active").removeClass('active').toggle();
        $("#" + $(this).attr('id') + "-messages").addClass('active').toggle();
    });

    $(".input-box_text").keyup(function(event) {
        if (event.keyCode == 13) {
            $("#btn-send").click();
        }
    });

    $('#selected-name').on('change', function (e) {
    var optionSelected = $("option:selected", this);
    var valueSelected = this.value;
    $('.selected-address').html(optionSelected.html());

});

    $('#form').ajaxForm({
        beforeSubmit: function() {
            $('#results').html('Submitting...');
        },
        success: function(data) {

            if (data.type == 'success') {
                document.getElementById('profile-icon').src = data.result + "";
                $("#icon-data").val(data.result)
                document.getElementById('result').innerHTML = "<div class=\"alert alert-success\" role=\"alert\">" + "The file has been added to the key! You still need to submit the result to make it persistent!" + "<br></div>";
            } else if (data.type == 'error') {
                document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">" + data.result + "<br></div>";
            } else {
                document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">" + "Unknown response" + ":<br>" + data + "<br></div>";
            }

        },
        error: function() {
            document.getElementById('result').innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">" + "An error occured" + ":<br></div>";
        }
    });
