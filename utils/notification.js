const FCM = require("fcm-node");
require("dotenv").config();
const sendnotification = (token, institute, department, status) => {
  console.log(token, institute, department, status);
  const serverKey = process.env.FCM_SERVER_KEY;
  const fcm = new FCM(serverKey);
  const message = {
    to: token,
    notification: {
      title: `Order ${status}`,
      body: `Your Order for ${institute} has been ${status} by ${department}`,
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
