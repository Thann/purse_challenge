// Serves up index.html

var fs = require('fs'),
	url = require('url'),
	path = require('path');

module.exports = function(app) {
	app.get("/", function(request, response) {
		var uri = url.parse(request.url).pathname

		var filename = path.join(__dirname, '..', 'index.html');
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
	});
};