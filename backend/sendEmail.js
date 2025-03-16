const nodemailer = require('nodemailer');

async function sendVerificationEmail(userEmail, token) {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'dronecleaningcompanyinterns@gmail.com',
            pass: 'mkfn oiob swrf aogl',
        },
    });

    const verificationLink = `http://localhost:5000/verify?token=${token}`;

    let mailOptions = {
        from: 'dronecleaningcompanyinterns@gmail.com',
        to: userEmail,
        subject: 'Email Verification',
        text: `Please verify your email by clicking the following link: ${verificationLink}`,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = sendVerificationEmail;
