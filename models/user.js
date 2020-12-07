var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	avatar: String,
	firstName: String,
	lastName: String,
	email: String,
	about: {default: "", type: String},
	favouriteQuote: {default: "", type: String},
	isAdmin: {type: Boolean, default: false},
	favorites: [
		{
		type: mongoose.Schema.Types.ObjectId, 
		ref: "MoviePost"
		},
	],
	upvotedComments: [
		{type: mongoose.Schema.Types.ObjectId, ref: "upvotedComment"}
	],
	hearts: {default: 0, type: Number}
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);