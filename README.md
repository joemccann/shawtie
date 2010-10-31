Shawtie
===================

_An in-memory URL-shortener written in 100% pure JavaScript à la Node.js._

Installation
---------------------
Clone the repo, then:
<pre>
  sh node-modules  		# Requires http://github.com/isaacs/npm
  cd shawtie
  node app.js
</pre>

Usage
----------------------
<code>node app.js</code> will spin up the shawtie service.

*Try a short URL*

In your favorite web browser, type:

<pre>
http://127.0.0.1:3003/s/A
</pre>

and you'll be redirected to [http://subprint.com](http://subprint.com).

*Create a short URL*

If you want to add a new short url, open up another terminal and in the same directory type

<pre>
node ./tests/test.js http://somenewurl.com/long/url.html
</pre>

Returns the json object response (just sample code here, your shortenedUrl may be different):
<pre>
{
	"code":201,
	"message":"Long URL added to in memory store.",
	"shortendUrl":"http://127.0.0.1:3003/s/K",
	"longurl":"http://somenewurl.com/long/url.html"
}
</pre>

or use curl
<pre>
curl -i -H "Accept: application/json" -X GET -d "longurl=http://somenewurl.com/long/another-url.html" http://127.0.0.1:3003/s/1/api?apikey=am9zZXBoLmlzYWFjQGdtYWlsLmNvbQ%3D%3D
</pre>

You should receive (or something relatively similar):
<pre>
{
	"code":201,
	"message":"Long URL added to in memory store.",
	"shortendUrl":"http://127.0.0.1:3003/s/L",
	"longurl":"http://somenewurl.com/long/another-url.html"
}
</pre>

If you use the <code>curl</code> route, you'll need to <code>CHMOD</code> on the <code>app.js</code> file so it can write the in-memory store to a file.

<pre>
CHMOD 777 app.js
</pre>


TODO
----------------------
- change API Key in this document to 'foo@bar.com' api key
- write api keys to a file for backup
- npm installation support
- CouchDB backup
- Admin GUI
- Improved API Key Generator.
