var AWS = require('aws-sdk');
let env = require('../config/env');
let { awsKey, awsSecretKey, region, apiVersion } = env;
AWS.config.update({
    accessKeyId: awsKey,
    secretAccessKey: awsSecretKey,
    region: region
});

// Create S3 service object
s3 = new AWS.S3({
    apiVersion: apiVersion
});
s3.listBuckets(function(err, data) {
    if (err) {
        console.log("Error");
    } else {
        console.log("S3 Connected");
    }
  });
module.exports = { s3 };