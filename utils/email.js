const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = catchAsync(async (options) => {
  // 1) Create a Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_HOST_USER,
      pass: process.env.EMAIL_HOST_PASSWORD,
    },
  });
  // 2) Define the email options
  const mailOptions = {
    from: 'Marwan Radwan marwan.swe@outlook.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html
  };
  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
