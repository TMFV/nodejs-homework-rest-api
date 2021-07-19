const express = require("express");
var multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const FILE_DIR = path.resolve("./tmp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FILE_DIR);
  },
  filename: (req, file, cb) => {
    req.file = file;
    const [filename, extension] = file.originalname.split(".");
    cb(null, `${uuidv4()}.${extension}`);
  },
});

const uploadMiddleware = multer({ storage });

module.exports = { uploadMiddleware };
