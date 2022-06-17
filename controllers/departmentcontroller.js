const asynchandler = require("express-async-handler");
const departmentmodel = require("../models/departmentmodel");
const Order = require("../models/ordermodel");
const Institute = require("../models/institutemodel");
const shg = require("../models/shgmodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const registerdepartment = asynchandler(async (req, res) => {
  try {
    const { department, contact, email, password } = req.body;
    if (!department || !contact || !email || !password) {
      res.status(400).json({
        error:
          "Please provide all the details department contact email and password",
      });
    }
    const checkdepartment = await departmentmodel.findOne({ department });
    if (checkdepartment) {
      return res.status(400).json({
        error: "Department already exists",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const departmentdata = req.body;
    departmentdata.password = hashedPassword;
    const newdepartment = new departmentmodel(departmentdata);
    await newdepartment.save();
    res.json({
      message: "Department registered successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      message: err.message,
    });
  }
});

const logindepartment = asynchandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        error: "Please provide all details username or email and password",
      });
    }
    var department = await departmentmodel.findOne({ email });
    if (!department) {
      var institute = await Institute.findOne({ email });
      if (!institute) {
        institute = await Institute.findOne({ username: email });
      }
      if (!institute) {
        return res.status(400).json({
          error: "No account registered with this email",
        });
      }
      const isMatch = await bcrypt.compare(password, institute.password);
      if (!isMatch) {
        return res.status(400).json({
          error: "Incorrect password",
        });
      }
      const token = jwt.sign(
        {
          instituteId: institute._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );
      const cookietoken = jwt.sign(
        {
          instituteId: institute._id,
        },
        process.env.COOKIE_SECRET,
        {
          expiresIn: "30d",
        }
      );
      res.cookie("token", cookietoken, {
        expires: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      return res.json({
        message: "Login successful",
        token: token,
        usertype: "institute",
        department: institute.department,
      });
    }
    const isMatch = await bcrypt.compare(password, department.password);
    if (!isMatch) {
      return res.status(400).json({
        error: "Incorrect password",
      });
    }
    const token = jwt.sign(
      {
        id: department._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    const cookietoken = jwt.sign(
      {
        departmentId: department._id,
      },
      process.env.COOKIE_SECRET,
      {
        expiresIn: "30d",
      }
    );
    res.cookie("token", cookietoken, {
      expires: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true,
      withCredentials: true,
      sameSite: "none",
    });
    res.json({
      message: "Login successful",
      token: token,
      usertype: department.usertype,
      department: department.department,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      message: err.message,
    });
  }
});

const instituteunderdepartment = asynchandler(async (req, res) => {
  try {
    const { department } = req.user;
    if (!department) {
      return res.status(400).json({
        error: "Please provide department",
      });
    }
    const institute = await Institute.find({ department });
    res.json({
      message: "Institutes under this department",
      data: institute,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      message: err.message,
    });
  }
});



const profile = asynchandler(async (req, res) => {
  try {
    if (req.institute) {
      const institute = await Institute.findById(req.institute._id).select(
        "-password"
      );
      res.json({
        message: "Institute profile",
        data: institute,
      });
    }
    if (req.department) {
      const department = await departmentmodel
        .findById(req.department._id)
        .select("-password");
      res.json({
        message: "Department profile",
        data: department,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      message: err.message,
    });
  }
});
const getjwtfromcookie = asynchandler(async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).json({
        error: "Please provide token",
      });
    }
    const decoded = jwt.verify(token, process.env.COOKIE_SECRET);
    if (decoded.departmentId) {
      const department = await departmentmodel.findById(decoded.departmentId);
      if (!department) {
        return res.status(400).json({
          error: "No account registered with this token",
        });
      }
      const token = jwt.sign(
        {
          id: department._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );
      res.json({
        message: "Token verified",
        token: token,
        userType: department.usertype,
        department: department.department,
        email: department?.email,
      });
    }
    if (decoded.instituteId) {
      const institute = await Institute.findById(decoded.instituteId);
      if (!institute) {
        return res.status(400).json({
          error: "No account registered with this token",
        });
      }
      const token = jwt.sign(
        {
          instituteId: institute._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );
      res.json({
        message: "Token verified",
        token: token,
        userType: "institute",
        department: institute.department,
        email: institute?.email,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      message: err.message,
    });
  }
}
);

const logout = asynchandler(async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({
      message: "Logout successful",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      message: err.message,
    });
  }
}
);
module.exports = {
  registerdepartment,
  logindepartment,
  instituteunderdepartment,
  profile,
  getjwtfromcookie,
  logout,
};
