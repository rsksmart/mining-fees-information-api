#!/usr/bin/env node

const config = require('./config.json');
const RLP = require('rlp');
const BN = require('bn.js');
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
var feePaymentService = new FeePaymentService(miningRepository, web3);

logger.info("Starting gatherer based on RSK node at: ", url);

var alive = null;
var pollingToGatherInfoOnlyWhenNodeIsAlive = setInterval(gatherInfoWhenNodeIsAlive, 500);

function gatherInfoWhenNodeIsAlive() {
	web3.eth.getBlockNumber(function(error){
		var newAlive = !error;
		process.stdout.write(".");
		if (newAlive !== alive) {
			onChangeAlive(newAlive);
		}
		alive = newAlive;
	})
}

function onChangeAlive(isAlive) {
	if(!isAlive) {
		log.info("Aliveness changed to: ", isAlive ? "alive" : "not alive");
		return;
	}

	var filter = web3.eth.filter("latest");
	filter.watch(function(error, blockhash){
		if(error) {
			log.error("Error on watch filter: ", error);
		}

		feePaymentService.processForBlock(blockhash);
	});
}