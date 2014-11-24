var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

var privateKey = fs.readFileSync('./ssl/server.key', 'utf8');
var certificate= fs.readFileSync('./ssl/commote_net.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate };



app.get('/scrape', function(req, res){
	console.log("HI!\n");
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
					// Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
					res.send(json);
				}
			});

		}

	});

});

https.createServer(credentials, app).listen('8081')
http.createServer(app).listen('8082');
console.log('Started on HTTPS port 8081');
console.log('Started on HTTP port 8082');
exports = module.exports = app;
