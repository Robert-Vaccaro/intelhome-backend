const moment = require('moment-timezone');

const Roles = Object.freeze({
  USER: "user",
  ADMIN: "admin",
  SUPER: "super",
});

function getCurrentTime() {
  return moment(moment().tz(moment.tz.guess())).unix();
}

function generateCode(min = 1000, max = 9999) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { Roles, generateCode, getCurrentTime };