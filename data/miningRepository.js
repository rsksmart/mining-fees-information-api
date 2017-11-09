var mongoose;
var feePaymentModel;

module.exports = MiningRepository;

function MiningRepository(mongooseModule) {
    mongoose = mongooseModule;
    feePaymentModel = mongoose.model('FeePayments');
}

MiningRepository.prototype.createFeePaymentPromise = function(data) {
	return new Promise((resolve, reject) => { 
	    var feePayment = new feePaymentModel(data);
	    feePayment.save(function(error, payment) {
		    if (error) {
		        reject(error);
			}
			resolve();
		});
  });
};