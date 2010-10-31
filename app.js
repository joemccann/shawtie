/**
 * Module dependencies.
 */

var express = require('express'),
		hash = require('hashlib'),
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

// Some config shit...
var hostprefix = 'http://127.0.0.1:3003/s/';
var backupShortenedUrlsFilename = 'shawties.json';
var backupApiKeysFilename = 'apikeys.json';
var lastBackupTime = '';
var lastApiKeysBackupTime = '';

// This will be our in-memory store for fast-retrieval of shortened URLs.
var shortened = {};

// Allowed API Keys.
var apikeys = {};

/*
*	@desc Generate an API Key by sha1-encoding an email address.
* @param String
* @return String
*/
function generateApiKey(email)
{
	if( !validate.email(email) ) return errorMessages.invalidEmail + "-> " + email;
	else return hash.sha1(email);
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
function addToInMemoryStore( value, key, obj )
{
	obj[key] = value;
}

/*
*	@desc Write the current in-memory object to a file.
* @param Object
* @param String
* @return void
*/
function backupInMemoryStore(inMemoryObj, filename)
{
	// Create the latest timestamp and add to the inMemoryObj
	inMemoryObj._timestamp = timestamp.ISODateString(new Date()); 

	fs.writeFile( __dirname + "/" + filename, JSON.stringify(inMemoryObj), function(err){
		if(err) throw err;
		console.log( __dirname + "/" + filename +" written on "+ inMemoryObj._timestamp);
		// inMemoryObj is passed by REFERENCE, so we must delete this key.
		delete inMemoryObj._timestamp;
	});
}

/*
*	@desc Read the backup file and place the contents in the current in-memory object.
* @param String
* @param Function
* @return void
*/
function loadShortenedUrls(filename, cb)
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
*	@desc Read the backup file and place the contents in the current in-memory object.
* @param String
* @param Function
* @return void
*/
function loadApiKeys(filename, cb)
{
	fs.readFile( __dirname + "/" + filename, 'utf8', function(err, data){
		if(err) throw err;
		apikeys = JSON.parse(data);
		lastApiKeysBackupTime = apikeys['_timestamp'];
		delete apikeys['_timestamp'];
		cb && typeof cb === 'function' && cb();
	});
}


/*
*	@desc Initialize at startup.
* @return void
*/
function init()
{
	loadShortenedUrls(backupShortenedUrlsFilename, function(){
		console.log(inspect(shortened))
	});

	loadApiKeys(backupApiKeysFilename, function(){
		console.log(inspect(apikeys))
	});


}


// Configure Express App
app.configure(function(){
  app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
  app.use(express.bodyDecoder());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
});

// Express Routes

// To redirect a shortened url to a longurl.
app.get('/s/*', function(req, res){

	var shortId = req.params[0];
	
	if( !(shortId in shortened) ) res.send(404);
	else
	{
		res.redirect(shortened[shortId]);
	}
	
});

// To request an API Key. 
app.get('/api/invite', function(req, res){
		// Now render the page.
		res.render('invite.ejs', {
	  	locals: {
	      title: "Shawtie wanna be a thug...",
	  	}
		});
});

app.post('/api/requestkey', function(req, res){
	
		var email = req.body.email,
				newApiKey = '',
				jsonResponse = {};
				
		// Check to see if it is a valid email address.
		if ( !(validate.email(email)) )
		{
			jsonResponse.message = "Invalid email address."
			jsonResponse.code = 200;
			res.send(JSON.stringify(jsonResponse), { 'Content-Type': 'application/json' }, 200);
		}
		// Check to see if email address already exists.
		else if (doesValueExist(apikeys, email) !== "Nonexistent")
		{
			jsonResponse.message = "API Key already exists."
			jsonResponse.code = 200;
			res.send(JSON.stringify(jsonResponse), { 'Content-Type': 'application/json' }, 200);
		}
		else
		{
			// add a new one.
			newApiKey = generateApiKey(email);
			apikeys[newApiKey] = email;
			jsonResponse.message = "Your api key has been created.";
			jsonResponse.apikey = newApiKey;
			jsonResponse.code = 201;
			
			// Update our in-memory object.
			addToInMemoryStore( email, newApiKey, apikeys );

			// Write the latest to a file for safe backup.
			backupInMemoryStore(apikeys, backupApiKeysFilename);
			
			res.send(JSON.stringify(jsonResponse), { 'Content-Type': 'application/json' }, 201);
		}

});

// GUI interface for creating a link.
app.get('/api/create', function(req,res){

	res.render('shorten.ejs', {
  	locals: {
      title: "Shawtie wanna be a thug...",
  	}
	});
});


// To generate a shortened url
app.post('/api/create', function(req, res){
	var apikey = req.body.apikey;
	var longurl = req.body.longurl;
	var jsonResponse = {};
	
	console.log(apikey)
	
	// check for api key
	if( !(apikey in apikeys) )
	{
		jsonResponse.code = 200;
		jsonResponse.message = "Apikey was not found."
		res.send(JSON.stringify(jsonResponse), { 'Content-Type': 'application/json' }, 200);
	}
	else
	{
		// NOTE: 'shortened' is the object with all the shortened urls
		// Since now the Api key is good, so now let's see if the longurl already exists.
		var shortenedKey = doesValueExist(shortened, longurl);
		if( shortenedKey !== "Nonexistent")
		{
			// this if is probably not needed..
			if(shortenedKey === 'undefined')
			{
				jsonResponse.code = 200;
				jsonResponse.message = "The longurl is undefined.  Something went wrong.";
				jsonResponse.longurl = longurl;
				res.send(JSON.stringify(jsonResponse), { 'Content-Type': 'application/json' }, 200);
			}
			jsonResponse.code = 200;
			jsonResponse.message = "Long URL, "+ longurl +", already exists.";
			jsonResponse.shortenedUrl = shortened[shortenedKey];
			res.send(JSON.stringify(jsonResponse), { 'Content-Type': 'application/json' }, 200);
		}
		else
		{
			jsonResponse.code = 201;
			jsonResponse.message = "Long URL added to in memory store."
			jsonResponse.shortenedUrl = generateShortenedUrl();
			jsonResponse.longurl = longurl;

			// Update our in-memory object.
			addToInMemoryStore( longurl, generateShortId(), shortened );

			// Write the latest to a file for safe backup.
			backupInMemoryStore(shortened, backupShortenedUrlsFilename);

			res.send( JSON.stringify(jsonResponse), { 'Content-Type': 'application/json' }, 201);
		}
	}
});



// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3003);
  console.log("Shawtie server listening on port %d", app.address().port);
	init();
}
