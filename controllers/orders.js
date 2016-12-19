// REST API for orders.

var InputParser = require('../lib/order_input_parser');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('orders.db');
// CREATE TABLE orders { id varchar(255) unique, date varchar(255) }

module.exports = function(app) {
	app.post("/orders", create);
	app.get("/orders/:id", read);
}

function create(request, response) {
	try { // validate input
		var data = InputParser.parse(request.body.order);
	} catch (e) {
		response.writeHead(400);
		response.write("ERROR: "+e);
		response.end();
		return;
	}

	db.run("INSERT INTO orders (id,date) VALUES (?,?)", data.id, data.date, function(err) {
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
}

function read(request, response) {
	try {
		id = InputParser.validateID(request.params.id);
	} catch(e) {
		response.writeHead(400);
		response.write("Improper ID format expecting <3digits>-<7digits>-<7digits>");
		response.end();
		return;
	}

	db.all("SELECT * from orders where id = ?", id, function(err, rows) {
		if (rows.length == 0) {
			response.writeHead(404); // not found
			response.write("Could not find order with id: " + id);
			response.end();
		} else {
			response.writeHead(200);
			response.write(JSON.stringify({
				order: rows[0].id,
				delivery: rows[0].date,
			}));
			response.end();
		}
	});
}

