const path = require("path");
require('dotenv').config(); 
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
const uuid = require("uuid");
const User = require("../models/user");
const ForgetPassword = require('../models/forgetpassword');

exports.forgetPassword = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../views/forgetpassword.html"));
};

exports.postForgetPassword = async (req, res, next) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      const forgetpasswordcreate = await ForgetPassword.create({ id: uuid.v4(), active: true, userId: user.id });
     
      const transporter = nodemailer.createTransport({
        host: process.env.BREVO_HOST,
        port: 587,
        auth: {
          user: `${process.env.USER}`,
          pass: `${process.env.PASS}`,
        },
      });
      const msg = {
        from: "sender@example.com",
        to: email,
        subject: "Password Reset",
        text: "and easy to do anywhere, even with Node.js",
        html: `<a href="http://localhost:3000/password/resetpassword/${forgetpasswordcreate.id}">Click to Reset Password</a>`,
      };
      await transporter.sendMail(msg);
      res.status(201).json({ message: "Link to reset password sent to your mail" });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getResetPassword = async (req, res, next) => {
  try {
    const forgetPasswordId = req.params.id;
    const forgetpassword = await ForgetPassword.findByPk(forgetPasswordId);
    if (forgetpassword && forgetpassword.active) {
      
      await forgetpassword.update({ active: false });
      res.status(200).send(`
        <html>
          <form action="/password/updatepassword/${forgetPasswordId}" method="get">
            <label for="newpassword">Enter New password</label>
            <input name="newpassword" type="password" required></input>
            <button>Reset Password</button>
          </form>
        </html>
      `);
    } else {
      res.status(404).send("Invalid or expired password reset request");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getUpdatePassword = async (req, res, next) => {
  try {
    const id = req.params.id;
    const newpassword = req.query.newpassword;
    const details = await ForgetPassword.findByPk(id);
    const user = await User.findByPk(details.userId);
    if (user) {
      const saltRounds = 10;
      bcrypt.hash(newpassword, saltRounds, async (err, hash) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error updating password" });
        }
        await user.update({ password: hash });
        res.status(201).json({ message: "Password updated successfully" });
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating password" });
  }
};
