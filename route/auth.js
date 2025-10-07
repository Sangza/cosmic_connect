const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Joi = require("joi");
const express = require("express");
const route = express.Router();
const { Users } = require("../model/user");

route.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await Users.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User does not exist");

  const validatepassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!validatepassword)
    return res.status(400).send("Invalid User and Password");

  const token = user.generateAuthToken();
  res.send({
    username: user.username,
    token: token,
  });
});

//Login for admin
route.post("/admin", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await Users.findOne({ email: req.body.email, isAdmin: true });
  if (!user) return res.status(400).send("Not an admin");

  const validatepassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!validatepassword)
    return res.status(400).send("Invalid User and Password");

  const token = user.generateAuthToken();
  res.send({
    username: user.username,
    token: token,
  });
});

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
    password: Joi.string().min(6),
  });
  return schema.validate(user);
}

module.exports = route;
