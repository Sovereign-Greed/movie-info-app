var express = require("express");
var router = express.Router();
var request = require("request");
var middleware = require("../middleware");
var Movie = require("../models/movie")

// get search page for omdbAPI
router.get("/search_key", middleware.isLoggedIn, (req, res) => {
	res.render("omdbAPI/search_key");
})

// post - search movie results from omdb api
router.post("/found_movies", middleware.isLoggedIn, (req, res) => {
	var searchFrontURL = process.env.searchFrontURL;
	var searchEndURL = process.env.searchEndURL;
	request(searchFrontURL + req.body.movie.title + searchEndURL, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var results = JSON.parse(body)
			res.render("omdbAPI/new", {results: results});
		}
	})
}) 

// post movie route/ finds movie through api search id
router.post("/movies", middleware.isLoggedIn, (req, res) => {
	var postFrontURL = process.env.postFrontURL;
	var postEndURL = process.env.postEndURL;
	var apiID = req.body.movie.imdbID.replace(/\s+/g, '');
	
	var fullURL = postFrontURL + apiID + postEndURL;	
	
	
	let movieNotPosted = true;
	console.log(`con 1 - ${movieNotPosted}`)
	
	Movie.find({}, (err, movies) => {
		if (err) {
			req.flash("error", err.message);
			res.redirect('/movies');
		}
		console.log(`con 2 - ${movieNotPosted}`)
		// check to see if movie entry exists
		movies.forEach(movie => {
			var movieURL = movie.omdbURL.slice();	
			if (movieURL == fullURL.slice()) {
				console.log(`con 3 - ${movieNotPosted}`)
				// if match found post is turned false so entry cannot be created
				movieNotPosted = false;
				console.log(`con 4 - ${movieNotPosted}`)
			}
		})
	}).then(() => {
		if (movieNotPosted) {
			console.log(`con 5 - ${movieNotPosted}`)
			// if movie entry hasn't been created 
			request(fullURL, function(error, response, body) {
				if (!error && response.statusCode == 200) {
					var foundMovie = JSON.parse(body);
					var movieEntry = {
						movieTitle: foundMovie.Title,
						apiID: foundMovie.imdbID,
						omdbURL: fullURL,
						// all info from omdb api
						omdbInfo: {...foundMovie},
					}
					Movie.create(movieEntry, function(err, newEntry) {
						if (err) {
							req.flash("error", err.message);
							res.redirect("/movies");
						} else {
							newEntry.save();
							req.flash("success", "Movie entry successfully posted!");
							res.redirect("/movies");
						}
					})
				}
			})
		} else {
			console.log(`con 6 - ${movieNotPosted}`)
			// if is dupe entry sends error and boots back to search page
			req.flash("error", "Movie already posted, Try using the search bar to find your Movie instead.")
			res.redirect("/movies");
		}
	})
})

module.exports = router;