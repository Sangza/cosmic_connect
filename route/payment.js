const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Users } = require("../model/user");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const { Payments } = require("../model/payment");
const { Coupons } = require("../model/coupon");
const crypto = require("crypto");
require("dotenv").config();
const { initiatePayment, verifyPayment } = require("../function/payment");

//post payment
router.post("/", auth, async (req, res) => {
  const user = await Users.findById(req.body.userId);
  if (!user) return res.status(400).send("User does not exist");

  // const verify = await verifyPayment(req.body.transactionId);
  // if (verify.status == false)
  //   return res.status(400).send("Payment was not sucessful");

  let payment = new Payments({
    user: {
      _id: req.body.userId,
    },
    amount: req.body.amount,
    transactionId: req.body.transactionId,
    status: req.body.status,
    spot: req.body.spotId,
  });

  try {
    const payments = await payment.save();
    res.status(200).json({
      payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/updatepayment", auth, async (req, res) => {
  try {
    const { userId, paymentId, status } = req.body;

    const user = await Users.findById(userId);
    if (!user) return res.status(400).send("User does not exist");

    const paymentd = await Payments.findById(paymentId);
    if (!paymentd) return res.status(400).send("Payment Id not found");

    const updatePayment = await Payments.findOneAndUpdate(
      { _id: paymentId, user: userId }, // ✅ match by ObjectId reference
      { $set: { status } },
      { new: true }
    );

    if (!updatePayment) {
      return res.status(400).send("Not successfully updated");
    }

    console.log("payment for today:", updatePayment);
    res.status(200).json({ updatePayment });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).send("Server error");
  }
});

//get all payment amount
router.get("/", auth, admin, async (req, res) => {
  try {
    const payment = await Payments.find();
    if (!payment.length) return res.status(400).send("No payments yet");

    let totalAmount = payment.reduce((sum, payment) => sum + payment.amount, 0);
    res.status(200).json({ totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//get all payment paid to a spot
router.get("/getpayment/:spotId", auth, admin, async (req, res) => {
  try {
    const spotId = req.params.spotId;
    if (!spotId) res.status(400).send("spotId not found");

    const payment = await Payments.find({ spot: spotId, status: "successful" });
    if (!payment.length) return res.status(400).send("No payment yet");

    let totalAmount = payment.reduce((sum, payment) => sum + payment.amount, 0);
    res.status(200).json({ totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//get all the payment  amount for a particular user;
router.get("/getuserpayment/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) res.status(400).send("UserId not found");

    const payment = await Payments.find({ user: userId, status: "successful" });
    if (!payment.length) return res.status(400).send("No payment yet");

    let totalAmount = payment.reduce((sum, payment) => sum + payment.amount, 0);
    res.status(200).json({ totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get payment summary for a spot (daily & monthly)
router.get("/spot-summary/:spotId", auth, admin, async (req, res) => {
  try {
    const spotId = req.params.spotId;
    if (!spotId) return res.status(400).send("spotId not found");

    // Get date range for today
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // Get date range for this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Payments today
    const todayPayments = await Payments.find({
      spot: spotId,
      status: "successful",
      createdAt: { $gte: startOfToday, $lt: endOfToday },
    });

    // Payments this month
    const monthPayments = await Payments.find({
      spot: spotId,
      status: "successful",
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    });

    const todayTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    const monthTotal = monthPayments.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      todayTotal,
      monthTotal,
    });
  } catch (error) {
    console.error("Payment summary error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
