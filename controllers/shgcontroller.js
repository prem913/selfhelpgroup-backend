const shg = require("../models/shgmodel");
const asynchandler = require("express-async-handler");
const { generateOTP ,sendotp } = require("../utils/otp");
const {createJwtToken} = require("../utils/token")

const registershg = asynchandler(async (req, res) => {
  console.log(req.body)
  const { name, contact, location } = req.body;
  if (!name || !contact || !location) {
    res.status(400).json({
      error: "Please provide all the details name contact and location",
    });
  }
  const shgdata = req.body;
  const newshg = new shg(shgdata);
  await newshg.save();
  res.json({
    message: "SHG registered successfully",
  });
});

const shglogin = asynchandler(async(req,res) => {
  const { contact } = req.body;
  const shgdata =await shg.findOne({contact});
  if(!shgdata){
    res.status(400).json({
      message: "SHG NOT FOUND"
    })
  }

  res.status(200).json({
    message:"success otp is sent to your mobile number",
    shgId:shgdata._id,
  })

  const otp = generateOTP();
  console.log(otp);
  shgdata.otp = otp;
  await shgdata.save();
  //message service sents otp here
  try{
  await sendotp(contact,otp);
  }
  catch(err){
    console.log(err);
  }
})

const verifyOtp =asynchandler(async (req,res)=>{
  const {shgId,otp} = req.body;
  const shgdata = await shg.findById(shgId);
  if(!shgdata){
    res.status(400).json({
      message:"user not found"
    })
    return;
  }

  if(otp!==shgdata.otp){
    res.status(400).json({
      message:"incorrect otp"
    })
    return;
  }
  const datenow = new Date().getTime();
  const update = new Date(shgdata.updatedAt).getTime();
  if(datenow - update > 30*60*1000){
    res.status(400).json({
      message:"otp expired login again!"
    })
    return;
  }
  
  shgdata.otp="";
  await shgdata.save();
  const token = createJwtToken({shgId:shgdata._id});
  res.status(200).json({
    token,
    message:"successfully logged in"
  })

})
module.exports = {
  registershg,shglogin,verifyOtp
};
