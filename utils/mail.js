var nodemailer = require("nodemailer");
require("dotenv").config();
const sendEmail = (email, orderid, status, department) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  var mailOptions = {
    from: process.env.EMAIL,
    to: "animesh.satish@gmail.com",
    subject: "Order Status",
    html: `<strong>Order ${orderid} has been ${status} by ${department}</strong>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = {
  sendEmail,
};
