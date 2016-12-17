// Serves up index.html, and the API

var options = { // defaults
	ip: '0.0.0.0',
	port: 9001,
};

var getopts = require("node-getopt").create([
	['', 'port=', 'Set port'],
	['h', 'help', '']
]).bindHelp();
var opt = getopts.parseSystem();

if (opt.argv.length > 0) {
	console.error("ERROR: Unexpected argument(s): " + opt.argv.join(', '));
	process.stdout.write(getopts.getHelp());
	process.exit(1);
}

// Merge opts into options
for (var attrname in opt.options) { options[attrname] = opt.options[attrname]; }

var fs = require('fs'),
	url = require('url'),
	path = require('path');

var connect = require('connect')();
var server = require('http');

var app = server.createServer(connect).
	listen(options.port, options.ip, function() {
		var addr = app.address();
		console.log("Server listening at http://" + addr.address + ":" + addr.port);
} );

app.on('error', function(err) {
	console.error('ServerError:', err.code);
	process.exit(1);
});

// === File Server === //
connect.use(function(request, response, next) {
	var uri = url.parse(request.url).pathname

	if (uri == "/") {
		console.log()
		var filename = path.join(process.cwd(), 'index.html');
		fs.readFile(filename, 'binary', function(err, file) {
			if (err) {
				response.writeHead(500, {
					'Content-Type': 'text/plain'
				});
				response.write('500 File Error: ' + path.join('/', uri) + '\n');
				response.end();
				return;
			}

			response.writeHead(200);
			response.write(file, 'binary');
			response.end();
		});
	} else {
		next();
	}
});

// === API === //
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('orders.db');

// var promise = require('bluebird');

// == RegExps == //
var orderIdRegexp = /^\/orders\/(\d{3}-\d{7}-\d{7})$/;
var orderInputRegexp = /^Order Number: (\d{3}-\d{7}-\d{7})\nEstimated Delivery by (\w+) (\d{0,2}), (\d{4})$/
// var months

connect.use(bodyParser.urlencoded({extended: false}));
connect.use(function(request, response, next) {
	var uri = url.parse(request.url).pathname;

	if (request.method == "POST" && uri == "/orders") {
		// CREATE
		// validate input
		console.log("body:", request.body.order)
		response.writeHead(200);
		response.write("cool");
		response.end();
	} else if (request.method == "GET" && uri.startsWith("/orders/")) {
		//READ
		// console.log(promise)
		// promise
		var id = uri.match(orderIdRegexp);
		if (!id) {
			response.writeHead(400);
			response.write("Improper ID format expecting <3digits>-<7digits>-<7digits>");
			response.end();
		}

		id = id[1]
		console.log("ID" ,id)
		db.all("SELECT * from orders where id = ?", id, function(err, rows) {
			console.log("xxxxx", rows);
			if (rows.length == 0) {
				response.writeHead(404); // not found
				response.write("Could not find order with id: " + id);
				response.end();
			}
		});


	} else {
		next();
	}

});




