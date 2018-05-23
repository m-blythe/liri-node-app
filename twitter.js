//
var twitterAPI = require("node-twitter-api");

var twitter = new twitterAPI({
    consumerKey: "my consumer key",
    consumerSecret: "my consumer secret",
    callback: "http://www.twitter.com/meb7167"
});