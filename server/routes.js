const http = require("http");
const https = require("https");
const config = require("./config.js");

const routes = [
	{
		method: 'GET',
		path: '/',
		handler: function(request, reply){
			console.log(request.params);
			return reply.redirect('/qora/')
		}
	},
	{
		method: 'GET',
		path: '/qora/{path*}',
		handler: function(request, reply){
			console.log(request.params);
			return reply.file('./client/index.html');
		}
	},
	{
		method: 'GET',
		path: '/client/{param*}',
		handler: {
			directory: {
				path: './client',
				redirectToSlash: true,
				index: true
			}
		}
	},
    {
        method: 'GET',
        path: '/getPlugins',
        handler: function(request, reply){
            var pluginList = require("./pluginList.js");
            return reply(pluginList.plugins);
        }
    },
	{
		method: 'GET',
		path: '/plugins/{param*}',
		handler: {
			directory: {
				path: './plugins',
				redirectToSlash: true,
				index: true
			}
		}
    },
    {
        method: 'GET',
        path: '/plugins/404',
        handler: function(request, reply){
            return reply.file('./client/404.html');
        }
    },
    {
        method: 'GET',
        path: "/testProxy/{requestJSON*}",
        handler: (request, reply) => {
            reply.proxy({
                uri: request.params.requestJSON
            });
        }
    },
    {
        method: 'POST',
        path: "/testPostProxy/{requestJSON*}",
        handler: (request, reply) => {
            reply.proxy({
                uri: request.params.requestJSON
            });
        }
    },
    {
        method: 'GET',
        path: "/explorerRequest/{requestJSON*}",
        handler: (request, reply) => {
            const options = JSON.parse(request.params.requestJSON);
            
            /*
            options.=>
            path = "/index/blockexplorer.json"
            protocol = "http"
            host = "127.0.0.1"
            port = "9090"
            method = "GET"
            data = {addr: "Qjshfiuwefh984hfwf"}
            
            */
            
            reply();
        }
    },
    {
        method: 'GET',
        path: "/proxy/{requestJSON*}",
        handler: function(request, reply){
            
            
            const parsed = JSON.parse(request.params.requestJSON);
            //console.log(parsed);
            
            /*return reply.proxy({
                uri: parsed.protocol + "://" + parsed.host + ":" + parsed.port + parsed.path,
                passThrough: true,
                host: parsed.host,
                port: parsed.port,
                protocol: parsed.protocol });
            */
            
            function proxyRequest(res){
                //console.log(res);   
                res.setEncoding('utf8');
                let body = [];
                res.on('data', chunk => {
                    console.log(chunk);
                    body.push(chunk);
                }).on('end', () => {
                    reply(body.join(""));
                })
            }
            
            var options = parsed;
            var urlParams = ""
            // POST DATA....if it's a post request
            if(options.method.toUpperCase() == "POST"){
                options.headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(options.data)
                }
            }
            else{
                urlParams = "?" + Object.keys(options.data).map(function(k) {
                    return encodeURIComponent(k) + "=" + encodeURIComponent(options.data[k]);
                }).join('&');
            }
            
            options.path += urlParams;
            console.log(options);
            
            options.protocol += ":";
            var protocol = (options.protocol == 'https:' ? https : http);
            protocol.request(options, proxyRequest).end();
            
        }
    },
    {
        method: 'GET',
        path: "/api/{requestJSON*}",
        handler: function(request, reply){
            var parsed = JSON.parse(request.params.requestJSON);
            console.log(parsed);
            
            // Converts JSON to a query string
            var urlParams = Object.keys(parsed).map(function(k) {
                return encodeURIComponent(k) + "=" + encodeURIComponent(parsed[k]);
            }).join('&');
            
            var options = {
                host: config.wallet.host,
                port: config.wallet.port,
                path: '/burst?' + urlParams,
                method: 'POST'
            };
            
            function burstRequest(res){
                //console.log(res);   
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    console.log(chunk);
                    reply(chunk);
                });
            }
            http.request(options, burstRequest).end();
            /*if(config.wallet.protocol == "https"){
                https.request(options, burstRequest).end();
            }
            else{
                http.request(options, burstRequest).end();
            }*/
        }
    }
];

module.exports = routes;