var request = require('request'),
		strings = require(__dirname + "/utils/strings")

var inspect = require('sys').inspect;

var url = 'http://127.0.0.1:3003/api/requestkey'
var cli = process.ARGV[2];
var params = (typeof cli !== 'undefined') ? strings.urlencode( cli ) : 'email=fo@fo.com';
var h = {'content-type': 'application/x-www-form-urlencoded'};

request({uri: url, body:params, method: "POST", headers: h}, function(err, response, body){
	if(err) throw err;
	console.log(body)
})

