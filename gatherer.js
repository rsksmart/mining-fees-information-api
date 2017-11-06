#!/usr/bin/env node

var async = require('async');
var RLP = require('rlp');
const BN = require('bn.js');

var mongoose = require('mongoose');
require('./models/feePaymentModel.js');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/mining'); 
var miningDb = require('./data/miningDb.js');

var Web3 = require('web3');
var web3 = new Web3();

var url = 'http://localhost:4444';
web3.setProvider(new web3.providers.HttpProvider(url));

var filter = web3.eth.filter("latest");
filter.watch(function(error, blockhash){
    if (!error) {
    	printFeePaymentInformation(blockhash);
    } else {
    	console.log(error);
    }

});

var sampleFee = createSampleInformationFee();
// miningDb.createFeePayment(sampleFee);


function printFeePaymentInformation(blockhash) {

    var block = web3.eth.getBlock(blockhash);

    console.log("transactions: " + block.transactions.length);

    console.log("REMASC log block: " + block.number);

    var remascTxHash = block.transactions[block.transactions.length - 1];
    console.log("REMASC tx: " + remascTxHash);

    var remascTxReceipt = web3.eth.getTransactionReceipt(remascTxHash);
    // console.log(remascTxReceipt.logs);

    var remasc_fee_topic = "0x000000000000000000000000000000006d696e696e675f6665655f746f706963";

    remascTxReceipt.logs.forEach(function(log) {
        
        if(log.topics[0] == remasc_fee_topic) {

            console.log("log index: " + log.logIndex);

            var dataWithoutHexInitalizer = log.data.substring(2, log.data.length);
            var data = Buffer.from(dataWithoutHexInitalizer, 'hex');
            var dataDecoded = RLP.decode(data);

            console.log("payer blockhash: " + dataDecoded[0].toString('hex'));

            // just a maturity check, not mandatory
            var payerBlock = web3.eth.getBlock("0x" + dataDecoded[0].toString('hex'));  
            console.log("payer block number: " + payerBlock.number);

            console.log("pay to address: " + log.topics[1]);

            var a = new BN(dataDecoded[1].toString('hex'), 16);
            console.log("value: " + a);

            console.log("----");
        }
    });
}

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