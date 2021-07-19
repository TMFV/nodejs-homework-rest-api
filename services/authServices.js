const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");
const { User } = require("../model/userModel");
const {
  NotAuthorizedError,
  ValidationError,
  WrongParametersError,
} = require("../helpers/errors");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const registration = async (email, password) => {
  let user;
  let newMail = await User.findOne({ email });
  const verificationToken = uuidv4();
  if (newMail === null) {
    user = new User({
      email,
      password,
      verifyToken: verificationToken,
    });
    await user.save();
    const msg = {
      to: email,
      from: "tmf-1@ukr.net", // Use the email address or domain you verified above
      subject: "Please confirm your email",
      text: `Please confirm your email GET http://localhost:3000/api/users/verify/${verificationToken}`,
      html: `<h1>Please confirm your email GET http://localhost:3000/api/users/verify/${verificationToken}</h1>`,
    };
    await sgMail.send(msg);
    return user;
  } else if (newMail.email == email) {
    throw new WrongParametersError("Email in use");
  } else if (!user) {
    throw new ValidationError(
      "<Ошибка от Joi или другой библиотеки валидации>"
    );
  }
};
const verification = async (verificationToken) => {
  let user = await User.findOne({ verifyToken: verificationToken });
  if (!user) {
    throw new WrongParametersError("Email not found for verification");
  }
  user.verify = true;
  user.verifyToken = null;
  await user.save();
  const msg = {
    to: user.email,
    from: "tmf-1@ukr.net", // Use the email address or domain you verified above
    subject: "Please confirm your email",
    text: ` Confirmed email SUCCESS`,
    html: `<h1>Confirmed email SUCCESS</h1>`,
  };
  await sgMail.send(msg);

  return user;
};

const login = async (email, password) => {
  const user = await User.findOne({ email, verify: true });
  if (!user) {
    throw new NotAuthorizedError(
      `Ошибка от Joi или другой библиотеки  валидации`
    );
  }
  if (!bcrypt.compare(password, user.password)) {
    throw new NotAuthorizedError("Email or password is wrong");
  }
  const token = jwt.sign(
    {
      _id: user.id,
      createdAt: user.createdAt,
    },
    process.env.JWT_SECRET
  );
  await User.findByIdAndUpdate({ _id: user._id }, { token: token });
  return token;
};
const currentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotAuthorizedError(
      `Ошибка от Joi или другой библиотеки  валидации`
    );
  }
  return user;
};

const logout = async (userId) => {
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new NotAuthorizedError(`Not authorized`);
  }
  await User.findOneAndUpdate({ _id: userId }, { token: null });
  return user;
};
const avatarUser = async (userId, newAvatarPath) => {
  const user = await User.findOneAndUpdate(
    { _id: userId },
    {
      avatarURL: newAvatarPath,
    }
  );
  if (!user) {
    throw new NotAuthorizedError(`Not authorized`);
  }
  return user;
};

const repeatVerifMail = async (email) => {
  let user = await User.findOne({ email });
  if (!user) {
    throw new WrongParametersError("Email not found for verification");
  }
  const msg = {
    to: email,
    from: "tmf-1@ukr.net", // Use the email address or domain you verified above
    subject: "Please confirm your email",
    text: `Please confirm your email GET http://localhost:3000/api/users/verify/${user.verifyToken}`,
    html: `<h1>Please confirm your email GET http://localhost:3000/api/users/verify/${user.verifyToken}</h1>`,
  };
  await sgMail.send(msg);

  return user;
};

module.exports = {
  registration,
  login,
  currentUser,
  logout,
  avatarUser,
  verification,
  repeatVerifMail,
};
