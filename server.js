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

router.route('/feepayment/block/:number([0-9]+)/:hash(0[xX]{1}[a-fA-F0-9]{64}$)')

    .get(async function(req, res) {
    	try {
    		const blockNumber = req.params.number;
    		const blockHash = req.params.hash;
    		const callResult = {};

    		if(blockNumber < config.api.remasc.maturity + config.api.remasc.syntheticSpan) {

    			callResult.message = "Block number " + blockNumber + " hasn't reach maturity + synthetic span yet.";
    			callResult.value = null;

    			return res.json(callResult);
    		}

 			// WIP: Hardcoded value must be changed for value retrieved from DB
    		const lastDb = 2000;
    		if(lastDb < blockNumber && blockNumber < lastDb + config.api.remasc.maturity) {
    			callResult.message = "Block number " + blockNumber + " hasn't reach maturity yet.";
    			callResult.value = null;

    			return res.json(callResult);
    		}

    		if(blockNumber > lastDb + config.api.remasc.maturity) {
    			callResult.message = "Block number " + blockNumber + " hasn't been mined yet.";
    			callResult.value = null;

    			return res.json(callResult);
    		}

    		// Block number is in a valid range
    		const paymentFees = await miningRepository.readFeePayment(blockNumber, blockHash);
			callResult.message = "Payment fees found for block number " + blockNumber;
			callResult.value = paymentFees;

	    	return res.json(callResult);
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

