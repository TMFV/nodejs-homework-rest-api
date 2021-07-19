const mongoose = require("mongoose");
var gravatar = require("gravatar");
const bcrypt = require("bcrypt");

mongoose.set("useCreateIndex", true); //---

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  avatarURL: {
    type: String,
    default: function () {
      return gravatar.url(
        this.email,
        {
          protocol: "http",
          s: "500",
        },
        true
      );
    },
  },
  token: {
    type: String,
    default: null,
  },
});
userSchema.pre("save", async function () {
  if (this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});
const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
