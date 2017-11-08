
var mongoose;
var feePaymentModel;

module.exports = MiningRepository;

function MiningRepository(mongooseModule) {
    mongoose = mongooseModule;
    feePaymentModel = mongoose.model('FeePayments');
}

MiningRepository.prototype.createFeePayment = function(data) {
    var feePayment = new feePaymentModel(data);
    feePayment.save(function(err, payment) {
    if (err)
        console.log(err);
  });
};