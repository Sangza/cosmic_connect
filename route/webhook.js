const express = require("express");
const router = express.Router();
const { Users } = require("../model/user");
const { Payments } = require("../model/payment");
const { Coupons } = require("../model/coupon");
const crypto = require("crypto");
require("dotenv").config();

//Paystack webhook
router.post(
  "/paystack/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const secret = process.env.SECRET_KEY_TEST;
      console.log("Using secret:", process.env.SECRET_KEY_TEST, secret);

      // Verify signature
      const hash = crypto
        .createHmac("sha512", secret)
        .update(req.body.toString("utf8")) //
        .digest("hex");

      if (hash !== req.headers["x-paystack-signature"]) {
        console.log("Signature mismatch:", {
          received: req.headers["x-paystack-signature"],
          calculated: hash,
        });
        return res.status(401).send("Invalid signature");
      }

      // Parse event after signature validation
      const event = JSON.parse(req.body.toString("utf8"));

      if (event.event === "charge.success") {
        const { reference, amount, customer } = event.data;

        // Find related payment
        const payment = await Payments.findOne({ transactionId: reference });
        if (!payment) {
          console.error("Payment not found for reference:", reference);
          return res.sendStatus(200); // acknowledge but skip
        }

        // Find user by email
        const user = await Users.findOne({ email: customer.email });
        if (!user) {
          console.error("User not found for email:", customer.email);
          return res.sendStatus(200);
        }

        // ✅ Now find coupon by BOTH userId and paymentId (embedded)
        const coupon = await Coupons.findOne({
          "user.Id._id": user._id, // dot notation for nested
          amount: amount / 100,
          reserved: true,
          paidfor: false,
        });
        if (!coupon) {
          console.error("Coupon not found for payment", coupon);
          return res.sendStatus(200);
        }

        // const updatePayment = await Payments.findOneAndUpdate(
        //   { _id: payment._id, user: user._id }, // ✅ match by ObjectId reference
        //   {
        //     $set: {
        //       status: "successful",
        //     },
        //   },
        //   { new: true }
        // );
        // console.log("update:", updatePayment);

        // Update coupon
        const updatedCoupon = await Coupons.findByIdAndUpdate(
          coupon._id,
          {
            paidfor: true,
            user: {
              Id: {
                _id: user._id,
                username: user.username,
              },
              paymentId: {
                status: payment.status,
                _id: payment._id,
                createdAt: payment.createdAt,
              },
            },
          },
          { new: true }
        );

        console.log("Coupon updated successfully:", updatedCoupon);
      }

      // Always respond with 200 so Paystack doesn’t retry endlessly
      res.sendStatus(200);
    } catch (error) {
      console.error("Webhook error:", error);
      res.sendStatus(500);
    }
  }
);

module.exports = router;
