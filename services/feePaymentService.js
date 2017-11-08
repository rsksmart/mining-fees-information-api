var RLP = require('rlp');
const BN = require('bn.js');

const remascFeeTopic = "0x000000000000000000000000000000006d696e696e675f6665655f746f706963";

var web3;

module.exports = FeePaymentService;

function FeePaymentService(web3Module) {
    web3 = web3Module;
}

FeePaymentService.prototype.processForBlock = function(blockhash) {
    
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