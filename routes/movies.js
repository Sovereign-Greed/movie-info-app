var express = require("express");
var router = express.Router();
var Movie = require('../models/movie');
var User = require('../models/user');
var request = require("request");
var middleware = require("../middleware");


//------------------
// MOVIES ROUTES
//------------------

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// index movies page search / view all 
router.get("/", (req, res) => {
	// renders index from search results
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Movie.find({ movieTitle: regex}, function(err, movies) {
			if (err) {
				res.status(404).json({err: err.message});
			}
			res.render('movies/index', {allMovies: movies, search: true});
		})
	// renders index from basic req
	} else {
		let foundMovies;
		Movie.find({}, function(err, movies) {
			if (err) {
				res.status(404).json({err: err.message});
			} else {
				// sorts movies based on rating and slice to only show top 8
				foundMovies = movies.sort((a, b) => parseFloat(b.omdbInfo.imdbRating) - parseFloat(a.omdbInfo.imdbRating)).slice(0,8)
				res.render('movies/index', {allMovies: foundMovies, search: false});
			}
		})
	}
})

// show route for individual movie
router.get("/:id", (req, res) => {
	Movie.findById(req.params.id).populate("comments").exec(function(err, foundMovie) {
		if (err) {
			req.flash("error", "Movie post not found.")
			res.redirect("/movies");
		} else {
			res.render("movies/show", {movie: foundMovie})
		}
	})
})

// update route for hearts - adds movie to user's fav and update for heart counter for movie
router.put("/:id", middleware.isLoggedIn, (req, res) => {
		
	User.findById(req.user._id, (err, currentUser) => {
		// error handle 
		if (err) {return res.status(404).json({err: err.message})}
		
		Movie.findById(req.params.id, (err, currentMovie) => {
			// error handle 
			if (err) {return res.status(404).json({err: err.message})}
			
			let alreadyFavorited = false;
			
			// maps over user's favorites movies for id match
			currentUser.favorites.map(userMovie => {
				if (userMovie.equals(currentMovie._id)) {
					// if match alreadyFavorited true
					alreadyFavorited = true;
				}    
			})
			
			if (alreadyFavorited) {
				// removes one heart from movie
				currentMovie.hearts -= 1
				currentMovie.save();
				// removes movie from from user's favorites
				currentUser.favorites = currentUser.favorites.filter((movie) => {
					!movie.equals(currentMovie._id);
				})
				currentUser.save().then(() => {
					console.log("Movie removed from favorites");
				})
				req.flash("success", "Movie has been removed from your Favorites!")
			} else {
				// adds one heart for movie
				currentMovie.hearts += 1;
				currentMovie.save();
				// adds movie to user's favorites
				currentUser.favorites.push(currentMovie);
				currentUser.save().then(() => {
					console.log("Movie added to favorites");
				})
				req.flash("success", "Movie has been added to your Favorites!")
			}
			res.redirect("/movies/" + req.params.id);
		})
	})
})

// delete route for movie
router.delete("/:id", middleware.checkAdminStatus, (req, res) => {
	Movie.findByIdAndRemove(req.params.id, function(err, deletedMovie) {
		if (err) {
			res.status(404).json({err: err.message});
		} else {
			req.flash("success", "Movie post has been deleted!");
			res.redirect("/movies");
		}
	})
})

module.exports = router;