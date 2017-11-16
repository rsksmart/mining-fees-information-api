module.exports = class MiningRepository {
	constructor(mongooseModule) {
    	this.mongoose = mongooseModule;
    	this.feePaymentModel = this.mongoose.model('FeePayments');
    }

    async createFeePayment(data) {
		return new this.feePaymentModel(data).save();
    }

    async deleteFeePayment(blockNumber) {
		return this.feePaymentModel.remove({ "block.number": blockNumber }).exec();
    }

    async readFeePayment(blockNumber) {
		return this.feePaymentModel.find({ "block.number": blockNumber }).exec();
    }
}