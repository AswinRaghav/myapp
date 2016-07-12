var express 		= require('express'),
	router 			= express.Router(),
	errorHandler 	= require('../errors/errorhandler'),
	common 			= require('../lib/common');

//API to reload the process
router.get('/reload',
	common.sendReloadToMaster
);

router.get('/add', 
	common.sendAddProcess
);

module.exports = router;
