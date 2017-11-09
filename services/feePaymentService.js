var async = require('async');
var RLP = require('rlp');
const BN = require('bn.js');

const remascFeeTopic = "0x000000000000000000000000000000006d696e696e675f6665655f746f706963";

var web3;

module.exports = FeePaymentService;

function FeePaymentService(web3Module) {
    web3 = web3Module;
}

FeePaymentService.prototype.processForBlock = function(blockhash) {

    var process = async.compose(saveToDb, getPaymentFee);
    
    process(blockhash, function (err, result) {
        result.forEach(function(fee) {
            console.log(fee);
            console.log("-------");
        });
    });
}

// not implemented for real yet
function saveToDb(collection, callback) {
    callback(null, collection);
}

function getPaymentFee(blockhash, callback) {

    async.waterfall([
        function(callback) {
            web3.eth.getBlock(blockhash, function(error, block) {
                if(error) {
                    callback(error, null);
                }

                console.log("REMASC log block: " + block.number);

                // REMASC Tx is always the last Tx of the block.
                remascTxHash = block.transactions[block.transactions.length - 1];

                callback(null, remascTxHash);
            });
        },
        function(remascTxHash, callback) {

            var fees = [];

            web3.eth.getTransactionReceipt(remascTxHash, function(error, remascTxReceipt) {
                
                if(error) {
                    callback(error, null);
                }

                async.eachSeries(remascTxReceipt.logs, function(log, callback) {
                    var topicName = log.topics[0];
                    if(topicName == remascFeeTopic) {
                        var payToAddress = log.topics[1];

                        var logsDataInfo = getInfoFromLogsData(log);
                        var payerBlockhash = logsDataInfo[0];
                        var amountPaid = logsDataInfo[1];

                        web3.eth.getBlock("0x" + payerBlockhash, function(gbError, payerBlock) {
                            if (gbError) {
                                callback(gbError, null);        
                            }

                            var fee = createInformationFee(payerBlock, remascTxHash, payToAddress, amountPaid);
                            fees.push(fee);

                            callback();
                        });  
                    }
                }, function(error) {
                    if(error) {
                        console.log(error);
                    } 
                    callback(null, fees);
                });
            });
    }
    ],function(err, data) {
        if(err) {
            console.log(err);
        } 

        callback(null, data);
    });
}

function getInfoFromLogsData(log) {

    var dataWithoutHexInitalizer = log.data.substring(2, log.data.length);
    var data = Buffer.from(dataWithoutHexInitalizer, 'hex');
    var dataDecoded = RLP.decode(data);

    var payToAddress = log.topics[1];
    var payerBlockhash = dataDecoded[0].toString('hex');
    var amountPaid = new BN(dataDecoded[1].toString('hex'), 16);

    return [payerBlockhash, amountPaid];
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