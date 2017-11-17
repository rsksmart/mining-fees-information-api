var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FeePaymentSchema = new Schema({
  block: {
    hash: {
      type: String,
      required: true,
      index: true
    },
    number: {
      type: Number,
      required: true,
      index: true,
      min: 0
    }
  },
  sender_tx: {
    type: String,
    required: true,
  },
  to_address: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  created_date: {
    type: Date,
    default: Date.now
  }
},
 {
  toObject: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
    }
  },
  toJSON: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.model('FeePayments', FeePaymentSchema);