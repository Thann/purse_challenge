// Starts wbeserver on port, and loads controllers.

var options = { // defaults
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

var fs = require('fs');
var	path = require('path');
var app = require('express')();

// Load middleware
app.use(require('body-parser').urlencoded({extended: false}));

// Load all controllers from the controllers directory.
var controllers = path.join(__dirname, 'controllers');
fs.readdirSync(controllers).forEach(function(file) {
  require(path.join(controllers, file))(app);
});

app.listen(options.port, function() {
	console.log("Server listening at http://localhost:"+options.port)
});
