var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){
	
	url = 'http://www.ratemyprofessors.com/search.jsp?query=' + encodeURI(req.query.p);

	var redirect = -1;
	var json = { overall : "", helpfulness : "", clarity : "", easiness: ""};
	request(url, function(error, response, html){ // initial query
		if(!error){
			var $ = cheerio.load(html);


			$('.listing.PROFESSOR').each(function() { // search each result for a WPI teacher
				if ($('.sub', this).text().indexOf("Worcester Polytechnic Institute") > -1) { // if they are a WPI teacher
					redirect = $('a', this).attr("href");
					url = 'http://www.ratemyprofessors.com' + redirect;
					return false; // break out of each loop
				}
			});
			
			
			
			request(url, function(error, response, html) { // professor page
				if (!error) {
					var $ = cheerio.load(html);
					$('.rating-breakdown').filter(function() {
						var data = $(this);
						var overall = $('.grade', data).first().text();						

						var helpfulness = $(".label:contains('Helpfulness')", data).next().text();
						var clarity = $(".label:contains('Clarity')", data).next().text();
						var easiness = $(".label:contains('Easiness')", data).next().text();
						console.log(clarity);

						json.overall = overall;
						json.helpfulness = helpfulness;
						json.clarity = clarity;
						json.easiness = easiness;
					});
					
					fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
						console.log('File successfully written! - Check your project directory for the output.json file');

					});
					// Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
					res.send(json);
				}
			});
			
		}
		
	});
	
});

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;