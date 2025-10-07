const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const { Coupons } = require("../model/coupon");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const { Users } = require("../model/user");
const { Spots } = require("../model/spot");
const { Payments } = require("../model/payment");
const upload = multer({ dest: "uploads/" }); // temp storage

router.post("/", auth, admin, async (req, res) => {
  try {
    // Check that the referenced spot exists
    const spot = await Spots.findById(req.body.spotId);
    if (!spot) return res.status(400).send("Spot doesn't exist");

    // Check for duplicate coupon code
    const existingCoupon = await Coupons.findOne({ coupon: req.body.coupon });
    if (existingCoupon) return res.status(400).send("Coupon already exists");

    // Create new coupon document
    let coupon = new Coupons({
      coupon: req.body.coupon,
      spot: req.body.spotId,
      paidfor: req.body.paidfor,
      duration: req.body.duration,
      amount: req.body.amount,
    });

    // Save coupon to database
    await coupon.save();
    res.status(200).send({ message: "Created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/batch", auth, admin, async (req, res) => {
  if (!Array.isArray(req.body.coupons)) {
    return res
      .status(400)
      .send("Request body should contain an array of coupons");
  }

  const spot = await Spots.findById({ _id: req.body.spotId });
  if (!spot) return res.status(400).send("spot doesn't exist");

  try {
    const couponCodes = req.body.coupons.map((c) => c.coupon);
    const existingCoupons = await Coupons.find({
      coupon: { $in: couponCodes },
    });

    if (existingCoupons.length > 0) {
      return res.status(400).send({
        message: "Some coupons already exist",
        duplicates: existingCoupons.map((c) => c.coupon),
      });
    }

    const couponsToInsert = req.body.coupons.map((couponData) => ({
      coupon: couponData.coupon,
      owner: couponData.spotId,
      paidfor: couponData.paidfor,
      duration: couponData.duration,
      amount: couponData.amount,
    }));

    const result = await Coupons.insertMany(couponsToInsert);

    res.status(200).send({
      message: "Coupons created successfully",
      count: result.length,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// router.get("/getcoupon/:id", auth, async (req, res) => {
//   try {
//     const userId = await Users.findById({ _id: req.params.id });
//     if (!userId) return res.status(400).send("user doesn't exist");

//     const userCoupon = await Coupons.find({
//       "user.Id._id": req.params.id,
//     });
//     console.log(userId);
//     if (!userCoupon.length) return res.status(400).send("no coupon found");
//     console.log(userCoupon);

//     res.status(200).send(userCoupon);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// });
// // routes/coupon.js

//coupons paid by a particular user
router.get("/getcoupon/:id", auth, async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user) return res.status(400).send("User doesn't exist");

    const coupons = await Coupons.find({
      "user.Id._id": req.params.id,
      paidfor: true,
    });

    if (!coupons.length) return res.status(400).send("No coupon found");

    // Flatten coupons for frontend
    const formattedCoupons = coupons.map((c) => ({
      id: c._id,
      code: c.coupon,
      duration: c.duration,
      amount: c.amount,
      date: c.user?.paymentId?.createdAt || c.createdBy, // fallback
      status: c.user?.paymentId?.status || "pending",
    }));

    res.status(200).json(formattedCoupons);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//get an unpaid Coupon
router.get("/getunpaid/:spotId/:duration", async (req, res) => {
  const spot = await Spots.findById({ _id: req.params.spotId });
  if (!spot) return res.status(400).send("spot doesn't exist");

  try {
    const coupon = await Coupons.findOne({
      spot: req.params.spotId,
      duration: req.params.duration,
      paidfor: false,
    });
    if (!coupon) return res.status(200).send("Not Found");
    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).send("Error:", error.message);
  }
});
// paid for just nees the details

router.get("/getpaid/:spotId", async (req, res) => {
  const spot = await Spots.findById({ _id: req.params.spotId });
  if (!spot) return res.status(400).send("spot doesn't exist");

  try {
    const coupon = await Coupons.find({
      spot: req.params.spotId,
      paidfor: true,
    });
    if (!coupon) return res.status(200).send("Not Found");
    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).send("Error:", error.message);
  }
});

//get coupon owned by a spot
router.get("/getcouponstatus/:spotId", auth, admin, async (req, res) => {
  const spot = await Spots.findById({ _id: req.params.spotId });
  if (!spot) return res.status(400).send("spot doesn't exist");

  const coupons = await Coupons.find({
    spot: req.params.spotId,
  });
  if (!coupons.length) return res.status(400).send("Nothing yet");

  res.status(200).send(coupons);
});

//get coupon owned by a spot and also know the status
router.get("/getcouponstatus/:spotId/:paid", auth, admin, async (req, res) => {
  const spot = await Spots.findById({ _id: req.params.spotId });
  if (!spot) return res.status(400).send("spot doesn't exist");

  const coupons = await Coupons.find({
    spot: req.params.spotId,
    paidfor: req.params.paid,
  });
  if (!coupons.length) return res.status(400).send("Nothing yet");

  res.status(200).send(coupons);
});

//update reserved user
router.put("/reservecoupon/:id", auth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    // Ensure the coupon is unpaid & not reserved
    const reservedCoupon = await Coupons.findOneAndUpdate(
      {
        _id: req.params.id,
        paidfor: false,
        reserved: false, // Ensure it's available
      },
      {
        $set: {
          reserved: true, // Lock the coupon
          user: { Id: { _id: userId } }, // Assign user
        },
      },
      { new: true }
    );

    if (!reservedCoupon) {
      return res.status(400).send("Coupon already reserved or paid for.");
    }

    res
      .status(200)
      .json({ message: "Coupon reserved successfully", reservedCoupon });
  } catch (error) {
    console.error("Error reserving coupon:", error);
    res.status(500).send("Server error");
  }
});

//update coupon status
router.put("/updatecoupon/:id", auth, async (req, res) => {
  try {
    // Find the coupon by ID
    const couponId = await Coupons.findById(req.params.id);
    if (!couponId) return res.status(404).send("Coupon not found");

    // Find the payment by ID
    const payment = await Payments.findById(req.body.paymentId);
    if (!payment) return res.status(404).send("Payment not found");

    const user = await Users.findById(req.body.userId);
    if (!user) return res.status(404).send("User not found");
    // Check if amounts match
    // if (couponId.amount !== payment.amount) {
    //   return res.status(400).send("Coupon amount doesn't match payment amount");
    // }

    // Update the coupon
    const updatedCoupon = await Coupons.findByIdAndUpdate(
      req.params.id,
      {
        paidfor: req.body.paidfor,
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
      { new: true } // Return the updated document
    );

    if (!updatedCoupon) {
      return res.status(500).send("Failed to update coupon");
    }

    // Send the updated coupon details
    res.status(200).json({
      coupon: updatedCoupon.coupon,
      duration: updatedCoupon.duration,
      status: payment.status,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).send("Server error");
  }
});

router.post(
  "/upload-coupons",
  auth,
  admin,
  upload.single("file"), // file field must be named "file"
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded");
      }

      const couponCodes = [];

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
          const keys = Object.keys(row);
          const code = row[keys[0]]; // take first column value (Voucher ID)
          if (code && code.trim() !== "") {
            console.log("Got code:", code);
            couponCodes.push(code.trim());
          }
        })

        .on("end", async () => {
          try {
            // 1. Remove duplicates in memory
            const uniqueCodes = [...new Set(couponCodes)];

            // 2. Find existing coupons already in DB
            const existing = await Coupons.find({
              coupon: { $in: uniqueCodes },
            }).select("coupon");

            const existingSet = new Set(existing.map((c) => c.coupon));

            // 3. Filter only new coupons
            const newCoupons = uniqueCodes
              .filter((code) => !existingSet.has(code))
              .map((code) => ({
                coupon: code,
                spot: req.body.spotId,
                paidfor: false,
                duration: req.body.duration || null,
                amount: req.body.amount || null,
              }));
            console.log(newCoupons);
            // 4. Insert new coupons
            if (newCoupons.length > 0) {
              await Coupons.insertMany(newCoupons, { ordered: false });
            }

            // 5. Always clean up uploaded file
            fs.unlinkSync(req.file.path);

            // 6. Respond with summary
            res.status(200).send({
              message: "Coupons processed",
              totalUploaded: couponCodes.length,
              duplicatesInCSV: couponCodes.length - uniqueCodes.length,
              alreadyInDB: existingSet.size,
              inserted: newCoupons.length,
            });
          } catch (err) {
            console.error("Insert error:", err);
            res.status(500).send("Error saving coupons");
          }
        });
    } catch (error) {
      console.error("Route error:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);
module.exports = router;
