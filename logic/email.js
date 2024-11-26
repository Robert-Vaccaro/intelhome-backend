const env = require('../config/env');
var nodemailer = require('nodemailer');

exports.sendEmailCode = async (userEmail, code) => {
    let { email, pw } = env;
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        service: 'gmail',
        secure: false,
        debug: false,
        logger: true,
        auth: {
            user: email,
            pass: pw,
        }
    });
    var mailOptions = {
        from: email,
        to: userEmail,
        subject: `IntelHome Email Verification`,
        html: `
            <body style="font-family: 'Poppins', sans-serif; color: white; background-color: #000; padding: 20px; display: flex; justify-content: center; align-items: center; margin: 0;">
                <div style="max-width: 600px; background-color: #1a1a1a; padding: 30px; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); text-align: left;">
                    <h1 style="color: white; font-size: 2rem; font-weight: 600; margin-bottom: 20px;">Email Verification</h1>
                    <p style="font-size: 1rem; color: white; line-height: 1.5;">
                        Hello,
                    </p>
                    <p style="font-size: 1rem; color: white; line-height: 1.5;">
                        Please use the following code to complete your registration process:
                    </p>
                    <p style="font-size: 1.5rem; color: white; background-color: rgba(10, 132, 255, 0.8); line-height: 1.5; padding: 5px 10px; border-radius: 10px; display: inline-block;">
                        ${code}
                    </p>
                    <p>This code is valid for 10 minutes and can only be used once.</p>

                    <p style="font-size: 1rem; color: white; line-height: 1.5;">
                        Cheers,<br>
                        The IntelHome Team
                    </p>
                </div>
            </body>
        `,
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

exports.sendEmailNotifications = async (userEmail, updates) => {
    let { email, pw } = env;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        service: 'gmail',
        secure: false,
        debug: false,
        logger: true,
        auth: {
            user: email,
            pass: pw,
        },
    });

    const htmlMessage = `
        <body style="font-family: 'Poppins', sans-serif; color: white; background-color: #000; padding: 20px; display: flex; justify-content: center; align-items: center; margin: 0;">
            <div style="max-width: 600px; background-color: #1a1a1a; padding: 30px; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); text-align: left;">
                <h1 style="color: white; font-size: 2rem; font-weight: 600; margin-bottom: 20px;">Device Update Notification</h1>
                <p style="font-size: 1rem; color: white; line-height: 1.5;">
                    Hello,
                </p>
                <p style="font-size: 1rem; color: white; line-height: 1.5;">
                    The following devices in your account require updates:
                </p>
                <ul style="font-size: 1rem; color: white; line-height: 1.5;">
                    ${updates.map(device => `<li>"${device.name}" at "${device.location}"</li>`).join("")}
                </ul>
                <p style="font-size: 1rem; color: white; line-height: 1.5;">
                    Please take action to update these devices as soon as possible.
                </p>
                <p style="font-size: 1rem; color: white; line-height: 1.5;">
                    Cheers,<br>
                    The IntelHome Team
                </p>
            </div>
        </body>
    `;

    const mailOptions = {
        from: email,
        to: userEmail,
        subject: `Device Updates Required - IntelHome`,
        html: htmlMessage,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Successfully sent email");
        }
    });

    return true;
};
