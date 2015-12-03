'use strict';

var http = require('http');
var swaggerTools = require('swagger-tools');
var YAML = require('yamljs');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var serverPort = 3000;
var debug = require('debug')('main');
var util = require('util');

// swaggerRouter configuration
var options = {
    controllers: './api/controllers',
    useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var swaggerDoc = YAML.load('./api/swagger/swagger.yaml');
var routes = require('./site/routes/index');
var app = express();
app.set('views', path.join(__dirname, 'site/views'));
app.set('view engine', 'jade');
// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());
    
    // Validate Swagger requests
    app.use(middleware.swaggerValidator({validateResponse: true}));
    
    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(options));
    
    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi());
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'site/public')));
    app.use('/', routes);
    // error handler to emit errors as a json string
    app.use(function (err, req, res,next) {
        /*jshint unused: vars*/
        if (typeof err !== 'object') {
            // If the object is not an Error, create a representation that appears to be
            err = {
                message: String(err) // Coerce to string
            };
        } else {
            // Ensure that err.message is enumerable (It is not by default)
            Object.defineProperty(err, 'message', {enumerable: true});
        }
        errorHandler(err, req, res);
    }); 
        
    // Start the server
    http.createServer(app).listen(serverPort, function () {
        debug('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    });
});

function errorHandler(err, req, res) {
    /*jshint maxcomplexity:7 */
    var myError;
    var status;
    debug("error encountered");
    debug(util.inspect(err, false, null));
    var isReturnFullError = res.statusCode === 400 || res.statusCode === 401 || res.statusCode === 403;
    
    var isInvalidKeyForResource = err.code === 'oauth.v2.InvalidApiKeyForGivenResource' || err.code === 'keymanagement.service.apiresource_doesnot_exist';
    if (isReturnFullError) {
        //catch bad request, forbidden and unauthorised
        var message = err.message;
        var code = err.code;

        if (message && code) {
            myError = {
                code: code,
                message: message
            }
        } else {
            myError = err;
        }

        status = res.statusCode;
    } else if (res.statusCode === 405) {
        // catch invalid method
        myError = {
            message: "Invalid method"
        };
        status = 405;
    } else if (isInvalidKeyForResource) {
        myError = {
            "message": "Invalid API Key",
            "code": "access_denied",
            "statusCode": 403
        };
        status = 403;
    } else {
        // everything else is a system problem
        myError = {
            message: err.message
        };
        status = 500;
    }

    res.status(status).json(myError);
}
