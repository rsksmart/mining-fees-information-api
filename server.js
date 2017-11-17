#!/usr/bin/env node

const config = require('./config.json');
const express = require('express');
const app = express();

const logger = require('./services/logger');

const mongoose = require('mongoose');
require('./data/models/feePaymentModel');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.connectionString); 

const MiningRepository = require('./data/miningRepository');
const miningRepository = new MiningRepository(mongoose);

const router = express.Router();             

router.route('/feepayment/block/:number/:hash')

    .get(async function(req, res) {
    	try {
    		const paymentFees = await miningRepository.readFeePayment(req.params.number, req.params.hash);

	    	res.json(paymentFees);
    	} catch (err) {
    		logger.error(err);
    		res.status(500).send('Something broke!');
    	}
    });

app.use('/api', router);

app.use(function (req, res, next) {
  res.status(404).send("Sorry, can't find that!");
})

app.listen(config.api.port);
logger.info('API listens on port ' + config.api.port);