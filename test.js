var request = require('request');

var inspect = require('sys').inspect;

var url = 'http://127.0.0.1:3003/s/1/api?'
var params = 'apikey=am9zZXBoLmlzYWFjQGdtYWlsLmNvbQ%3D%3D&longurl=http://subprint.com';
var h = {'content-type': 'application/x-www-form-urlencoded'};

// We are not posting..should probably change this.
request({uri: url+params, headers: h}, function(err, response, body){
	if(err) throw err;
	console.log(body)
	// var json = JSON.parse(body);
	// console.log(inspect(json))
})