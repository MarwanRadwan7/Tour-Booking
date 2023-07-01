const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const path = require('path');
const pug = require('pug');
const catchAsync = require('./catchAsync');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Marwan Radwan <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const pugPath = path.join(__dirname, '..', 'views', 'emails');
    const html = pug.renderFile(`${pugPath}/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Tour Booking website');
  }

  async sendPasswordReset() {
    await this.send(
      `passwordReset`,
      'Your password reset token is valid for only 10 minutes'
    );
  }
};

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
