const express = require("express");
const router = express.Router();
const { Prices } = require("../model/price");
const admin = require("../middlewares/admin");
const { Spots } = require("../model/spot");
const auth = require("../middlewares/auth");

//post a price for a particular spot.
router.post("/:id", auth, admin, async (req, res) => {
  try {
    const spot = await Spots.findById({ _id: req.params.id });
    if (!spot) return res.status(400).send("spot doesn't exist");

    let price = new Prices({
      duration: req.body.duration,
      amount: req.body.amount,
      spot: req.params.id,
    });

    await price.save();
    res.status(200).send(price);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

//get the prices for a particular spot
router.get("/:id", auth, admin, async (req, res) => {
  const spot = await Spots.findById({ _id: req.params.id });
  if (!spot) return res.status(400).send("spot doesn't exist");

  try {
    const prices = await Prices.find({ spot: req.params.id });
    if (!prices.length) return res.status(400).send("no price yet");

    res.status(200).json({
      prices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//update price details for a particular user
router.put("/:id", auth, admin, async (req, res) => {
  const prices = await Prices.findOne({
    spot: req.params.id,
    duration: req.body.duration,
  });
  if (!prices) return res.status(400).send("spot doesn't exist");

  try {
    const price = await Prices.updateOne(
      { _id: prices._id },
      {
        $set: {
          duration: req.body.duration,
          amount: req.body.amount,
        },
      },
      {
        new: true,
      }
    );
    res.send(price);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//delete a particular price
router.delete("/:id", auth, admin, async (req, res) => {
  const price = await Prices.deleteOne({
    spot: req.params.id,
    duration: req.body.duration,
  });
  if (!price) res.status(400).send("Not found");
  res.status(200).send(true);
});

module.exports = router;
