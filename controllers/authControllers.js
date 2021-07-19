var Jimp = require("jimp");
const { unlink } = require("fs");
const {
  registration,
  login,
  logout,
  currentUser,
  avatarUser,
} = require("../services/authServices");
const { jimpHelper } = require("../helpers/apiHelpers");

const registrationController = async (req, res) => {
  const { email, password } = req.body;
  await registration(email, password);
  res.status(201).json({ email, password, status: "success" });
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
module.exports = {
  registrationController,
  loginController,
  currenUserController,
  logoutController,
  avatarController,
};
