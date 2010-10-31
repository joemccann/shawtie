// Returns boolean.
function validateEmail(email) 
{ 
 var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ 
 return email.match(re);
}

function validateUrl(url)
{
	// been staring at the screen to long to not be getting this right...
	//var re = /^(https?|ftp)\:\/\/([a-z0-9+!*(),;?&=\$_.-]+(\:[a-z0-9+!*(),;?&=\$.-]+)?@)?[a-z0-9+\$-]+(.[a-z0-9+\$_-]+)*(\:[0-9]{2,5})?(\/([a-z0-9+\$_-].?)+)*\/?(\?[a-z+&\$.-][a-z0-9;:@/&%=+\$.-]*)?(#[a-z_.-][a-z0-9+\$_.-]*)?\$/;
	//var re = /[a-z]+(?:-[a-z]+)?\.[1-9][0-9]*/;
	return re.test(url);
}

exports.email = validateEmail;
exports.url = validateUrl;