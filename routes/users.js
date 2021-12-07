var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const User = require("../schema/user");
const Address = require("../schema/address");

const config = require('../config/keys')

const bcrypt = require("bcrypt");
const saltRounds = config.saltRounds;
const privateKey = config.privateKey;

const generateToken = (data) => {
  return new Promise(async (resolve, rejects) => {
    // jwt.sign(data, privateKey, { algorithm: "RS256" }, function (err, token) {
    //   console.log(token);
    //   resolve(token);
    //   console.log(err)
    // });
    const result = await jwt.sign(
      {
        data: data,
      },
      privateKey,
      { expiresIn: "20d" }
    );
    resolve(result);
  });
};

const tokenVerify = (token) => {
  return new Promise((resolve, rejects) => {
    jwt.verify(token, privateKey, function (err, decoded) {
      if (decoded) {
        resolve(decoded);
      } else {
        rejects(err);
      }
      // err
      // decoded undefined
    });
  });
};

const sendMail = async ({ email, otp }) => {
  return new Promise(async (resolve, rejects) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.mailUserName,
        pass: config.mailPassword, // naturally, replace both with your real credentials or an application-specific password
      },
    });
    const mailOptions = {
      from: "servicehris@gmail.com",
      to: email,
      subject: "Hris Service Otp",
      text: `Your Otp is ${otp}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        rejects(error);
      } else {
        resolve("Mail Sent Please Check Your Mail For OTP.");
      }
    });
  });
};

/* GET users listing. */
router.post("/", async function (req, res, next) {
  const { token } = req.body;
  try {
    const user = await tokenVerify(token);
    if (user.data._id) {
      const result = await User.findOne({ _id: user.data._id})
      res.json(result)
    } else {

      res.status(401).json({ message: "Invalid User" })
    }
  } catch(error){
    res.status(500).json({ message: "Something Went Wrong"})
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    let check;
    if (email) check = { email: email };
    if (phone) check = { phone: phone };
    const findUser = await User.findOne({ ...check });
    if (findUser) {
      bcrypt.compare(password, findUser.password, async function (err, result) {
        if (result) {
          const token = await generateToken({
            _id: findUser._id,
            email: findUser.email,
            phone: findUser.phone,
          });
          res.status(200).json({
            message: `Hey ${findUser.name}`,
            token: token,
          });
        }
        if (err) res.status(401).json({ message: "Login Failed" });
      });
    } else {
      res.json({ message: "Invalid User/ User Does Not Exists " });
    }
    // result == true
  } catch (err) {
    res.json({ message: "Something went Wrong" });
  }
});

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password, password2 } = req.body;
    if (
      password.toLowerCase() !== password2.toLowerCase() ||
      password.length < 6
    ) {
      return res.json({ message: "Please Check Password" });
    }

    const checkUserByEmail = await User.findOne({ email: email });
    const checkUserByPhone = await User.findOne({ phone: phone });

    if (!checkUserByEmail && !checkUserByPhone) {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
          try {
            await User.create({
              name: name,
              email: email,
              phone: phone,
              password: hash,
            });
            res.json({
              message:
                "Signup Success. Please Login and Verify Your Account. Thanks For Joining us.",
            });
          } catch (err) {
            res.json({ message: "Something Went Wrong." });
          }
        });
      });
    }

    if (checkUserByEmail) {
      res.json({ message: "User Exists:-" + email });
    }
    if (checkUserByPhone) {
      res.json({ message: "User Exists:-" + phone });
    }
  } catch (err) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

router.post("/auth/otpverify", async (req, res) => {
  const { otp, email, phone } = req.body;
  let check;
  if (email) check = { email: email };
  if (phone) phone = { phone: phone };

  const findUser = await User.findOne({ ...check });
  try {
    if (findUser) {
      if (Number(otp) === Number(findUser.forgetPasswordOtp)) {
        const newToken = await generateToken({
          _id: findUser._id,
          email: findUser.email,
          phone: findUser.phone,
        });
        await User.findOneAndUpdate(
          { _id: findUser._id },
          { forgetPasswordOtp: null, forgetPasswordTime: null }
        );
        res.status(200).json({
          message: `Hey ${findUser.name}. You are logged in. Now You can Change Password`,
          token: newToken,
        });
      } else {
        res.json({ message: "Wrong Otp" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

router.post("/auth/reqforotp", async (req, res) => {
  const { email, phone } = req.body;
  let check;
  if (email) check = { email: email };
  if (phone) phone = { phone: phone };

  const findUser = await User.findOne({ ...check });
  const randomNumber = await Math.floor(Math.random() * 100000);
  try {
    if (findUser) {
      console.log("I am top");
      await User.findOneAndUpdate(
        { _id: findUser._id },
        { forgetPasswordOtp: randomNumber, forgetPasswordTime: new Date() }
      );
      await sendMail({ otp: randomNumber, email: findUser.email });
      res.json({ message: "Otp has Been Sent To Your Mail" });
    } else {
      res.status(400).json({ message: "User Not Found" });
      console.log("I am bottom");
    }
  } catch (err) {
    console.log(err);
    if (findUser) {
      await User.findOneAndUpdate(
        { _id: findUser._id },
        { forgetPasswordOtp: undefined }
      );
    }
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

router.post("/auth/change-password", async (req, res) => {
  try {
    const { token, newpassword } = req.body;

    const generateNewpassoer = async (tokenUser, response) => {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(newpassword, salt, async function (err, hash) {
          try {
            const clone = { password: hash };
            await User.findOneAndUpdate({ _id: tokenUser._id }, clone);
            res.json({
              message: "Password Updated",
            });
          } catch (err) {
            res.json({ message: "Something Went Wrong." });
          }
        });
      });
    };

    try {
      const tokenUser = await tokenVerify(token);
      generateNewpassoer(tokenUser);
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: "Token Expired or Invalid Token" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

router.post("/address/add", async (req, res) => {
  const addAddress = async ({
    address1,
    address2,
    city,
    userId,
    pinCode,
    state,
    phone,
  }) => {
    console.log(address1,
      address2,
      city,
      userId,
      pinCode,
      state,
      phone,)
    try {
      await Address.create({
        address1: address1,
        address2: address2,
        city: city,
        phone: phone,
        state: state,
        userId: userId,
        pinCode: pinCode,
      });
      res.json({ message: "Address Added" });
    } catch (error) {
      console.log(error)
      res.json({ message: "Address not Added Please Check Your Fields" });
    }
  };
  const { address1, address2, city, state, phone, pinCode, token } = req.body;
  try {
    const userId = await tokenVerify(token);
    console.log(userId)
    addAddress({
      address1,
      address2,
      city,
      state,
      phone,
      pinCode,
      userId: userId.data._id,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Invalid Token" });
  }
});

router.post("/address/get", async (req, res) => {
  try {
    const { token } = req.body;
    const { data } = await tokenVerify(token);
    const result = await Address.find({ userId: data._id });
    res.json(result);
  } catch (error) {
    res.json({ message: "Something Went Wrong." });
  }
});

router.post("/address/delete/:id", async (req, res) => {
  try {
    const { token } = req.body;
    const verify = await tokenVerify(token);
    if (verify) {
      const id = req.params.id;
      await Address.deleteOne({ _id: id, userId: verify.data._id });
      res.json({ message: "Address Deleted" });
    } else {
      res.json({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send({ message: "Something Went Wrong" });
  }
});

router.post("/address/edit/:id", async (req, res) => {
  try {
    const { token, address1, address2, city, phone, state, pinCode } = req.body;
    const id = req.params.id;
    const verify = await tokenVerify(token);
    if (verify.data._id) {
      const result = await Address.findOneAndUpdate(
        { _id: id, userId: verify.data._id },
        {
          address1: address1,
          address2: address2,
          city: city,
          phone: phone,
          state: state,
          pinCode: pinCode,
        }
      );
      if(result){
        res.json({ message: "Address Updated"})

      } else{
        res.json({ message: "Address Not Updated" });

      }
      console.log(result)
    } else {
      res.json({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send({ message: "Something Went Wrong" });
  }
});

module.exports = router;
