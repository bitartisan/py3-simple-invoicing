var ones_teens = ['', 'o', 'două', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'nouă', 'zece', 'unsprezece', 
					'doisprezece', 'treisprezece', 'paisprezece', 'cincisprezece', 'șaisprezece', 'șaptesprezece', 'optsprezece', 'nouăsprezece'];
var tens = ['', '', 'douăzeci', 'treizeci', 'patruzeci', 'cincizeci', 'șaizeci', 'șaptezeci', 'optzeci', 'nouăzeci'];

var thousand = ['', 'mie', 'mii'];

function number2Word(input) {
	var line;
	if (isNaN(input)) { return null; }

	var n = input;
	if (input > 999) {
		n = parseInt(input.toString().substr(1));
	}
	
	if (n === 0) {
		line = ""; 
	} else if (n < 20) {
		if (n == 1) {
			ones_teens[n] = 'unu';
		}
		line = ones_teens[n]; 
	} else if (n < 100) {
		line = tens[(n / 10) | 0]; 
		if (n%10) {
			line += " și " + (ones_teens[n % 10] == 'o' ? 'unu' : ones_teens[n % 10]);
		}
	} else {
		var hndrs = 'sută';
		if (n >= 200) {
			hndrs = 'sute';
		}
		line = ones_teens[(n / 100) | 0] + " " + hndrs + " " + number2Word(n % 100); 
	}
	
	if (input > 999) {
		var t = 'mie';
		ks = parseInt(input.toString()[0]);
		if (ks > 1) {
			t = ' mii ';
		}
		line = ones_teens[ks] + ' ' + t + ' ' + line;
	}
	
    if (typeof(line) != 'undefined')
	    return line.trim();
    else
        return '';
}
