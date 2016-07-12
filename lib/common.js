'use strict';
var Unauthorized 	= require('../errors/errors').Unauthorized,
	BadRequest 		= require('../errors/errors').BadRequest,
	errMsg 			= require('../errors/errorCodes');
	//validator 		= require("email-validator");


/** sends sucessfull response 
	@param object data Result to be sent inside response object
	@param String message Response text for the result
	@return Object successRes
*/
exports.successResponse = function(req, res, next) {
	var message = (req.store.get('message')) ? req.store.get('message') : "success";
	var resData = (req.store.get('resData')) ? req.store.get('resData') : [];
	var successRes = 
		{
			'code':0,
			'type':'success',
			'message':message,
			'resData': resData
		};
	res.response = successRes;
	next();
} 

/** send reload signal from worker to master process */
exports.sendReloadToMaster = function(req, res, next) {
	process.send({"cmd":"reload"});
	res.response = 'OK';
	next();
};

/**check for valid JSON **/
exports.isJSON = function(item){
    item = typeof item !== "string"
    ? JSON.stringify(item)
    : item;
    try {
        item = JSON.parse(item);
    }
    catch (e) {
        return false;
    }
    if (typeof item === "object" && item !== null) {
        return true;
    }
    return false;
}

/** start add process */

exports.sendAddProcess = function (req,res,next) {
	process.send({"cmd":"startAddProcess"});
	res.response = 'OK';
	next();
}