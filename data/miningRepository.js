module.exports = class MiningRepository {
	constructor(mongooseModule) {
    	this.mongoose = mongooseModule;
    	this.feePaymentModel = this.mongoose.model('FeePayments');
    }

    async createFeePaymentPromise(data) {
		return new this.feePaymentModel(data).save();
    }

    async deleteFeePaymentPromise(blockNumber) {
		return this.feePaymentModel.remove({ "block.number": blockNumber }).exec();
    }
}