
var idRegexp = /^\d{3}-\d{7}-\d{7}$/;
var orderInputRegexp = /^Order Number: (\d{3}-\d{7}-\d{7}) Estimated delivery by ([\w.]+) (\d{0,2})(st|th)?, (\d{4})( - ([\w.]+) (\d{0,2})(st|th)?, (\d{4}))?$$/
// capture format:
// 1 : order number,
// 2 : begin month,
// 3 : begin day,
// 5 : begin year,
// 7 : end month,
// 8 : end day,
// 10: end year

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

module.exports = {
	validateID: function(id) {
		if (idRegexp.exec(id)) return id;
		else throw "Invalid ID";
	},
	parse: function(data) {
		// console.log("DATA:", data)
		data = orderInputRegexp.exec(data);
		try {
			var day, month, year;
			if (!data[7]) { // use the first date.
				day = data[2];
				month = data[1];
				year = data[5];
			} else { // use the second date.
				day = data[8];
				month = data[7];
				year = data[10];
			}

			// Normalize month
			if (month.match(/\.$/)) {
				monthArr = Object.keys(months);
				wordMonth = month.slice(0, -1); // remove period

				for(var i = 0; i < monthArr.length; i++) {
					if (monthArr[i].startsWith(wordMonth)) {
						// console.log("XXX", monthArr[i], wordMonth)
						month = months[monthArr[i]];
					}
				}
			}
			// Check day
			if (day > month[1]) throw "date higher than the numbe of days in the month!"
			date = year+'-'+month[0]+'-'+day;

		} catch(e) {
			console.log("\nerror:",e)
			throw "Improper order format expecting:\nOrder Number: 232-9384712-9823512\nEstimated delivery by Dec. 20, 2016 - Dec. 30, 2016";
		}

		return {
			id: data[1],
			date: date
		};
	}
}
