const env = require('../config/env');
var nodemailer = require('nodemailer');

exports.sendEmail = async (req) => {
    let { domaEmail, domaPW, appPass, email } = env;
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        service: 'gmail',
        secure: false,
        debug: false,
        logger: true,
        auth: {
            user: domaEmail,
            pass: domaPW
        }
    });

    let urlString = env.awsLink + req.body.clientID + "/inspections/" + req.body.inspectionID;

    // Dynamically generate image tags based on numOfImages
    let imageTags = '';
    const numOfImages = parseInt(req.body.numOfImages, 10); // Ensure it's an integer

    for (let i = 0; i < numOfImages; i++) {
        imageTags += `
        <img style="width: 300px;height: auto; padding: 10px;" src="${urlString}/${i}.jpeg"></img>`;
    }

    var mailOptions = {
        from: domaEmail,
        to: domaEmail,
        subject: `New ${req.body.submissionType + " Submission"} from ${req.body.clientName}`,
        text: "",
        html: `
        <p style="border: 1px solid lightgray; border-radius: 10px;padding: 10px; width: 300px;">Inspection ID: ${req.body.inspectionID}</p>
        <p style="border: 1px solid lightgray; border-radius: 10px;padding: 10px; width: 300px;">Client Name: ${req.body.clientName}</p>
        <p style="border: 1px solid lightgray; border-radius: 10px;padding: 10px; width: 300px;">Client Email: ${req.body.clientEmail}</p>
        <p style="border: 1px solid lightgray; border-radius: 10px;padding: 10px; width: 300px;">Client Type: ${req.body.senderType}</p>
        <p style="border: 1px solid lightgray; border-radius: 10px;padding: 10px; width: 300px;">Client Address: ${req.body.address}</p>
        <p style="border: 1px solid lightgray; border-radius: 10px;padding: 10px; width: 300px;">Number of Images: ${numOfImages}</p>
        ${imageTags}
        <p style="border: 1px solid lightgray; border-radius: 10px;padding: 10px; width: 300px;">Description: ${req.body.descrip}</p>
        <div style="display: flex;justify-content: center;width: 300px;padding: 10px;">
        </div>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error sending email:", error);
        } else {
            console.log("Successfully sent email");
        }
    });

    return true;
};

exports.sendEmailCode = async (user, code) => {
    let { domaEmail, domaPW, appPass, email } = env;
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        service: 'gmail',
        secure: false,
        debug: false,
        logger: true,
        auth: {
            user: domaEmail,
            pass: domaPW
        }
    });

    var mailOptions = {
        from: domaEmail,
        to: user.email_address,
        subject: `Domalytx Email Verification`,
        text: "",
        html: `
            <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                <h2 style="color: #4A90E2;">Email Verification Code</h2>
                <p>Hello,</p>
                <p>Thank you for registering with Domalytx. Please use the following code to complete your registration process.</p>
                <div style="background-color: #f2f2f2; padding: 10px 15px; max-width: 300px; margin: 10px 0; font-size: 24px; text-align: center; border-radius: 4px;">
                    ${code}
                </div>
                <p>This code is valid for 10 minutes and can only be used once.</p>
                <p>If you did not request this code, please ignore this email.</p>
                <p>Thank you,<br>Your Company Team</p>
            </div>
            `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error sending email:", error);
        } else {
            console.log("Successfully sent email");
        }
    });

    return true;
};


exports.sendInspectionBoostEmail = async (user, address) => {
    let { domaEmail, domaPW, appPass, email } = env;
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        service: 'gmail',
        secure: false,
        debug: false,
        logger: true,
        auth: {
            user: domaEmail,
            pass: domaPW
        }
    });

    var mailOptions = {
        from: domaEmail,
        to: domaEmail,
        subject: `New Inspection Boost from: ${user.firstName} ${user.lastName}`,
        text: "",
        html: `
            <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                <h2 style="color: #4A90E2;">New Inspection Boost from:</h2>
                <p>${user.firstName} ${user.lastName}</p>
                <p>${user.email_address}</p>
                <div style="background-color: #f2f2f2; padding: 10px 15px; max-width: 300px; margin: 10px 0; font-size: 24px; text-align: center; border-radius: 4px;">
                    ${address}
                </div>
            </div>
            `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error sending email:", error);
        } else {
            console.log("Successfully sent email");
        }
    });

    return true;
};

exports.sendPasswordResetCode = async (user, code) => {
    let { domaEmail, domaPW, appPass, email } = env;
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        service: 'gmail',
        secure: false,
        debug: false,
        logger: true,
        auth: {
            user: domaEmail,
            pass: domaPW
        }
    });

    var mailOptions = {
        from: domaEmail,
        to: user.email_address,
        subject: `Domalytx Password Reset`,
        text: "",
        html: `
            <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                <h2 style="color: #4A90E2;">Password Reset Code</h2>
                <p>Hello,</p>
                <p>Please use the following code to reset your password.</p>
                <div style="background-color: #f2f2f2; padding: 10px 15px; max-width: 300px; margin: 10px 0; font-size: 24px; text-align: center; border-radius: 4px;">
                    ${code}
                </div>
                <p>This code is valid for 10 minutes and can only be used once.</p>
                <p>If you did not request this code, please ignore this email.</p>
                <p>Thank you,<br>Your Company Team</p>
            </div>
            `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error sending email:", error);
        } else {
            console.log("Successfully sent email");
        }
    });

    return true;
};
