const env = require('../config/env');
var nodemailer = require('nodemailer');

exports.sendEmailCode = async (email, code) => {
    let { helloEmail, helloPw } = env;
    const transporter = nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: 465, // Use 465 for SSL, or 587 for TLS
        secure: true, // true for 465, false for other ports
        auth: {
            user: helloEmail,
            pass: helloPw
        }
    });

    var mailOptions = {
        from: helloEmail,
        to: email,
        subject: `PayTab Email Verification`,
        text: "",
        html: `
                <body style="font-family: 'Poppins', sans-serif; color: rgba(186, 104, 200, 1); background-color: #000; padding: 20px; display: flex; justify-content: center; align-items: center; margin: 0;">
                    <div style="max-width: 600px; background-color: #1a1a1a; padding: 30px; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); text-align: left;">
                        <h1 style="color: rgba(186, 104, 200, 1); font-size: 2rem; font-weight: 600; margin-bottom: 20px;">Email Verification</h1>
                        <p style="font-size: 1rem; color: rgba(186, 104, 200, 0.8); line-height: 1.5;">
                            Hello,
                        </p>
                        <p style="font-size: 1rem; color: rgba(186, 104, 200, 0.8); line-height: 1.5;">
                            Please use the following code to complete your registration process:
                        </p>
                        <p style="font-size: 1.5rem; color: white; background-color: gray; line-height: 1.5; padding: 5px 10px; border-radius: 10px; display: inline-block;">
                            ${code}
                        </p>
                        <p style="font-size: 1rem; color: rgba(186, 104, 200, 0.8); line-height: 1.5;">
                            Cheers,<br>
                            The PayTab Team
                        </p>
                        <p style="margin-top: 30px; font-size: 0.8rem; color: rgba(186, 104, 200, 0.6);">
                        </p>
                    </div>
                </body>
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

exports.sendEarlyAccessEmail = async (userEmail, code) => {
    let { email, pw, helloEmail, helloPw } = env;
    // var transporter = nodemailer.createTransport({
    //     host: 'smtp.gmail.com',
    //     port: 587,
    //     service: 'gmail',
    //     secure: false,
    //     debug: false,
    //     logger: true,
    //     auth: {
    //         user: email,
    //         pass: pw
    //     }
    // });

    const transporter = nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: 465, // Use 465 for SSL, or 587 for TLS
        secure: true, // true for 465, false for other ports
        auth: {
            user: helloEmail, // Your Private Email address
            pass: helloPw // Your Private Email password
        }
    });
    
    var mailOptions = {
        from: helloEmail,
        to: userEmail,
        subject: `Welcome to PayTab`,
        text: "",
        html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to PayTab</title>
                </head>
                <body style="font-family: 'Poppins', sans-serif; color: rgba(186, 104, 200, 1); background-color: #000; padding: 20px; display: flex; justify-content: center; align-items: center; margin: 0;">
                <div style="max-width: 600px; background-color: #1a1a1a; padding: 30px; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); text-align: left;">
                    <!-- Title -->
                    <h1 style="color: rgba(186, 104, 200, 1); font-size: 2rem; font-weight: 600; margin-bottom: 20px;">Welcome to PayTab!</h1>
                    
                    <!-- Introduction Text -->
                    <p style="font-size: 1rem; color: rgba(186, 104, 200, 0.8); line-height: 1.5;">
                    Hi there,
                    </p>
                    
                    <!-- Body Text -->
                    <p style="font-size: 1rem; color: rgba(186, 104, 200, 0.8); line-height: 1.5;">
                    Thank you for signing up for early access to PayTab! We're excited to have you on board and can't wait for you to experience seamless payments at your favorite bars and restaurants.
                    </p>
                    
                    <p style="font-size: 1rem; color: rgba(186, 104, 200, 0.8); line-height: 1.5;">
                    With PayTab, you can open and close your tab from your phone, skip the wait for the check, and even split bills effortlessly with friends. You'll be the first to know when we officially launch.
                    </p>
                    
                    <!-- Closing Text -->
                    <p style="font-size: 1rem; color: rgba(186, 104, 200, 0.8); line-height: 1.5;">
                    Cheers,<br>
                    The PayTab Team
                    </p>
                    
                    <!-- Unsubscribe Link -->
                    <p style="margin-top: 30px; font-size: 0.8rem; color: rgba(186, 104, 200, 0.6);">
                    <a href="https://rocky-everglades-23449-48ef56fc7402.herokuapp.com/users/unsubscribe-early-access?email=${userEmail}&code=${code}" style="color: rgba(186, 104, 200, 1); text-decoration: none;">Unsubscribe from early access emails</a>
                    </p>
                </div>
                </body>
                </html>
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
    let { email, pw } = env;
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        service: 'gmail',
        secure: false,
        debug: false,
        logger: true,
        auth: {
            user: domemailaEmail,
            pass: pw
        }
    });

    var mailOptions = {
        from: email,
        to: user.email,
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
