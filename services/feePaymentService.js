var RLP = require('rlp');
const BN = require('bn.js');
const proxiedWeb3Handler = require('../model/proxiedWeb3');

module.exports = class FeePaymentService {
    constructor(miningRepository, web3Module) {
        this.remascFeeTopic = "0x000000000000000000000000000000006d696e696e675f6665655f746f706963";
        this.proxiedWeb3 = new Proxy(web3Module, proxiedWeb3Handler);
        this.miningRepo = miningRepository;
    }

    async processForBlock(blockhash) {
        const paymentFees = await this.getPaymentFee(blockhash);
        console.log(paymentFees);
        
        await this.saveToDb(paymentFees);
        console.log("done");
    }

    async getPaymentFee(blockhash) {
        try {
            const block = await this.proxiedWeb3.eth.getBlock(blockhash);
            // const [...otherTransactions, remascTxHash] = block.transactions;
            const remascTxHash = block.transactions[block.transactions.length - 1];
            const remascTxReceipt = await this.proxiedWeb3.eth.getTransactionReceipt(remascTxHash);

            const feesPromises = remascTxReceipt.logs.map(async log => {
                const topicName = log.topics[0];
                if(topicName == this.remascFeeTopic) {
                    const payToAddress = log.topics[1];

                    const {payerBlockhash, amountPaid} = this.getInfoFromLogsData(log);

                    const payerBlock = await this.proxiedWeb3.eth.getBlock("0x" + payerBlockhash);
                    return this.createInformationFee(payerBlock, remascTxHash, payToAddress, amountPaid);
                }
            });
            return await Promise.all(feesPromises);

        } catch(e) {
            console.log("Exception: ", e); 
            return;
        }
    }

    async saveToDb(paymentFees) {
        try {
            let i = 0;
            for(const fee of paymentFees) {
                const t = i;
                console.log("start save ", t);
                await this.miningRepo.createFeePaymentPromise(fee);
                console.log("finish save ", t);
                i++;
            }
        } catch (e) {
            rollback(paymentFees);
        }
    }

    async rollback(paymentFees) {
        const blockNumber = paymentFees[0].block.number;
        try {
            await this.miningRepo.deleteFeePaymentPromise(fee);
        } catch (e) {
            console.log("Rollback failed for block number: ", blockNumber);
        }
    }

    getInfoFromLogsData(log) {
        var dataWithoutHexInitalizer = log.data.substring(2, log.data.length);
        var data = Buffer.from(dataWithoutHexInitalizer, 'hex');
        var dataDecoded = RLP.decode(data);

        var payToAddress = log.topics[1];
        var payerBlockhash = dataDecoded[0].toString('hex');
        var amountPaid = new BN(dataDecoded[1].toString('hex'), 16);

        return { payerBlockhash, amountPaid };
    }

    createInformationFee(payerBlock, senderTx, payToAddress, amount) {
        var block = { number: payerBlock.number, hash: payerBlock.hash };

        var feeInfo = {
            block: block,
            sender_tx: senderTx,
            to_address: payToAddress,
            amount: amount
        };

        return feeInfo;
    }
}