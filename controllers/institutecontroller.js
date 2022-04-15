const Institute = require("../models/institutemodel");
const asyncHandler = require("express-async-handler");
const { generateOTP, sendotp } = require("../utils/otp");
const { createJwtToken } = require("../utils/token");

const registerinstitute = asyncHandler(async (req, res) => {
  const { name, location, contact, department } = req.body;
  if (!name || !location || !contact || !department) {
    return res.status(400).json({
      error:
        "Please provide all the required fields name location contact department",
    });
  }

  const institute = new Institute({
    name,
    location,
    contact,
    department,
  });
  await institute.save();
  res.status(200).json({
    success: true,
    data: institute,
  });
});

const institutelogin = asyncHandler(async(req,res)=>{
  const {contact} = req.body;
  const institutedata = await Institute.findOne({contact: contact});

  if(!institutedata){
    res.status(400).json({
      message:"Number not registered!",
    })
    return;
  }
  res.status(200).json({
    message:"otp sent successfully",
    instituteId: institutedata._id
  })
  const otp = generateOTP();

  institutedata.otp = otp;
  await institutedata.save();

  sendotp(institutedata.contact,`Your login otp is ${otp}.`);
})

const instituteVerifyOtp = asyncHandler(async(req,res)=>{
  const {instituteId,otp} = req.body;

  const institutedata = await Institute.findById(instituteId);

  if(!institutedata){
    res.status(400).json({
      message:"institute not found"
    })
    return;
  }

  const timenow = new Date().getTime();
  const timethen = new Date(institutedata.updatedAt).getTime();

  if(timenow - timethen > 30*60*1000){
    res.status(400).json({
      message:"Otp is expired"
    })
    return;
  }
  
  if(otp !== institutedata.otp){
    res.status(400).json({
      message:"Incorrect Otp"
    })
    return;
  }

  const jwt = createJwtToken({instituteId: institutedata._id});
  institutedata.otp = "";
  await institutedata.save();
  
  res.status(200).json({
    message:"login successfull",
    token:jwt
  })

})
module.exports = { registerinstitute,institutelogin,instituteVerifyOtp };
