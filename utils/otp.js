const axios = require("axios");

exports.generateOTP = () => {
    var digits = "0123456789";
    let OTP = "";

    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  };


exports.sendotp = async(contact,message) =>{
    const headers={

        "authorization":"KRHx13V2ld0jPZGt4u9DnvraO6NMhsTXIFpgByzbwYEcSJAmUkUSsJ5cEByHaTKliDkf2dXZrLjRIvYn",
        "Content-Type":"application/json"
        };
    return await axios.post(" https://www.fast2sms.com/dev/bulkV2",{

            "route" : "q",
            "message" : message,
            "language" : "english",
            "flash" : 0,
            "numbers" : contact
            },{
                headers
            })
}