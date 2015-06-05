// // get magnet link...
var tpb = require('thepiratebay');
// tpb
// 	.search("Ought More Than Any Other Day", {
// 		category: 100
// 	})
// 	.then(function(results){
// 		if(results.length > 1){
// 			var top_result = results[0];

// 			console.log(top_result.magnetLink);
// 		} else {
// 			console.log("I couldn't find anything");
// 		}
// 	})
// 	.catch(function(err){
// 		console.log(err);
// 	});


//http://pitchfork.com/reviews/best/albums/11/


var request = require("request");
var jsdom = require("node-jsdom");
var fs = require("fs");
var async = require("async");

var data_object = {
	last_added: "",
	albums: []
};

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

				next_album();

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

var last_page = 113;

var numbers = [];
for(var i = last_page; i > 0; i--){
	numbers.push(i);
}

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
		var write_file = process.cwd() + "/files.json";
		
		fs.writeFileSync(write_file, JSON.stringify(data_object, null, 4));

	}
);