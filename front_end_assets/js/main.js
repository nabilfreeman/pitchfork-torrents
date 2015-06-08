var _PT = {
	render_index: 0,
	render_amount: 8
};
var page = document.querySelector("#content");

//load workouts
var httpCallback = function(){
	_PT.albums = JSON.parse(this.responseText)["albums"];
	_PT.albums.reverse();

	renderBatch(_PT.render_amount);
};

var renderBatch = function(amount){
	var rendered = 0;

	var scroll_position = document.body.scrollTop;
	var get_older_albums = document.querySelector(".older_albums_wrapper");

	while(rendered < amount){
		// if(index > 10) return;

		var album = _PT.albums[_PT.render_index];

		_PT.render_index += 1;

		if(album.magnet !== undefined){
			var el = document.createElement("div");
			el.className = "album_tile";

			el.innerHTML = '<a href="' + album.magnet + '"><img src="' + album.artwork + '"></a><h2>' + album.artist + '</h2><h1>' + album.album + '</h1><h3>' + album.score + '</h3>';
			el.__album = album;

			var hue = Math.floor(Math.random() * 300);

			//disable image loading to speed up during development.
			// el.querySelector("img").setAttribute("src", "");
			el.querySelector("img").style.backgroundColor = "hsla(" + hue + ", 75%, 75%, 1)";

			el.querySelector("a").addEventListener("click", function(){
				if(window.ga !== undefined){
					ga('send', 'event', 'album', 'clicked album');
				}
			});

			page.insertBefore(el, get_older_albums);

			rendered += 1;
		}
	}

	if(get_older_albums === null){
		var clicky = document.createElement("div");
		clicky.className = "older_albums_wrapper";
		clicky.innerHTML = "<button>More albums...</button>"
			+ "<footer><a href='http://github.com/nabilfreeman/pitchfork-torrents'>View source code</a>. Thanks Pitchfork!</footer>";

		clicky.querySelector("button").addEventListener("click", function(e){
			e.preventDefault();
			renderBatch(_PT.render_amount);

			if(window.ga !== undefined){
				ga('send', 'event', 'more button', 'clicked more button');
			}
		});

		clicky.querySelector("footer a").addEventListener("click", function(e){
			if(window.ga !== undefined){
				ga('send', 'event', 'github link', 'clicked github link');
			}
		});

		page.appendChild(clicky);
	}

	document.body.scrollTop = scroll_position;
}

var httpRequest = new XMLHttpRequest();
httpRequest.onload = httpCallback;
httpRequest.open("get", "albums.json", true);
httpRequest.send();