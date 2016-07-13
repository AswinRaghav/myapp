'use strict'

var cluster = require('cluster'),
	workers = [],
	procEnv = (process.env.NODE_ENV && process.env.NODE_ENV != '' ) ? process.env.NODE_ENV : 'development',
	procEnv = procEnv.toLowerCase();

if(procEnv != 'production' && procEnv != 'development') {
	console.log("NODE_ENV is invalid!");
	return;
}

if (cluster.isMaster) {

	var debug = require('debug')('myapp-index'),
		cpuCount = require('os').cpus().length;

	debug('Total CPU Cores - ', cpuCount);

	//broadcast a message to all workers
	var broadcast = function(msgRcvd) {
		for (var i in workers) {
			var worker = workers[i];
			worker.send({"message":msgRcvd});
		}
	}

	//fork worker processes based on cores in the system
    for (var i = 0; i < cpuCount; i += 1) {
    //for (var i = 0; i < 1; i += 1) {
    	startWorker();
    }

    function startWorker() {
        var worker = cluster.fork();
        worker.on('message', function(msg) {
            if (msg.cmd) {
                switch (msg.cmd) {
                    case 'reload':
                   	case 'startAddProcess': 
                   		broadcast(msg);
                        break;
                }
            };
        }); 
		workers.push(worker);
    }

	//on worker process exit, refork it again
	cluster.on('exit', function (worker) {
		debug('Worker ' + worker.id + ' died :(');
		startWorker();
	});

	//on worker process started
	cluster.on('listening', (worker, address) => {
		debug(`Worker Started with PID: ${worker.process.pid} PORT: ${address.port}`);
	});


} else {
	var express 	= require('express'),
		app 		= express(),
		http 		= require('http'),
		path		= require('path'),
		add 		= require('./routes/api/add'),
		debug 		= require('debug')('sg-indx'),
		config 		= require('./config/'+procEnv+'.json'),
		port 		= normalizePort(config.expressPort),
		server 		= http.createServer(app),
		wroutes 	= require('./routes/worker'),
		reqStore 	= require('reqstore'),
		bodyParser 	= require('body-parser');

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(express.static(path.join(__dirname, 'public')));
	app.set('port', port);
	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);

	app.use(reqStore());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use('/worker', wroutes);

	//global server configuration
	global.RELOAD = 0;

	//worker related routes
	app.use('/worker/*', function send(req, res) {
		res.json(res.response);
	});

	process.on('message', function(msg) {
		debug('Worker ' + process.pid + ' received ' + msg.message);
		if(msg.message.cmd === 'startAddProcess')  add.init();

		//else if(msg.message.cmd === 'reload') RELOAD = 1;
	});	

	//normalize port number
	function normalizePort(val) {
		var port = parseInt(val, 10);
		if(isNaN(port)) return val;
		if(port >= 0) return port;
		return false;
	}

	//on create http server error
	function onError(error) {
		if(error.syscall !== 'listen') {
			throw error;
		}
  		var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
		switch (error.code) {
			case 'EACCES':
				console.error(bind + ' requires elevated privileges');
      			process.exit(1);
      			break;
			case 'EADDRINUSE':
				console.error(bind + ' is already in use');
				process.exit(1);
				break;
			default:
				throw error;
		}
	}

	//on create http server listening
	function onListening() {
		var addr = server.address();
		var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	}

	module.exports = app;
 
}
