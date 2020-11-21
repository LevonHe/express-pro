const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { PRIVATE_KEY } = require("./constant");

// 验证token是否过期
const jwtAuth = expressJwt({
  secret: PRIVATE_KEY, // 设置密钥
  credentialsRequired: true, // 是否校验
  // 自定义获取token的函数
  getToken: (req) => {
    if (req.headers.authorization) {
      return req.headers.authorization;
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
  },
  algorithms: ["HS256"],
  // 设置jwt认证的白名单
}).unless({
  path: ["/", "/api/v1/login", "/api/v1/register", "/api/v1/resetPwd"],
});

// token解析
function decode(req) {
  const token = req.get("Authorization");
  return jwt.verify(token, PRIVATE_KEY);
}

module.exports = {
  jwtAuth,
  decode,
};
