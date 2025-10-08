const express = require("express");
const router = express.Router();
const { Users, validateUser } = require("../model/user");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const auth = require("../middlewares/auth");

router.get("/me", auth, async (req, res) => {
  const user = await Users.findById(req.user._id).select("-password");
  res.send(user);
});
router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await Users.findOne({ email: req.body.email });
  if (user) return res.status(400).send("Please this email already exist");

  user = new Users({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    currentroom: req.body.currentroom,
    isAdmin: req.body.isAdmin,
  });

  const saltround = parseInt(process.env.SALT_ROUNDS, 10) || 10;

  const salt = await bcrypt.genSalt(saltround);
  user.password = await bcrypt.hash(user.password, salt);

  user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["email", "username", "currentroom", "_id", "isAdmin"]));
});
router.put("/:id", auth, async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.params.id });
    if (user) return res.status(400).send("Please this email already exist");

    const updateUser = await Users.updateOne(
      { _id: req.params.id },
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          currentroom: req.body.currentroom,
          isAdmin: req.body.isAdmin,
        },
      },
      {
        new: true,
      }
    );
    res.status(200).json(updateUser);
  } catch (error) {
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

module.exports = router;
