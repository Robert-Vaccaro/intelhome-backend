const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    mongoDd: process.env.MONGO_DB === undefined ? "" : process.env.MONGO_DB,
    awsKey: process.env.ACCESS_KEY === undefined ? "" : process.env.ACCESS_KEY,
    awsSecretKey: process.env.SECRET_ACCESS_KEY === undefined ? "" : process.env.SECRET_ACCESS_KEY,
    bucket: process.env.bucket === undefined ? "" : process.env.bucket,
    awsLink: process.env.awsLink === undefined ? "" : process.env.awsLink,
    region: process.env.region === undefined ? "" : process.env.region,
    apiVersion: process.env.apiVersion === undefined ? "" : process.env.apiVersion,
    device_key: process.env.device_key === undefined ? "" : process.env.device_key,
    priv_key: process.env.priv_key === undefined ? "" : process.env.priv_key,
    priv_key2: process.env.priv_key2 === undefined ? "" : process.env.priv_key2,
    email: process.env.email === undefined ? "" : process.env.email,
    appPass: process.env.appPass === undefined ? "" : process.env.appPass,
    bearEmail: process.env.bearEmail === undefined ? "" : process.env.bearEmail,
    bearPass: process.env.bearPass === undefined ? "" : process.env.bearPass,
    wikiEmail: process.env.wikiEmail === undefined ? "" : process.env.wikiEmail,
    wikiPw: process.env.wikiPw === undefined ? "" : process.env.wikiPw,
    domaEmail: process.env.domaEmail === undefined ? "" : process.env.domaEmail,
    domaPW: process.env.domaPW === undefined ? "" : process.env.domaPW,
    key: process.env.KEY === undefined ? "" : process.env.KEY,
    iv: process.env.IV === undefined ? "" : process.env.IV,
    googleClientID: process.env.GoogleClientID === undefined ? "" : process.env.GoogleClientID,
    googleClientSecret: process.env.GoogleClientSecret === undefined ? "" : process.env.GoogleClientSecret,
    jwtKey: process.env.JWT_KEY === undefined ? "" : process.env.JWT_KEY,
};