var mongoose = require('mongoose');

var CommentSchema = mongoose.Schema({
	text: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		username: String,
	},
	dateAndTime: String,
	upvotes: {type: Number, default: 0},
})

module.exports = mongoose.model("Comment", CommentSchema);