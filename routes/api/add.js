var debug = require('debug')('myapp-add');

exports.init = function(){
var a = 20 ,
	b = 10,
	c;
	if(a>0 && b>0){
		c = a+b;
		debug('the sum is ' + c);
	}
	else{
		debug('Input values not greater than zero');
	}
}
