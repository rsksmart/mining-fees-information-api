const moment = require('moment')
const winston = require('winston');

const level = process.env.LOG_LEVEL || 'debug';

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: level,
            timestamp: getCurrentTime
        }),
        new winston.transports.File({ 
        	filename: 'combined.log',
        	json: false,
        	level: level,
            timestamp: getCurrentTime
        })
    ]
});

function getCurrentTime() {
	const utcMomentDate = new moment().utc();
    
    return '[' + utcMomentDate.format('YYYY-MM-DD hh:mm:ss.SSS') + ']';
}

module.exports = logger