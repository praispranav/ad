var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");

const mailer = require("nodemailer");

const User = require("../schema/user");

const bcrypt = require("bcrypt");
const saltRounds = 10;
const privateKey = "s0//P4$$w0rDjkjjhuyufvvgjh";

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
      privateKey,{ expiresIn: '20d'}
    );
    resolve(result);
  });
};

const tokenVerify = (token) => {
  return new Promise((resolve, rejects) => {
    jwt.verify(token, privateKey, function (err, decoded) {
      if(decoded){
        resolve(decoded);
      } else {
        rejects(err);
      }
      // err
      // decoded undefined
    });
  });
};

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/login", async (req, res) => {
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

router.post("/register", async (req, res) => {
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

router.post("/reqforotp", async (req, res) => {});

router.post("/otpverify", async (req, res) => {});

router.post("/change-password", async (req, res) => {
  try {
    const { token, newpassword } = req.body;

    const generateNewpassoer = async (tokenUser, response) => {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(newpassword, salt, async function (err, hash) {
          try {
            const clone = { password: hash }
            await User.findOneAndUpdate({ _id: tokenUser._id }, clone);
            res.json({
              message:
                "Password Updated",
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
      console.log(error)
      res.status(401).json({ message: "Token Expired or Invalid Token" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

module.exports = router;
