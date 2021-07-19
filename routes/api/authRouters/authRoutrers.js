const express = require("express");
const routerAuth = new express.Router();
const { authMidleware } = require("../../../midlewares/authMidlware");
const { asyncWrapper } = require("../../../helpers/apiHelpers");
const { uploadMiddleware } = require("../../../helpers/multer");

const {
  registrationController,
  loginController,
  currenUserController,
  logoutController,
  avatarController,
  verificationController,
  verifMailRepeatController,
} = require("../../../controllers/authControllers");

routerAuth.post("/signup", asyncWrapper(registrationController));
routerAuth.post("/login", asyncWrapper(loginController));
routerAuth.post("/current", authMidleware, asyncWrapper(currenUserController));
routerAuth.post("/logout", authMidleware, asyncWrapper(logoutController));
routerAuth.patch(
  "/avatars",
  authMidleware,
  uploadMiddleware.single("avatar"),
  asyncWrapper(avatarController)
);
routerAuth.get(
  "/verify/:verificationToken",
  asyncWrapper(verificationController)
);
routerAuth.post("/verify/", asyncWrapper(verifMailRepeatController));

module.exports = routerAuth;
