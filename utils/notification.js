const FCM = require("fcm-node");
require("dotenv").config();
const sendnotification = () => {
  const serverKey = process.env.FCM_SERVER_KEY;
  const fcm = new FCM(serverKey);
  const message = {
    to: "eXTNQck2Tzy7kcAi0AfAve:APA91bF5B_Kub8WdfT4jVcWzISi-jlmDrJRRPofe94P9ArwbaI0cf6LydfirfN4ukd9C4cr77ancwAhPz0E09Cz_-PN_t6ouMriCKF4jqMn9P5_TXg8ehFzgJ_BB1_MyFVqKis5cRGKS",
    notification: {
      title: "Title of push notification",
      body: "Body of push notification",
    },
  };
  fcm.send(message, (err, response) => {
    if (err) {
      console.log("Something has gone wrong!");
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
};

module.exports = {
  sendnotification,
};
