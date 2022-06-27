const axios = require("axios");
require("dotenv").config();
exports.generateOTP = () => {
  var digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

exports.sendotp = async (contact, message) => {
  const headers = {
    authorization:
      process.env.FAST_2_SMS_API_KEY.toString(),
    "Content-Type": "application/json",
  };
  return await axios.post(
    " https://www.fast2sms.com/dev/bulkV2",
    {
      route: "q",
      message: message,
      language: "english",
      flash: 0,
      numbers: contact,
    },
    {
      headers,
    }
  );
};
