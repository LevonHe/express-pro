const { querySql, queryOne } = require("../utils");
const md5 = require("../utils/md5");
const jwt = require("jsonwebtoken");
const boom = require("@hapi/boom");
const { validationResult } = require("express-validator");
const {
  CODE_ERROR,
  CODE_SUCCESS,
  PRIVATE_KEY,
  JWT_EXPIRED,
} = require("../utils/constant");

function validateUser(username, oldPassword) {
  const sql = `select id, username from sys_user where username='${username}' and password='${oldPassword}'`;
  return queryOne(sql);
}

function findUser(username) {
  const sql = `select id, username from sys_user where username='${username}'`;
  return queryOne(sql);
}

function login(req, res, next) {
  const err = validationResult(req);
  // 如果验证错误，empty不为空
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回
    next(boom.badRequest(msg));
  } else {
    let { username, password } = req.body;
    // md5 加密
    password = md5(password);
    const sql = `select * from sys_user where username='${username}' and password='${password}'`;
    querySql(sql).then((user) => {
      if (!user || user.length === 0) {
        res.json({
          code: CODE_ERROR,
          msg: "用户名或密码错误",
          data: null,
        });
      } else {
        // 登录成功，签发一个token并返回给前端
        const token = jwt.sign(
          // payload：签发的 token 里面要包含的一些数据。
          {
            username,
          },
          // 私钥
          PRIVATE_KEY,
          // 设置过期时间
          { expiresIn: JWT_EXPIRED }
        );
        let userData = {
          id: user[0].id,
          username: user[0].username,
          nickname: user[0].nickname,
          avator: user[0].avator,
          sex: user[0].sex,
          gmt_create: user[0].gmt_create,
          gmt_modify: user[0].gmt_modify,
        };
        res.json({
          code: CODE_SUCCESS,
          msg: "登录成功",
          data: {
            token,
            userData,
          },
        });
      }
    });
  }
}

function register(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { username, password } = req.body;
    findUser(username).then((data) => {
      if (data) {
        res.json({
          code: CODE_ERROR,
          msg: "用户已存在",
          data: null,
        });
      } else {
        password = md5(password);
        const sql = `insert into sys_user(username, password) values('${username}', '${password}')`;
        querySql(sql).then((result) => {
          if (!result || result.length === 0) {
            res.json({
              code: CODE_ERROR,
              msg: "注册失败",
              data: null,
            });
          } else {
            const queryUser = `select * from sys_user where username='${username}' and password='${password}'`;
            querySql(queryUser).then((user) => {
              const token = jwt.sign({ username }, PRIVATE_KEY, {
                expiresIn: JWT_EXPIRED,
              });
              const u = user[0];
              let userData = {
                id: u.id,
                username: u.username,
                nickname: u.nickname,
                avator: u.avator,
                sex: u.sex,
                gmt_create: u.gmt_create,
                gmt_modify: u.gmt_modify,
              };

              res.json({
                code: CODE_SUCCESS,
                msg: "注册成功",
                data: {
                  token,
                  userData,
                },
              });
            });
          }
        });
      }
    });
  }
}

function resetPwd(req, res, next) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors;
    next(boom.badRequest(msg));
  } else {
    let { username, oldPassword, newPassword } = req.body;
    oldPassword = md5(oldPassword);
    validateUser(username, oldPassword).then((data) => {
      console.log("校验用户名和密码===", data);
      if (data) {
        if (newPassword) {
          newPassword = md5(newPassword);
          const sql = `update sys_user set password='${newPassword}' where username='${username}'`;
          querySql(sql).then((user) => {
            if (!user || user.length === 0) {
              res.json({
                code: CODE_ERROR,
                msg: "重置密码失败",
                data: null,
              });
            } else {
              res.json({
                code: CODE_SUCCESS,
                msg: "重置密码成功",
                data: null,
              });
            }
          });
        } else {
          res.json({
            code: CODE_ERROR,
            msg: "新密码不能为空",
            data: null,
          });
        }
      } else {
        res.json({
          code: CODE_ERROR,
          msg: "用户名或旧密码错误",
          data: null,
        });
      }
    });
  }
}

module.exports = {
  login,
  register,
  resetPwd,
};
