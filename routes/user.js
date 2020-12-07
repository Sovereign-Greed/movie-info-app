var express = require("express");
var router = express.Router();
var Movie = require('../models/movie');
var User = require('../models/user');
var middleware = require("../middleware");

// user - home page
router.get("/:id", middleware.isLoggedIn, function(req, res) {
	User.findById(req.params.id).populate("favorites").exec((err, foundUser) => {
		if (err) {return res.status(404).json({err: err.message})}
		
		res.render("users/userpage", {foundUser: foundUser})
	})
})

// user - edit profile info form
router.get("/:id/edit", middleware.isLoggedIn, (req, res) => {
	User.findById(req.params.id, (err, foundUser) => {
		// error handle 
		if (err) {
			req.flash("error", err.message)
			res.redirect("/user/" + req.params.id);
		}
		// compare user logged ID vs target user ID for edit
		else if (!foundUser._id.equals(req.user._id)) {
			// id not match error handle
			req.flash("error", "This is not your profile!");
			res.redirect("/user/" + req.params.id);
		} else {
			res.render("users/edit", {foundUser: foundUser})
		}
	})
})

// user - update router
router.put("/:id", middleware.isLoggedIn, (req, res) => {
	User.findById(req.params.id, (err, foundUser) => {
		// error handle
		if (err) {
			req.flash("error", err.message)
			res.redirect("/user/" + req.params.id);
		}
		// compare user logged ID vs target user ID for edit
		else if (!foundUser._id.equals(req.user._id)) {
			// id not match error handle
			req.flash("error", "This is not your profile!");
			res.redirect("/user/" + req.params.id);
		}
		
		foundUser.about = req.body.userInfo.about;
		foundUser.favouriteQuote = req.body.userInfo.quote;
		foundUser.save();
		
		req.flash("success", "Your profile has been successfully updated.")
		res.redirect("/user/" + req.params.id);
	})	
})

module.exports = router;









