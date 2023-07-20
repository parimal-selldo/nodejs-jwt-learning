const userModel = require("../models/User");
const jwt = require("jsonwebtoken");

// handle errors
const handleErrors = (err) => {
  let errors = { email: "", password: "" };
  console.log(err.message);

  // for login functionality, check for incorrect email and password
  if(err.message == "incorrect email") {
    errors.email = "email is not registered";
  }
  if(err.message == "incorrect password") {
    errors.password = "that is incorrect password";
  }

  // duplicate email code
  if (err.code === 11000) {
    errors.email = "that email is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes('User validation failed')) {
    // { properties } = error // remember this
    /*
        properties : {
                        message: 'Please enter the valid email id',
                        type: 'user defined',
                        validator: <ref *1> [Function: isEmail] { default: [Circular *1] },
                        path: 'email',
                        value: 'mario'
                      }
                      {
                        validator: [Function (anonymous)],
                        message: 'Minimum password length is 6 characters',
                        type: 'minlength',
                        minlength: 6,
                        path: 'password',
                        value: '123'
                      }
    */
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
}

const maxAge = 3 * 24 * 60 * 60; //seconds
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maxAge
  });
}

module.exports.signup_get = (req, res) => {
  res.render("signup");
}

module.exports.login_get = (req, res) => {
  res.render("login");
}

module.exports.signup_post = async (req, res) => {
  try {
    const user = await userModel.create(req.body);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ message: "User Created", user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
}
