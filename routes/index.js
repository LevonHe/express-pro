const express = require("express");

const userRouter = require("./users");
const { jwtAuth } = require("../utils/user-jwt");

const router = express.Router(); // 注册路由

router.use(jwtAuth); // 注入认证模块

router.use("/api/v1", userRouter);

// 自定义的统一异常处理中间件，需要放在最后执行
router.use((err, req, res, next) => {
  // 自定义用户认证失败的错误返回
  console.log("err===", err);
  if (err && err.name === "UnauthorizedError") {
    const { status = 401 } = err;
    res.status(status).json({
      code: status,
      msg: "token失效，请重新登录",
      data: null,
    });
  } else {
    const { output } = err || {};
    // 错误码和错误信息
    const errCode = (output && output.statusCode) || 500;
    const errMsg =
      (output && output.payload && output.payload.error) || err.message;
    res.status(errCode).json({
      code: errCode,
      msg: errMsg,
    });
  }
});

module.exports = router;
