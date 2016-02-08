var winston = require('winston');
require('winston-loggly');
winston.emitErrs = true;

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        }),
	new winston.transports.Loggly({
	    level: 'debug',
	    inputToken: process.env.LOGGLY_TOKEN,
	    subdomain: "foundit",
	    tags: ["Winston-NodeJS"],
	    json:true
	})
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};



