// errors catcher midleware
var Jimp = require("jimp");
const path = require("path");

const { ContactsApiError } = require("./errors");
const NEW_IMAGE_PATH = path.resolve("./public/avatars");

const asyncWrapper = (controller) => {
  return (req, res, next) => {
    controller(req, res).catch(next);
  };
};

const errorHandler = (error, req, res, next) => {
  if (error instanceof ContactsApiError) {
    return res.status(error.status).json({ message: error.message });
  }
  res.status(500).json({ message: error.message });
};

const jimpHelper = (imagePath, filename) => {
  Jimp.read(imagePath, (err, imag) => {
    if (err) throw err;
    imag
      .resize(250, 250) // resize
      .quality(60) // set JPEG quality
      .write(path.resolve(`./public/avatars/${filename}`)); // save
  });
  return path.resolve(`./public/avatars/${filename}`);
};

module.exports = { asyncWrapper, errorHandler, jimpHelper };
