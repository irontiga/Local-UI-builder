const Path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');
const Nes = require('nes');
const routes = require('./routes');
const h2o2 = require('h2o2')

const server = new Hapi.Server({
	connections: {
		routes: {
			files: {
				relativeTo: Path.join(__dirname, '../')
			}
		}
	}
});
server.connection({ port: 3000 });

server.register(Inert, () => {});
server.register(h2o2, () => {});



server.route(routes);

server.start((err) => {

	if (err) {
		throw err;
	}

	console.log('Server running at:', server.info.uri);
});