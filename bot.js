const Twit = require('twit');
const fs = require('fs');
require('dotenv').config();

const order = 4; // length of each n-gram
let nGrams = {};

const Bot = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET  
});

function pickRandomStart(lyrics) {
    const random = Math.floor(Math.random()*lyrics.length)
    return lyrics.substring(random, random + order)
}

function makeEngramModel(lyrics) {
    for (let i = 0; i < lyrics.length - order; i++) {
        const gram = lyrics.substring(i, i + order);

        if (!nGrams[gram]) {
            nGrams[gram] = [];
        }
        nGrams[gram].push(lyrics.charAt(i + order));
    }
}

function tweet() {
    fs.readFile('lyrics.txt', 'utf8', function(error, lyrics) {  
        if (error) {
            console.log(error.message);
        } else {
             makeEngramModel(lyrics);
             let currentGram = pickRandomStart(lyrics);
             
            // checks to see if the start of the tweet doesn't start 
            // with punctuation or special characters
            while (!currentGram.match(/^[0-9a-zA-Z]+$/)) { 
                currentGram = pickRandomStart(lyrics);
            }
            let tweet = currentGram;

            // runs until char limit is reached and tries finishing the last word it was on
            for (let j = 0; (j < 150) || (tweet.charAt(j).match(/^[0-9a-zA-Z]+$/)); j++) {
                const possibilities = nGrams[currentGram];
                const next = possibilities[Math.floor(Math.random()*possibilities.length)];
                tweet += next;
                const len = tweet.length;
                currentGram = tweet.substring(len-order, len);
            }
            console.log(tweet)
            
            Bot.post('statuses/update', {status: tweet}, function(error, tweet, response) {
                if (error) {
                    console.log("Error making post. ", error.message);
                };
            });
        }
    });
}

tweet();