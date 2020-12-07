var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user.js");
var request = require("request");
var middleware = require("../middleware");

// landing page route - redirect's to index movie page at the moment
router.get("/", (req, res) => {
	// res.render('landing');
	res.redirect('/movies')
})

// show register form
router.get("/register", (req, res) => {
	res.render("register");
})

// handle sign up logic
router.post("/register", function(req, res) {
	var newUser = new User({username: req.body.username});
	// if correct admincode is entered admin con is true
	if (req.body.adminCode == "iamironman") {
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message + ".");
			return res.redirect('register');
		}
		passport.authenticate("local") (req,res, function() {
			req.flash("success", "Welcome to FilmR8R, " + req.body.username + "!")
			res.redirect("/movies");
		});
	});
});

// show login form
router.get("/login", function(req, res) {
	res.render("login");
});

// handle login logic
router.post("/login", passport.authenticate("local",
	{
	successRedirect: "/movies",
	failureRedirect: "/login",
	failureFlash: true,
	}), function (req, res) {
});

// logout logic
router.get("/logout", middleware.isLoggedIn, function(req, res) {
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/movies");
})

module.exports = router;