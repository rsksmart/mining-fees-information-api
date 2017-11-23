#!/usr/bin/env node

const config = require('./configs/config.json');
const logger = require('./services/logger');

var mongoose = require('mongoose');
require('./data/models/feePaymentModel');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.connectionString); 

var MiningRepository = require('./data/miningRepository');
var miningRepository = new MiningRepository(mongoose);

var Web3 = require('web3');
var url = 'http://' + config.rskj.host + ':' + config.rskj.port;
var web3 = new Web3(new Web3.providers.HttpProvider(url));

var FeePaymentService = require('./services/feePaymentService');
var feePaymentService = new FeePaymentService(miningRepository, web3, config);

logger.info("Starting gatherer based on RSK node at: ", url);

var alive = null;
var pollingToGatherInfoOnlyWhenNodeIsAlive = setInterval(gatherInfoWhenNodeIsAlive, 500);

// Triggers the filter.watch() for new blocks when the node is alive. 
// This needs to be done this way because by default filter.watch() stops working 
// when node is down (makes total sense). The problem comes when the node is up and running again. 
// This is not detected by filter.watch() and this workaround should be used.
function gatherInfoWhenNodeIsAlive() {
	web3.eth.getBlockNumber(function(error){
		var newAlive = !error;
		// process.stdout.write(".");
		if (newAlive !== alive) {
			onChangeAlive(newAlive);
		}
		alive = newAlive;
	})
}

function onChangeAlive(isAlive) {
	if(!isAlive) {
		log.info("Alive state changed to: ", isAlive ? "alive" : "not alive");
		return;
	}

	var filter = web3.eth.filter("latest");
	filter.watch(async function(error, blockhash){
		if(error) {
			log.error("Error on watch filter: ", error);
		}

		try {
			await feePaymentService.processForBlock(blockhash);
		} catch (e) {
            logger.error("Exception: ", e); 
		}
	});
}