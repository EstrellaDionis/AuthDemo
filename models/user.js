const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username cannot be blank"],
  },
  password: {
    type: String,
    required: [true, "Password cannot be blank"],
  },
});

//findAndValidate is the name WE chose for it
userSchema.statics.findAndValidate = async function (username, password) {
  const foundUser = await this.findOne({ username });
  const isValid = await bcrypt.compare(password, foundUser.password);
  //if isValid is true, return the foundUser otherwise, return false
  return isValid ? foundUser : false;
};

//this gets called PRE .save() where this middleware is used!
userSchema.pre("save", async function (next) {
  //we do this because we only want to re-hash the password IF the password has been changed by the user.
  //if the password has NOT been modified, move on
  //if it has been modified, run 30 - 31. re-hash and then go next
  //next in this middleware is going to .save() because THIS IS A .PRE MIDDLEWARE!
  if (!this.isModified("password")) return next();
  //this is from from the user that this middleware is implemented on
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", userSchema);
