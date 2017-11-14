var mongoose;
var feePaymentModel;

module.exports = MiningRepository;

function MiningRepository(mongooseModule) {
    mongoose = mongooseModule;
    feePaymentModel = mongoose.model('FeePayments');
}

MiningRepository.prototype.createFeePaymentPromise = async function(data) {

	return new feePaymentModel(data).save();
};

MiningRepository.prototype.deleteFeePaymentPromise = async function(blockNumber) {

	return feePaymentModel.remove({ "block.number": blockNumber }).exec();
};