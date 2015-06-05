var _PT = {};
var page = document.querySelector("#content");

//load workouts
var httpCallback = function(){
	_PT.albums = JSON.parse(this.responseText)["albums"];
	_PT.albums.reverse();

	_PT.albums.forEach(function(album){
		var el = document.createElement("div");
		el.className = "album_tile";

		el.innerHTML = '<a href="#"><img src="' + album.artwork + '"></a><h2>' + album.artist + '</h2><h1>' + album.album + '</h1><h3>' + album.score + '</h3>';
		el.__album = album;

		var hue = Math.floor(Math.random() * 300);

		el.querySelector("img").style.backgroundColor = "hsla(" + hue + ", 75%, 75%, 1)";

		page.appendChild(el);

		window.scrollTop = 0;
	});
};

var httpRequest = new XMLHttpRequest();
httpRequest.onload = httpCallback;
httpRequest.open("get", "/albums.json", true);
httpRequest.send();