const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //email transport configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'eramos.devacad@gmail.com',
      pass: 'ericramos06301994',
    },
  });

  //Email message option
  const message = {
    from: 'eramos.devacad@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //send email
  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email send: ' + info.response);
    }
  });
};

module.exports = sendEmail;
