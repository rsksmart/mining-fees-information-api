var RLP = require('rlp');
const BN = require('bn.js');
const proxiedWeb3Handler = require('../model/proxiedWeb3');
const logger = require('../services/logger');

module.exports = class FeePaymentService {
    constructor(miningRepository, web3Module, config) {
        this.remascFeeTopic = "0x000000000000000000000000000000006d696e696e675f6665655f746f706963";
        this.proxiedWeb3 = new Proxy(web3Module, proxiedWeb3Handler);
        this.miningRepo = miningRepository;
        this.config = config;
    }

    async readLastInsertedFeePayment() {
        logger.info("Reading last inserted fee payment.");

        const feePayment = await this.miningRepo.readLastInsertedFeePayment();

        logger.info("Last inserted fee payment read.");
        return feePayment;
    }

    async readForBlock(blocknumber, blockhash) {
        logger.info("Reading mining fees for blocknumber:", blocknumber, "blockhash:", blockhash);

        let paymentFees = await this.miningRepo.readFeePayment(blocknumber, blockhash);
        if(paymentFees.length > 0) {
            logger.info("Mining fees read.");
            return paymentFees;
        }

        paymentFees = await this.processForBlockByNumber(blocknumber, blockhash);

        logger.info("Mining fees read.");
        return paymentFees;
    }

    async processForBlockByNumber(blocknumber, blockhash) {
        logger.info("Processing mining fees for blockhash: ", blockhash);
        const paymentFees = await this.getPaymentFeeByNumber(blocknumber);
        
        // Check if input blockhash matches blockhash retrieved by number
        if(paymentFees[0].block.hash !== blockhash) {
            return [];
        }

        logger.info("Payment fees: ", JSON.stringify(paymentFees));
        
        await this.saveToDb(paymentFees);
        logger.info("Mining fees processed.");

        return paymentFees;
    }

    async processForBlock(blockhash) {
        logger.info("Processing mining fees for blockhash: ", blockhash);
        const paymentFees = await this.getPaymentFeeByHash(blockhash);
        
        logger.info("Payment fees: ", JSON.stringify(paymentFees));
        
        await this.saveToDb(paymentFees);
        logger.info("Mining fees processed.");
    }

    async getPaymentFeeByHash(blockhash) {
        const block = await this.proxiedWeb3.eth.getBlock(blockhash);
        const fees = await this.getPaymentFee(block);

        return fees;
    }

    async getPaymentFeeByNumber(blocknumber) { 
        // fees for the required block are paid by REMASC tx after maturity
        blocknumber += this.config.api.remasc.maturity;
        const block = await this.proxiedWeb3.eth.getBlock(blocknumber);
        const fees = await this.getPaymentFee(block);

        return fees;
    }

    async getPaymentFee(block) {
        // const [...otherTransactions, remascTxHash] = block.transactions;
        const remascTxHash = block.transactions[block.transactions.length - 1];
        const remascTxReceipt = await this.proxiedWeb3.eth.getTransactionReceipt(remascTxHash);

        const feesPromises = remascTxReceipt.logs.map(async log => {
            const topicName = log.topics[0];
            if(topicName == this.remascFeeTopic) {
                const payToAddress = log.topics[1];

                const {payerBlockhash, amountPaid} = this.getInfoFromLogsData(log);

                const payerBlock = await this.proxiedWeb3.eth.getBlock("0x" + payerBlockhash);

                // RemascTxHash is stored in DB as sender_tx. RSK node RemascTxHash value depends on the 
                // height of the blockchain where the tx is. That means that the hash will be the same and 
                // it does not matter if the block where the information was obtained is a mainchain block
                // or a sibling or a block that at that time was not in the mainchain but endedep up been.
                // This does not happen with the blockhash and that is the reason why only the sender_tx 
                // is stored on DB.
                return this.createInformationFee(payerBlock, remascTxHash, payToAddress, amountPaid);
            }
        });

        return await Promise.all(feesPromises);
    }

    async saveToDb(paymentFees) {
        try {
            this.deleteExisting(paymentFees);

            for(const fee of paymentFees) {
                await this.miningRepo.createFeePayment(fee);
            }
        } catch (e) {
            logger.error("Payment fee save failed: ", e);
            this.rollback(paymentFees);
        }
    }

    async deleteExisting(paymentFees) {
        if (paymentFees.length == 0) {
            return;
        }

        const blockNumber = paymentFees[0].block.number;
        const feePaymentsFromDb = await this.miningRepo.readFeePayment(blockNumber);
        if (feePaymentsFromDb.length > 0) { 
            await this.miningRepo.deleteFeePayment(blockNumber);
        };
    }

    async rollback(paymentFees) {
        const blockNumber = paymentFees[0].block.number;
        try {
            await this.miningRepo.deleteFeePayment(blockNumber);
        } catch (e) {
            logger.error("Rollback failed for block number: ", blockNumber);
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