const mongoose = require("mongoose");
const { Users } = require("./user");
const { ref, boolean } = require("joi");
const { paymentSchema } = require("./payment");
const { userSchema } = require("./user");
const { priceSchema } = require("./price");

const couponSchema = new mongoose.Schema({
  coupon: {
    type: String,
    unique: true,
    required: true,
  },
  spot: {
    type: mongoose.Schema.Types.ObjectId,
  },
  paidfor: Boolean,
  duration: {
    type: String,
    required: true,
  },
  reserved: {
    type: Boolean,
    default: false,
  },
  amount: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: Date,
    default: Date.now(),
  },
  user: {
    Id: {
      type: userSchema,
    },
    paymentId: {
      type: paymentSchema,
    },
  },
  purchase: {
    type: Date,
  },
});

const Coupons = mongoose.model("Coupon", couponSchema);

exports.couponSchema = couponSchema;
exports.Coupons = Coupons;
