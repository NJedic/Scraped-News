// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
var methodOverride = require("method-override");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(__dirname + "/public"));

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// var routes = require("./controllers/articleControllers.js");

// app.use("/", routes);
// app.use("/update", routes);
// app.use("/create", routes);

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/scrapedNews");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes
// +++++++++++++++++++++++++++++++++

// On Page Load
app.get("/", function(req, res){
	res.render("index");
});

// Scrape Articles
app.get("/scrape", function(req, res){
	// Grabbing the body of the html page with a request
	request("http://screenrant.com/movie-news/", function(err, res, html){
		// Load Cheerio
		var $ = cheerio.load(html);
		// Grab the page's lis
		$("li.full-thumb").each(function(i, element){

			// Save an empty result object
			var result = {};

			result.title = $(this).find("div.info-wrapper").find("h2.title").find("a").text();
			result.excerpt = $(this).find("div.info-wrapper").find("div.details").find("div.excerpt").find("p").text();
			result.author = $(this).find("div.info-wrapper").find("div.details").find("span.author").text();
			result.link = $(this).find("div.info-wrapper").find("h2.title").find("a").attr("href");

			var entry = new Article(result);

			entry.save(function(err, doc){
				if (err){
					console.log(err);
				}
				else{
					console.log(doc);
				}
			});
		});
	});
	res.redirect("/articles");
});

// Display Articles after scrape
app.get("/articles", function(req, res){
	Article.find({}).exec(function(err, doc){
		if (err){
			console.log(err);
		}
		else{
			res.render("index", {Article: doc})
		}
	})
});

// Set a favorite Article
app.put("/markfav/:id", function(req, res){
	Article.update({"_id": req.params.id}, {$set: {favorite: true}}, function(err, res){
		if(err){
			console.log(err);
		}		
	});
	return res.redirect("/articles");
});

// Display ONLY favorite Articles
app.get("/savedarticles", function(req, res){
	Article.find({favorite: true}).populate("note", ["body"]).exec(function(err, doc){
		if (err){
			console.log(err);
		}
		else{
			res.render("saved", {Article: doc})
		}
	})
});

// UN-favorite an Article
app.put("/unmarkfav/:id", function(req, res){
	Article.update({"_id": req.params.id}, {$set: {favorite: false}}, function(err, res){
		if(err){
			console.log(err);
		}		
	});
	return res.redirect("/savedarticles");
});

// Post a Note
app.post("/submitnote/:id", function(req, res){
	
	var newNote = new Note(req.body);

	newNote.save(function(err, doc){
		if(err){
			res.send(err);
		}
		else{
			Article.findOneAndUpdate({"_id": req.params.id}, {$push: {"note": doc._id}}, {new: true}).exec(function(err, newNote){
				if(err){
					res.send(err);
				}
				else{
					res.redirect("/savedarticles");
				}
			});
		}
	});
});

// Delete a Note
app.get("/deletenote/:id", function(req, res){
	Note.remove({"_id": req.params.id}).exec(function(err, res){
		if(err){
			res.send(err);
		}
	});
		
	return res.redirect("/savedarticles");
});


// Listen on port 3000
app.listen(3001, function() {
  console.log("App running on port 3001!");
});


