// Fetched plugins function
function pluginLoader(plugins){

    for(var i=0; i<plugins.length;i++){

        var frame = document.createElement("iframe");
        frame.className += "pluginJSFrame";

        var insertedFrame = document.body.appendChild(frame);

        var helperScript = insertedFrame.contentWindow.document.createElement("script");
        helperScript.type = "text/javascript";
        helperScript.src = "/client/js/helpers.js";

        /*var helperActivatorScript = document.createElement("script");
                helperActivatorScript.setAttribute("type", "text/javascript");
                helperActivatorScript.text = "var Burst = new parentHelper();";*/

        var pluginScript = insertedFrame.contentWindow.document.createElement("script");
        pluginScript.type = "text/javascript";
        pluginScript.src = "/plugins/" + plugins[i] + "/main.js";

        insertedFrame.contentWindow.document.body.appendChild(helperScript);
        /*insertedFrame.contentWindow.document.body.appendChild(helperActivatorScript);*/
        insertedFrame.contentWindow.document.body.appendChild(pluginScript);
    }

    // Send all plugins loaded message
    /*var script = document.createElement("script");
            script.innerHTML = "Burst.request({request:'pluginsLoaded')";
            document.body.appendChild(script);*/
}


// Fetch plugin list
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function(){

    if (xhttp.readyState == 4 && xhttp.status == 200) {

        var response = JSON.parse(xhttp.responseText);

        pluginLoader(response);
    }
};
xhttp.open("GET", "/getPlugins", true);
xhttp.send();