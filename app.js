/**
 * Module dependencies.
 */

var express = require('express'),
		base64 = require( __dirname + '/utils/base64'),
		validate = require( __dirname + '/utils/validate'),
		request = require('request'),
		fs = require('fs'),
		timestamp = require(__dirname + '/utils/datetime'),
		strings = require( __dirname + '/utils/strings')

var inspect = require('sys').inspect;

var app = module.exports = express.createServer();

var errorMessages = {
	invalidEmail: 'Invalid email address'
}

// Allowed API Keys.
var apikeys = {
"am9zZXBoLmlzYWFjQGdtYWlsLmNvbQ==": "joseph.isaac@gmail.com"	
}

// Some config shit...
var hostprefix = 'http://127.0.0.1:3003/s/';
var backupFilename = 'shawties.json';
var lastBackupTime = '';

// This will be our in-memory store for fast-retrieval of shortened URLs.
var shortened = {};

/*
*	@desc Generate an API Key by base64-encoding an email address.
* @param String
* @return String
*/
function generateApiKey(email)
{
	if( !validate.email(email) ) throw new Error(errorMessages.invalidEmail + "-> " + email);
	else return base64.encode(email);
}

/*
*	@desc Return the last key in an object.
* @param Object 
* @return String
*/
function getLastKey(obj)
{
	var keys = Object.keys(obj);
	return keys[keys.length-1];
}

/*
*	@desc Check to see if a key's value exists.
* @param Object 
* @return String or False
*/
function doesValueExist(obj, value)
{
	var keys = Object.keys(obj), 
			len = keys.length;
	while(len--)
	{
		if( value === obj[ keys[len] ] ) return keys[len];
	}
	return "Nonexistent";
}

/*
*	@desc Return the last character in a string.
* @param String
* @return String 
*/
function getLastCharacter(str)
{
	return (str.length === 1) ? str : str.charAt(str.length - 1);
}

/*
*	@desc Return the next letter based on the letter passed in.
* @param Object 
* @return String or False
*/
function getNextLetter(s){
    return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function(character){
        var c= character.charCodeAt(0);
        switch(c){
            case 90: return 'a';   // 90 is 'Z'
            case 122: return 'A';  // should never happen in generateShortId();
            default: return String.fromCharCode(++c);
        }
    });
}

/*
*	@desc Generate a short id from A-Z, then a-z to be used for a shortened URL.
* @return String
*/
function generateShortId()
{
	var lastKey = getLastKey(shortened);
	var lastChar = getLastCharacter(lastKey);
	var nextChar = getNextLetter(lastChar);
	// if the lastChar is 'Z', then take the lastKey and append "A"
	if(lastChar === 'z') return lastKey + "A";
	return lastKey.replace(lastChar, nextChar);
}

/*
*	@desc Generate a shortened URL.
* @return String
*/
function generateShortenedUrl()
{
	return hostprefix + generateShortId();
}

/*
*	@desc Update the in-memory store.
* @param String
* @param String
* @return void
*/
function addToInMemoryStore( longurl, shortId )
{
	shortened[shortId] = longurl;
}

/*
*	@desc Write the current in-memory object containing all the shortened urls.
* @param Object
* @param String
* @return void
*/
function backupShortenedUrls(inMemoryObj, filename)
{
	// Create the latest timestamp, update lastBackupTime and add to the inMemoryObj
	inMemoryObj._timestamp = lastBackupTime = timestamp.ISODateString(new Date()); 

	fs.writeFile( __dirname + "/" + filename, JSON.stringify(inMemoryObj), function(err){
		if(err) throw err;
		console.log( __dirname + "/" + filename +" written on "+ inMemoryObj._timestamp);
		// inMemoryObj is passed by REFERENCE, so we must delete this key.
		delete inMemoryObj._timestamp;
	});
}

/*
*	@desc Read the backup file and place the contents in the current in-memory object.
* @param Object
* @param String
* @param Function
* @return void
*/
function loadShortenedUrls(obj, filename, cb)
{
	fs.readFile( __dirname + "/" + filename, 'utf8', function(err, data){
		if(err) throw err;
		shortened = JSON.parse(data);
		// Capture the latest timestamp in case we need it...
		lastBackupTime = shortened['_timestamp'];
		// We delete the timestamp key so it doesn't get used when computing next shortId.
		delete shortened['_timestamp'];
		cb && typeof cb === 'function' && cb();
	});
}

/*
*	@desc Initialize at startup.
* @return void
*/
function init()
{
	loadShortenedUrls(shortened, backupFilename, function(){
		console.log(inspect(shortened))
	});
}


// Express Routes

// To generate a shortened url
app.get('/s/1/api', function(req, res){
	var apikey = req.query.apikey;
	var longurl = req.query.longurl;
	var jsonResponse = {};
	
	// check for api key
	if( apikeys[apikey] === 'undefined')
	{
		jsonResponse.code = 401;
		jsonResponse.message = "Apikey was not found."
		res.send(JSON.stringify(jsonResponse), { 'Content-Type': 'application/json' }, 401);
	}
	else
	{
		// NOTE: 'shortened' is the object with all the shortened urls
		// Since now the Api key is good, so now let's see if the longurl already exists.
		var shortenedKey = doesValueExist(shortened, longurl);
		if( shortenedKey !== "Nonexistent")
		{
			if(shortenedKey === 'undefined')
			{
				jsonResponse.code = 404;
				jsonResponse.message = "The longurl is undefined.  Something went wrong.";
				jsonResponse.longurl = longurl;
				res.send(JSON.stringify(jsonResponse), { 'Content-Type': 'application/json' }, 404);
			}
			jsonResponse.code = 201;
			jsonResponse.message = "Long URL "+ longurl +" already exists.";
			jsonResponse.shortenedUrl = shortened[shortenedKey];
			res.send(JSON.stringify(jsonResponse), { 'Content-Type': 'application/json' }, 201);
		}
		else
		{
			jsonResponse.code = 201;
			jsonResponse.message = "Long URL added to in memory store."
			jsonResponse.shortendUrl = generateShortenedUrl();
			jsonResponse.longurl = longurl;

			// Update our in-memory object.
			addToInMemoryStore( longurl, generateShortId() );

			// Write the latest to a file for safe backup.
			backupShortenedUrls(shortened, backupFilename);

			res.send( JSON.stringify(jsonResponse), { 'Content-Type': 'application/json' }, 201);
		}
	}
});


// To redirect a shortened url to a longurl.
app.get('/s/*', function(req, res){

	var shortId = req.params[0];
	
	if( !(shortId in shortened) ) res.send(404);
	else
	{
		res.redirect(shortened[shortId]);
	}
	
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3003);
  console.log("Shawtie server listening on port %d", app.address().port);
	init();
}
