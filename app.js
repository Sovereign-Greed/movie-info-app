var express        = require('express'),
	app            = express(),
	mongoose       = require('mongoose'),
	bodyParser     = require('body-parser'),
	passport       = require("passport"),
	LocalStrategy  = require("passport-local"),
	methodOverride = require("method-override"),
	flash          = require("connect-flash"),
	Movie          = require('./models/movie.js'),
	Comment        = require("./models/comment.js"),
	User           = require('./models/user.js');

//requring routes
var commentRoutes  = require("./routes/comments"),
	movieRoutes    = require('./routes/movies'),
	indexRoutes    = require('./routes/index'),
	omdbAPIRoutes  = require("./routes/omdbAPI"),
	userRoutes     = require("./routes/user");

// MONGO DATABASE CONNECTION 
mongoose.connect(process.env.DATABASEURL, { 
	useNewUrlParser: true, 
	useUnifiedTopology: true,
}).then(() => {
	console.log("Connected to DB cluster!")
}).catch(err => {
	console.log(err.message);
});

mongoose.set('useFindAndModify', false);

app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(flash());

//PASSPORT CONFIRGURATION
app.use(require('express-session') ({
	secret: "Star wars is mediocre sci fic movie",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
})

// SETTING UP ROUTES
app.use("/", indexRoutes);
app.use("/", omdbAPIRoutes);
app.use("/movies", movieRoutes);
app.use("/user", userRoutes);
app.use("/movies/:id/comments", commentRoutes);


app.listen(process.env.PORT || 3000);
