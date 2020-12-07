var express = require("express");
var router  = express.Router({mergeParams: true});
var Movie = require("../models/movie");
var Comment = require("../models/comment");
var User = require("../models/user");
var middleware = require("../middleware");

var date = require("date-and-time");
var now = new Date();

// new comments form route
router.get("/new", middleware.isLoggedIn, (req, res) => {
	Movie.findById(req.params.id, function(err, foundMovie) {
		if(err) {
			res.status(404).json({err: err})
		} else {
			res.render("comments/new", {movie: foundMovie});
		}
	})
})
	
// new comments post route
router.post("/", middleware.isLoggedIn, (req, res) => {
	Movie.findById(req.params.id, function(err, foundMovie) {
		if (err) {
			req.flash("error", err.message);
			res.redirect("/movies/" + foundMovie._id);
		} else {
			var newComment ={
				dateAndTime: date.format(now, 'hh:mm A DD/MM/YY'),
				text: req.body.comment.text,
			} 
			Comment.create(newComment, function(err, comment) {
				if (err) {
					req.flash("error", err.message);
					res.redirect("/movies/" + foundMovie._id);
				} else {
					// save user id and name to comment
					comment.author.id = req.user.id;
					comment.author.username = req.user.username;
					// save comment to movie
					comment.save();
					foundMovie.comments.push(comment);
					foundMovie.save()
					req.flash("success", "New comment posted!");
					res.redirect("/movies/" + foundMovie._id);
				}
			})
		}
	})
})

// get - EDIT comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
	Comment.findById(req.params.comment_id, function(err, foundComment) {
		if (err) {
			req.flash("error", err.message);
			res.redirect("/movies/" + req.params.id);
		} else {
			res.render('comments/edit', {movie_id: req.params.id, comment: foundComment})
		}
	})
})

// UPDATE/PUT - update comment
router.put("/:comment_id", function(req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, upatedComment) {
		if (err) {
			res.redirect("back");
		} else {
			req.flash("success", "Comment edited!");
			res.redirect('/movies/' + req.params.id);
		}
	})
})

// UPDATE - upvote comment
router.put("/:comment_id/upvote", middleware.isLoggedIn, function(req, res) {
	Comment.findById(req.params.comment_id, (err, currentComment) => {
		// err handle
		if (err) {return res.status(404).json({err: err.message})}
		
		User.findById(req.user._id, (err, currentUser) => {
			// err handle
			if (err) {return res.status(404).json({err: err.message})}
			
			let alreadyliked = false;
			
			// maps over user's liked comments for id match
			currentUser.upvotedComments.map(lr => {
				if (lr.equals(currentComment._id)) {
					// if match alreadyFavorited true
					alreadyliked = true;
				}    
			})
			
			if (alreadyliked) {
				// removes one upvote from comment
				currentComment.upvotes -= 1
				currentComment.save();
				// removes comment from user's upvotedComments arr
				currentUser.upvotedComments = currentUser.upvotedComments.filter((lc) => {
					!lc.equals(currentComment._id);
				})
				currentUser.save().then(() => {
					console.log("Removed like from comment");
				})
				req.flash("success", "Removed upvote.")
			} else {
				// adds upvote to comment
				currentComment.upvotes += 1;
				currentComment.save();
				// adds comment to user's upvotedComments arr
				currentUser.upvotedComments.push(currentComment);
				currentUser.save().then(() => {
					console.log("Upvoted Comment");
				})
				req.flash("success", "Comment upvoted!")
			}
			res.redirect("/movies/" + req.params.id);
		})
	})
})

// DELETE
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, function(err) {
		if (err) {
			req.flash('error', err.message);
			res.redirect("/movies/" + req.params.id)
		} else {
			req.flash("success", "Comment deleted!")
			res.redirect("/movies/" + req.params.id);
		}
	})
})


module.exports = router;