#!/usr/bin/env node

var async = require('async');
var RLP = require('rlp');
const BN = require('bn.js');

var mongoose = require('mongoose');
require('./models/feePaymentModel.js');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/mining'); 

var MiningRepository = require('./data/miningDb.js');
var miningRepository = new MiningRepository(mongoose);

var Web3 = require('web3');
var web3 = new Web3();

var url = 'http://localhost:4444';
web3.setProvider(new web3.providers.HttpProvider(url));

var FeePaymentService = require('./services/feePaymentService');
var feePaymentService = new FeePaymentService(web3);

var alive = null;
var pollingToGatherInfoOnlyWhenNodeIsAlive = setInterval(gatherInfoWhenNodeIsAlive, 500);

function gatherInfoWhenNodeIsAlive() {
	web3.eth.getBlockNumber(function(error){
		var newAlive = !error;
		console.log(newAlive);
		if (newAlive !== alive) {
			onChangeAlive(newAlive);
		}
		alive = newAlive;
	})
}

function onChangeAlive(isAlive) {
	if(!isAlive) {
		return;
	}

	var filter = web3.eth.filter("latest");
	filter.watch(function(error, blockhash){
		if(error) {
			console.log(error);
		}

		feePaymentService.processForBlock(blockhash);
	});
}

// currently used for repository testing
var sampleFee = createSampleInformationFee();
// miningRepository.createFeePayment(sampleFee);

function createSampleInformationFee() {
	var block = {};
	block.number = 1;
	block.hash =  "test_hash_02";

	var sampleFee = {};
	sampleFee.block = block
	sampleFee.sender_tx = "sender_tx_01";
	sampleFee.to_address = "to_address";
	sampleFee.amount = 127;

	return sampleFee;
}