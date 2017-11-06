var mongoose = require('mongoose');
FeePayment = mongoose.model('FeePayments');

exports.createFeePayment = function(data) {
    var feePayment = new FeePayment(data);
    feePayment.save(function(err, payment) {
    if (err)
        console.log(err);
  });
};