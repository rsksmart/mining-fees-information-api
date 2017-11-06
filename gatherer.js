#!/usr/bin/env node

var mongoose = require('mongoose');
require('./models/feePaymentModel.js');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/mining'); 
var miningDb = require('./data/miningDb.js');

var sampleFee = createSampleInformationFee();
miningDb.createFeePayment(sampleFee);

console.log("success!");
process.exit();


function createSampleInformationFee() {
	var block = {};
	block.number = 1;
	block.hash =  "test_hash_01";

	var sampleFee = {};
	sampleFee.block = block
	sampleFee.sender_tx = "sender_tx_01";
	sampleFee.to_address = "to_address";
	sampleFee.amount = 127;

	return sampleFee;
}