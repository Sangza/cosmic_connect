const axios = require("axios");
require("dotenv").config();

//initaiate payment

const initiatePayment = async (email, amount, reference, callback_url) => {
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: email,
        amount: amount,
        currency: "NGN",
        reference: reference,
        callback_url: callback_url,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SECRET_KEY_LIVE}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response;
  } catch (error) {
    if (error.response) {
      console.error("Error:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
};

//verify payment
const verifyPayment = async (reference) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SECRET_KEY_LIVE}`,
        },
      }
    );

    console.log(response.data);
    return response;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    } else {
      throw new Error(error.message);
    }
  }
};
module.exports = { initiatePayment, verifyPayment };
