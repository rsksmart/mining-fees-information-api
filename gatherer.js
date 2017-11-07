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

    	printFeePaymentInformation(blockhash);
	});
}

var sampleFee = createSampleInformationFee();
// miningDb.createFeePayment(sampleFee);


function printFeePaymentInformation(blockhash) {
    
    const remascFeeTopic = "0x000000000000000000000000000000006d696e696e675f6665655f746f706963";

    var block = web3.eth.getBlock(blockhash);

    console.log("transactions: " + block.transactions.length);

    console.log("REMASC log block: " + block.number);

    var remascTxHash = block.transactions[block.transactions.length - 1];
    console.log("REMASC tx: " + remascTxHash);

    var remascTxReceipt = web3.eth.getTransactionReceipt(remascTxHash);
    // console.log(remascTxReceipt.logs);

    remascTxReceipt.logs.forEach(function(log) {
        
    	var topicName = log.topics[0];
        if(topicName == remascFeeTopic) {

            console.log("log index: " + log.logIndex);

            var dataWithoutHexInitalizer = log.data.substring(2, log.data.length);
            var data = Buffer.from(dataWithoutHexInitalizer, 'hex');
            var dataDecoded = RLP.decode(data);

            var payToAddress = log.topics[1];
            var payerBlockhash = dataDecoded[0].toString('hex');
            var amountPaid = new BN(dataDecoded[1].toString('hex'), 16);

            console.log("payer blockhash: " + payerBlockhash);

            // just a maturity check, not mandatory
            var payerBlock = web3.eth.getBlock("0x" + dataDecoded[0].toString('hex'));  
            console.log("payer block number: " + payerBlock.number);

            console.log("pay to address: " + payToAddress);
            console.log("value: " + amountPaid);

            console.log("----");

            var fee = createInformationFee(payerBlock, remascTxHash, payToAddress, amountPaid);
            console.log(fee);
        }
    });
}

function createInformationFee(payerBlock, senderTx, payToAddress, amount) {
	var block = {};
	block.number = payerBlock.number;
	block.hash = payerBlock.hash;

	var feeInfo = {};
	feeInfo.block = block
	feeInfo.sender_tx = senderTx;
	feeInfo.to_address = payToAddress;
	feeInfo.amount = amount;

	return feeInfo;
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