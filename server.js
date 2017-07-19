// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
	// var Note = require("./models/Note.js");
	// var Article = require("./models/Article.js");
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

request("http://screenrant.com/movie-news/", function(err, res, html){
	var $ = cheerio.load(html);

	var results = [];

	$("li.full-thumb").each(function(i, element){
		var title = $(element).find("div.info-wrapper").find("h2.title").find("a").text();
		var excerpt = $(element).find("div.info-wrapper").find("div.details").find("div.excerpt").find("p").text();
		var author = $(element).find("div.info-wrapper").find("div.details").find("span.author").text();
		// var timeStamp = $(element).find("div.info-wrapper").find("div.details").find("time.pub-date").text();

		results.push({
			Title: title,
			Excerpt: excerpt,
			Author: author
			// Timestamp: timeStamp
		});
	});

	console.log(results);
})


// Routes
// +++++++++++++++++++++++++++++++++
// app.get("/", function(req, res){
// 	res.send("Hello World!");
// })

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});


