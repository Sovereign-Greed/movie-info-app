var mongoose = require('mongoose');

var MovieSchema = new mongoose.Schema({
	// file info for searching or verifying
	movieTitle: String,
	apiID: String,
	omdbURL: String,
	comments: [
		{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
		}
	],
	// number of users that added this movie to their favorites
	hearts: {type: Number, default : 0},
	// all info pulled from OMDB Api
	omdbInfo: {
		Title: String,
		Year: String,
		Rated: String,
		Released: String,
		Runtime: String,
		Genre: String,
		Director: String,
		Writer: String,
		Actors: String,
		Plot: String,
		Language: String,
		Country: String,
		Awards: String,
		Poster: String,
		Ratings: Array,
		Metascore: String,
		imdbRating: String,
		imdbVotes: String,
		Type: String,
		DVD: String,
		BoxOffice: String,
		Production: String,
		Website: String,
		Response: String,
	}
});

module.exports = mongoose.model("MoviePost", MovieSchema); 