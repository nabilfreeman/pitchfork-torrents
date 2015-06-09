// NOTE: This needs to be run with node.js. 
// Its purpose is to generate/update albu,s.json, which in this repo is a list of all "Best of" albums on Pitchfork.

// // get magnet link...
var tpb = require('thepiratebay');
var request = require("request");
var jsdom = require("node-jsdom");
var fs = require("fs");
var async = require("async");
var spinner = require("simple-spinner");

var data_object = {
	last_added: "",
	albums: []
};

var not_found_number = 0;

var parseData = function(html, callback) {

	jsdom.env(html, [], function (errors, window) {

		var document = window.document;

		//NodeList is missing some important functions
		window.NodeList.prototype.forEach = window.Array.prototype.forEach;
		window.NodeList.prototype.slice = window.Array.prototype.slice;

		var albums = document.querySelectorAll("html body #content #main .bnm-list>li");

		var album_objects = [];

		async.eachSeries(
			albums, 
			function(album, next_album) {

				var data = {};

				data.artist = album.querySelector(".info h1").innerHTML;
				data.album = album.querySelector(".info h2").innerHTML;
				data.score = album.querySelector(".info .score.bnm").innerHTML;
				data.artwork = album.querySelector(".artwork .lazy")
					.getAttribute("data-content")
					.replace(' <img src="', '')
					.replace("/list.", "/homepage_large.")
					.replace('" />', '');

				album_objects.push(data);

				tpb
					.search(data.artist + " " + data.album, {
						category: 100
					})
					.then(function(results){
						if(results.length > 0){
							var top_result = results[0];

							data.magnet = top_result.magnetLink;
						} else {
							not_found_number += 1;
						}
						next_album();
					})
					.catch(function(err){
						console.log(err);
					});

			}, function(err){
				//callback
				album_objects = album_objects.reverse();
				album_objects.forEach(function(obj){
					data_object.albums.push(obj);
				});
				callback();
				// var write_file = process.cwd() + "/files.json";
				
				// fs.writeFileSync(write_file, JSON.stringify(data_object));

			}
		);

	});
};

//TODO right now i manually figured out that there are 113 pages of BNM on Pitchfork.
//next time i will once again have to check if there are more pages as a result of new albums.
//so... it would be cool if this could be automated.
var last_page = 113;

var numbers = [];
for(var i = last_page; i > 0; i--){
	numbers.push(i);
}

spinner.start();

async.eachSeries(
	numbers, 
	function(number, next_number) {
		
		console.log("getting number " + number);

		request('http://pitchfork.com/reviews/best/albums/' + number, function(err, response, html){
			if (!err && response.statusCode == 200) {
				parseData(html, function(){
					console.log("finished page number " + number)
					next_number();
				});
			} else {
				console.log("error fetching page number " + number);
				next_number();
			}
		});

	}, function(err){
		//callback
		spinner.stop();

		console.log("I scraped " + data_object.albums.length + " albums with magnet links!");
		console.log("I couldn't find a torrent for " + not_found_number + " albums... :(")

		var write_file = process.cwd() + "/../albums.json";
		
		fs.writeFileSync(write_file, JSON.stringify(data_object, null, 4));

	}
);