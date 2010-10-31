var request = require('request'),
		strings = require(__dirname + "/utils/strings")

var inspect = require('sys').inspect;

//var cliUrl = strings.urlencode( process.ARGV[2] );
var url = 'http://127.0.0.1:3003/s/1/invite?'
var params = 'email=fo@fo.com';
var h = {'content-type': 'application/x-www-form-urlencoded'};

console.log(url+params)
// We are not posting..should probably change this.
request({uri: url+params, headers: h}, function(err, response, body){
	if(err) throw err;
	console.log(body)
})

