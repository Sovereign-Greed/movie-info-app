var User = require("../models/user");
var Comment = require("../models/comment");

var middlewareObj = {}

// checks to see if user is logged in
middlewareObj.isLoggedIn = function(req, res, next) {
	if(req.isAuthenticated()){
    	return next();
    } 
	req.flash("error", "You need to be logged in to do that.");
	res.redirect("/login");
}

// verifies comment ownership
middlewareObj.checkCommentOwnership = function(req, res, next) {
	// login in check
	if(req.isAuthenticated()){
    	Comment.findById(req.params.comment_id, function(err, comment) {
			if (err) {
				res.status(404).json({err: err});
			} else {
				// compared user id with comment author id
				if (comment.author.id.equals(req.user.id)) {
					next();
				} else {
					req.flash("error", "This is not your Comment.");
				}
			}
		})
    } else {
		req.flash("error", "You need to be logged in to do that.");
		res.redirect("/login");
	}
}

// verfies admin status
middlewareObj.checkAdminStatus = function(req, res, next) {
	if (req.isAuthenticated() && res.locals.currentUser.isAdmin) {
		return next();
	}
	req.flash("error", "You are not an Admin.");
	res.redirect("/login");
}


module.exports = middlewareObj;