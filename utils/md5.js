const cryptoJs = require("crypto-js");

function md5(s) {
  return cryptoJs.MD5(s).toString();
}

module.exports = md5;
