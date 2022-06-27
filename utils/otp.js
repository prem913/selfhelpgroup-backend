const axios = require("axios");
const Vonage = require('@vonage/server-sdk')
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
  // const headers = {
  //   authorization:
  //     "KRHx13V2ld0jPZGt4u9DnvraO6NMhsTXIFpgByzbwYEcSJAmUkUSsJ5cEByHaTKliDkf2dXZrLjRIvYn",
  //   "Content-Type": "application/json",
  // };
  // return await axios.post(
  //   " https://www.fast2sms.com/dev/bulkV2",
  //   {
  //     route: "q",
  //     message: message,
  //     language: "english",
  //     flash: 0,
  //     numbers: contact,
  //   },
  //   {
  //     headers,
  //   }
  // );
  const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
  })
  const from = "Vonage APIs"
  const no = "91" + contact;
  vonage.message.sendSms(from, no, message, (err, responseData) => {
    if (err) {
      console.log(err);
    } else {
      if (responseData.messages[0]['status'] === "0") {
        console.log("Message sent successfully.");
      } else {
        console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
      }
    }
  })
};
