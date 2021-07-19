var Jimp = require("jimp");
const { unlink } = require("fs");
const {
  registration,
  login,
  logout,
  currentUser,
  avatarUser,
  verification,
  repeatVerifMail,
} = require("../services/authServices");
const { jimpHelper } = require("../helpers/apiHelpers");

const registrationController = async (req, res) => {
  const { email, password } = req.body;
  await registration(email, password);
  res.status(201).json({ email, password, status: "success" });
};
const verificationController = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await verification(verificationToken);
  if (!user) {
    res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ message: "Verification successful" });
};

const loginController = async (req, res) => {
  const { email, password } = req.body;
  const token = await login(email, password);
  res.json({ status: "success", token });
};

const currenUserController = async (req, res) => {
  const { _id: userId } = req.user;
  const user = await currentUser(userId);
  res.json({
    email: user.email,
    subscription: user.subscription,
    status: "success",
  });
};

const logoutController = async (req, res) => {
  const { _id: userId } = req.user;
  await logout(userId);
  res.status(204).json({ status: "204 No Content" });
};

const avatarController = async (req, res) => {
  const { _id: userId } = req.user;
  const pathFile = req.file.path;
  const filename = req.file.filename;
  const newAvatarPath = await jimpHelper(pathFile, filename);
  await unlink(pathFile, (err) => {
    if (err) throw err;
    console.log(`${pathFile} was deleted`);
  });
  const user = await avatarUser(userId, newAvatarPath);
  res.json({
    avatarURL: newAvatarPath,
    status: "success",
  });
};

const verifMailRepeatController = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "missing required field email" });
  }
  const user = await repeatVerifMail(email);
  if (user.verify === true) {
    res.states(400).json({ message: "Verification has already been passed" });
  }
  res.json({ status: "success" });
};

module.exports = {
  registrationController,
  loginController,
  currenUserController,
  logoutController,
  avatarController,
  verificationController,
  verifMailRepeatController,
};
