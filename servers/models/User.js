const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please enter the email"],
    unique: true, // Error message for this will be handled separately
    lowercase: true,
    validate: [isEmail, "Please enter the valid email id"]
  },
  password: {
    type: String,
    required: [true, "Please provide the password"],
    minlength: [6, "Minimum password length is 6 characters"]
  }
})

// MONGOOSE HOOKS
// fire the function before the doc saved to DB
userSchema.pre("save", async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// fire the function after the doc saved to DB
userSchema.post("save", function (doc, next) {
  next();
});

//static method to login user
userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email });
  if(!user) {
    throw Error("incorrect email");
  }
  const auth = await bcrypt.compare(password, user.password);
  if(!auth) {
    throw Error("incorrect password");
  }
  return user;
}

const User = mongoose.model("User", userSchema);
module.exports = User;
