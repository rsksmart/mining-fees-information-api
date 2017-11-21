const logger = require('../services/logger');

module.exports = class FeePaymentRoutes {
    constructor(feePaymentService, configFile, router) {
        this.router = router;
        this.feePaymentService = feePaymentService;
        this.config = configFile;

        this.setFeePaymentPerBlockNumberAndHashRoute();
    }

    getRouter() {
        return this.router;
    }

    setFeePaymentPerBlockNumberAndHashRoute() {

        const that = this;
        this.router.route('/feepayment/block/:number([0-9]+)/:hash(0[xX]{1}[a-fA-F0-9]{64}$)')

            .get(async function(req, res) {
                try {
                    const blockNumber = req.params.number;
                    const blockHash = req.params.hash;
                    let callResult = {};

                    if(blockNumber < that.config.api.remasc.maturity + that.config.api.remasc.syntheticSpan) {
                        callResult = that.buildResult("Block number " + blockNumber + " hasn't reach maturity + synthetic span yet.");

                        return res.json(callResult);
                    }

                    const lastBlock = (await that.feePaymentService.readLastInsertedFeePayment()).pop().block;
                    if(lastBlock.number < blockNumber && blockNumber < lastBlock.number + that.config.api.remasc.maturity + 1) {
                        callResult = that.buildResult("Block number " + blockNumber + " hasn't reach maturity yet.");

                        return res.json(callResult);
                    }

                    if(blockNumber > lastBlock.number + that.config.api.remasc.maturity) {
                        callResult = that.buildResult("Block number " + blockNumber + " hasn't been mined yet.");

                        return res.json(callResult);
                    }

                    // Block number is in a valid range
                    const paymentFees = await that.feePaymentService.readForBlock(Number(blockNumber), blockHash);
                    callResult.message = "Payment fees " + (paymentFees.length > 0 ? "" : "not ") + "found for block number " + blockNumber;
                    callResult.value = paymentFees;

                    return res.json(callResult);
                } catch (err) {
                    logger.error(err);
                    res.status(500).send(that.buildResult('Something broke!'));
                }
            });
    }

    buildResult(message) {
        const callResult = {};
        callResult.message = message;
        callResult.value = null;

        return callResult;
    }
}