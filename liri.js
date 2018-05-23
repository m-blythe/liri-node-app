//require dotenv package
require("dotenv").config();

//require the keys for twitter and spotify APIs
var keys = require("./keys.js");
//require the twitter, spotify, omdb and inquirer packages
//var twitter = require("node-twitter-api");
var twitter = require("twitter");
var Spotify = require("node-spotify-api");
//var Spotify = require("Spotify");
//create spotify client
var spotify = new Spotify(keys.spotify);
var client = new twitter(keys.twitter);
var express = require("express");
var router = express.Router();

//store the results of a request to spotify
var request = require("request");
var inquirer = require("inquirer");
var fs = require("fs");

//variable to store command selected
var liriCommand = "";
//variable to store movie name entered
var movieName = "";
//variable to store song name entered
var songName = "";

inquirer.prompt([
    {
        message: "Select a command to start liri-bot (use the arrow key to move up/down",
        type: "list",
        name: "liriCommand",
        default: "movie-this",
        choices: ["my-tweets", new inquirer.Separator(), "spotify-this-song", new inquirer.Separator(), "movie-this", new inquirer.Separator(), "do-what-it-says"]
    },

]).then(function (answers) {

    //update the liriCommand variable with the answer    
    liriCommand = answers.liriCommand;

    if (liriCommand === "movie-this") {

        getMovieInformation();
    } else if (liriCommand === "spotify-this-song") {
        //console.log("I selected the SPOTIFY-THIS-SONG command");
        getSongInformation();
    } else if (liriCommand === "my-tweets") {
        //console.log("I selected the MY-TWEETS command");
        getTweets();
    } else if (liriCommand === "do-what-it-says") {
        //console.log("I selected the DO-WHAT-IT-SAYS command");
        logInformation();
    } else {
        console.log("Command Not Found, Try Again");
    };
});

//when the user selects the movie-this command, run the getMovieInformation function
//user will be prompted to enter a movie title, if no title entered, default value of 
//Mr. Nobody will be used
function getMovieInformation() {
    //console.log("I selected the MOVIE-THIS command");
    inquirer.prompt([
        {
            message: "Enter the name of a movie",
            type: "input",
            name: "movieName",
            default: "Mr. Nobody"
        },

    ]).then(function (answers) {
        console.log(answers.movieName);


        //Then, run a request to the OMDB API with the movieName value.
        request("http://www.omdbapi.com/?t=" + answers.movieName + "&apikey=trilogy", function (error, response, body) {

            //If the request is successful (i.e. if the response status code is 200)
            if (!error && response.statusCode === 200) {
                //store the movie JSON object in a variable and then parse it for display
                var movie = JSON.parse(body);
                //console.log(movie);

                //Output the following information about movieName.
                var movieInformation =
                    //Line break
                    "====================================================" + "\r\n" +
                    //Output the liri command plus movieName
                    "liri command: movie-this " + movieName + "\r\n" +
                    //Line break
                    "=====================================================" + "\r\n" +
                    "Title: " + movie.Title + "\r\n" +
                    "Year: " + movie.Year + "\r\n" +
                    "IMDB rating : " + movie.imdbRating + "/10" + "\r\n" +
                    "Rotten Tomatoes rating : " + movie.Ratings[1].Value + "/100%" + "\r\n" +
                    "Filmed in: " + movie.Country + "\r\n" +
                    "Language: " + movie.Language + "\r\n" +
                    "Movie plot: " + movie.Plot + "\r\n" +
                    "Actors: " + movie.Actors + "\r\n" +
                    "======================================================"
                //Output the movie information to the terminal.
                console.log(movieInformation);

                //adds text to log.txt
                fs.appendFile("log.txt", "Title: " + movieInformation, function (err) {
                    if (err) throw err;
                    console.log("The movie Information has been saved in the log.txt file!");
                  });
            } else {
                console.log("Error occurred, Try again.")
            }
        });

    });
};

//when the user selects the spotify-this-song, run the getSongInformation function
function getSongInformation() {
    //console.log("I selected the SPOTIFY-THIS-SONG command");
    //get the name of the song from the user
    inquirer.prompt([
        {
            message: "Enter the name of a song",
            type: "input",
            name: "songName",
            default: "Dancing Nancies"
        },

    ]).then(function (answers) {
        console.log(answers);
        console.log(answers.songName);
        spotify.search({ type: "track", query: answers.songName },
            function (err, data) {
                if (err) {
                    return console.log("error occured: " + err);
                } else {
                    var song =
                        //Line break
                        "====================================================" + "\r\n" +
                        //Output the liri command plus movieName
                        "liri command: spotify-this-song " + "\r\n" +
                        //Line break
                        "=====================================================" + "\r\n" +
                        "Song: " + data.tracks.items[0].name + "\r\n" +
                        "Artist: " + data.tracks.items[0].artists[0].name + "\r\n" +
                        "Album: " + data.tracks.items[0].album.name + "\r\n" +
                        "Preview Here: " + data.tracks.items[0].preview_url + "\r\n" +
                        "====================================================="
                    //output song information to the terminal
                    console.log(song);
                    fs.appendFile("log.txt", "Title: " + song, function (err) {
                        if (err) throw err;
                        console.log("The song has been saved in the log.txt file!");
                      });
                };
            });
    });

};//ends the songInformation function

//when the user selects the do-what-it-says command, run the logInformation function
function logInformation() {
    console.log("I selected the DO-WHAT-IT-SAYS command");

    fs.readFile('log.txt', "utf8", function (error, data) {
        var txt = data.split(',');
    });



};

//when the user selects the my-tweets command, run the getTweets function
function getTweets() {
    //console.log("I selected the MY-TWEETS command");

    //load keys from keys.js
    var client = new twitter({
        consumer_key: keys.twitter.consumer_key,
        consumer_secret: keys.twitter.consumer_secret,
        access_token_key: keys.twitter.access_token_key,
        access_token_secret: keys.twitter.access_token_secret
    });

    //parameters for twitter function.
    var screenName = { screen_name: "winterbornMurph" };

    //call the get method on our client variable twitter instance

    client.get("statuses/user_timeline", screenName, function (error, tweets, response) {
        if (!error) {
            for (var i = 1; i < tweets.length; i++) {
                var date = tweets[i].created_at;
                //console.log("Tweet No."+[i]+":"+tweets[i].text + tweets[i].created_at) + "\r\n" +
                //"=====================================================" + "\r\n";
                //console.log("liri command: my-tweets" );+ "\r\n" +
                console.log("@winterbornMurph: Tweet No." + [i] + ":"); + "r/n" +
                    //Line break
                    //console.log("================================================================") + "\r\n" +
                    console.log(tweets[i].text + " Created At: " + date.substring(0, 19));
                console.log("=====================================================");

                fs.appendFile("log.txt", "@winterbornMurph: Tweet No." + [i] + ":" + "r/n" + tweets[i].text + "r/n"
                +"=====================================================", 
                    function (err) {
                    if (err) throw err;
                  });
            } console.log("The tweet has been saved in the log.txt file!");
        };
    });
};