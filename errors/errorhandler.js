'use strict';

var debug = require('debug')('sg:apierr');
var BadRequest = require('./errors').BadRequest;
var Unauthorized = require('./errors').Unauthorized;
var Forbidden = require('./errors').Forbidden;
var NotFound = require('./errors').NotFound;
var Unavailable = require('./errors').Unavailable;

/* jshint -W098 */
exports = module.exports = function errorHandler(err, req, res, next) {
  res.response = {};
  res.response.code = err.code || 0;
  res.response.type = 'error';
  if (!res.response.message) {
    res.response.message = err.message || 'An error occurred';
  }
  debug(err);
  res.json(res.response);
};
