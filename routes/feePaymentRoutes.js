const logger = require('../services/logger');

module.exports = class FeePaymentRoutes {
    constructor(miningRepository, configFile, router) {
        this.router = router;
        this.miningRepo = miningRepository;
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
                    const callResult = {};

                    if(blockNumber < that.config.api.remasc.maturity + that.config.api.remasc.syntheticSpan) {

                        callResult.message = "Block number " + blockNumber + " hasn't reach maturity + synthetic span yet.";
                        callResult.value = null;

                        return res.json(callResult);
                    }

                    // WIP: Hardcoded value must be changed for value retrieved from DB
                    const lastDb = 2000;
                    if(lastDb < blockNumber && blockNumber < lastDb + that.config.api.remasc.maturity) {
                        callResult.message = "Block number " + blockNumber + " hasn't reach maturity yet.";
                        callResult.value = null;

                        return res.json(callResult);
                    }

                    if(blockNumber > lastDb + that.config.api.remasc.maturity) {
                        callResult.message = "Block number " + blockNumber + " hasn't been mined yet.";
                        callResult.value = null;

                        return res.json(callResult);
                    }

                    // Block number is in a valid range
                    const paymentFees = await that.miningRepo.readFeePayment(blockNumber, blockHash);
                    callResult.message = "Payment fees found for block number " + blockNumber;
                    callResult.value = paymentFees;

                    return res.json(callResult);
                } catch (err) {
                    logger.error(err);
                    res.status(500).send('Something broke!');
                }
            });
    }
}