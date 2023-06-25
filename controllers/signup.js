const Signup = require('../models/signup');
const path = require('path');

exports.getHomePage = (req, res, next) => {
  res.sendFile(path.join(__dirname, '../views/signup.html'));
};

exports.postAddUser = async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  try {
    let existingUser = await Signup.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(422).json('Email already exists');
    }

    const user = await Signup.create({
      name: name,
      email: email,
      password: password,
    });

    res.status(201).json({ newSignUp: user });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      // Handle duplicate entry error
      return res.status(422).json('Email already exists');
    }
    console.log(err);
    res.status(500).json('Internal Server Error');
  }
};
