module.exports = class MiningRepository {
	constructor(mongooseModule) {
    	this.mongoose = mongooseModule;
    	this.feePaymentModel = this.mongoose.model('FeePayment');
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

    async readFeePayment(blockNumber, blockHash) {
		return this.feePaymentModel.find({ "block.number": blockNumber, "block.hash": blockHash }).exec();
    }

    async readLastInsertedFeePayment() {
		return this.feePaymentModel.find().sort({ "block.number": -1 }).limit(1).exec();
    }
}