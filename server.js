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
// CREATE TABLE orders { id varchar(255) unique, date varchar(255) }

// == RegExps == //
var orderIdRegexp = /^\/orders\/(\d{3}-\d{7}-\d{7})$/;
var orderInputRegexp = /^Order Number: (\d{3}-\d{7}-\d{7}) Estimated delivery by ([\w.]+) (\d{0,2}), (\d{4})( - ([\w.]+) (\d{0,2}), (\d{4}))?$$/
// capture format:
// 1 : order number,
// 2 : begin month,
// 3 : begin day,
// 4 : begin year,
// 6 : end month,
// 7 : end day,
// 8 : end year

var months = { //TODO use moment.js instead.
	January: [1, 31],
	February: [2, 29],
	March: [3, 31],
	April: [4, 30],
	May: [5, 31],
	June: [6, 30],
	July: [7, 31],
	August: [8, 31],
	September: [9, 30],
	October: [10, 31],
	November: [11, 30],
	December: [12, 31],
}

connect.use(bodyParser.urlencoded({extended: false}));
connect.use(function(request, response, next) {
	var uri = url.parse(request.url).pathname;

	if (request.method == "POST" && uri == "/orders") {
		// == CREATE ==//
		// validate input
		console.log("body:", request.body.order)
		var data = request.body.order.match(orderInputRegexp);
		console.log("data:", data);

		var date;
		try {
			// if (data[6])
			month = months[data[6]];
			if (data[7] > month[1]) throw "date higher than the numbe of days in the month!"
			console.log("MMMM", data[6], month)
			date = data[8]+'-'+month[0]+'-'+data[7];
		} catch(e) {
			response.writeHead(400);
			response.write("Improper order format expecting:\nOrder Number: 232-9384712-9823512\nEstimated delivery by Dec. 20, 2016 - Dec. 30, 2016");
			response.end();
			return;
		}

		db.run("INSERT INTO orders (id,date) VALUES (?,?)", data[1], date, function(err) {
			console.log("cbxx", arguments)
			if (err) {
				response.writeHead(400);
				response.write("An order with that id already exists!");
				response.end();
			} else {
				response.writeHead(200);
				response.write("cool");
				response.end();
			}
		});

	} else if (request.method == "GET" && uri.startsWith("/orders/")) {
		// == READ == //
		var id = uri.match(orderIdRegexp);
		if (!id) {
			response.writeHead(400);
			response.write("Improper ID format expecting <3digits>-<7digits>-<7digits>");
			response.end();
			return;
		}

		id = id[1]
		console.log("ID" ,id)
		db.all("SELECT * from orders where id = ?", id, function(err, rows) {
			console.log("xxxxx", rows);
			if (rows.length == 0) {
				response.writeHead(404); // not found
				response.write("Could not find order with id: " + id);
				response.end();
			} else {
				response.writeHead(200); // not found
				response.write(JSON.stringify({
					order: rows[0].id,
					delivery: rows[0].date,
				}));
				response.end();
			}
		});


	} else {
		// next();
	}

});




