const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const service = require("../services/userService");

const validator = [
  body("username").isString().withMessage("用户名类型错误"),
  body("password").isString().withMessage("密码类型错误"),
];

const resetPwdValidator = [
  body("username").isString().withMessage("用户名类型错误"),
  body("oldPassword").isString().withMessage("密码类型错误"),
  body("newPassword").isString().withMessage("密码类型错误"),
];

router.post("/login", validator, service.login);
router.post("/register", validator, service.register);
router.post("/resetPwd", resetPwdValidator, service.resetPwd);

module.exports = router;
