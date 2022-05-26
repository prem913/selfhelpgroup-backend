const FCM = require("fcm-node");
require("dotenv").config();
const sendnotification = (token, institute, department, status) => {
  const serverKey = process.env.FCM_SERVER_KEY;
  const fcm = new FCM(serverKey);
  const message = {
    to: token,
    notification: {
      title: `आर्डर स्वीकृत`,
      body: `आपका आर्डर ${institute} द्वारा स्वीकृत कर लिया गया है`,
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

const sendordernotification = (token, institute) => {
  const serverKey = process.env.FCM_SERVER_KEY;
  const fcm = new FCM(serverKey);
  const message = {
    to: token,
    notification: {
      title: `नया आर्डर`,
      body: `${institute} द्वारा एक नया आर्डर पोस्ट किया गया है `,
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

const senddeliverynotification = (token, institute) => {
  const serverKey = process.env.FCM_SERVER_KEY;
  const fcm = new FCM(serverKey);
  const message = {
    to: token,
    notification: {
      title: `आर्डर प्राप्त`,
      body: `आपका आर्डर ${institute} द्वारा प्राप्त कर लिया गया है`,
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
  sendordernotification,
  senddeliverynotification
};
