const nodemailer = require('nodemailer');
const cron = require('node-cron');

const Breaktime = require('../models/Breaktime');
let lates = [];
const dateToday = new Date();
const emailSender = async () => {
  //email transport configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'eramos.devacad@gmail.com',
      pass: 'ericramos06301994',
    },
  });

  const breaktimes = await Breaktime.find();
  breaktimes.map((bt, index) => {
    if (bt.overbreak === true) {
      lates.push(
        `${bt.username} is ${bt.minsLate}mins late on ${
          bt.breakname
        } break. (${bt.start.toDateString()})\n`,
      );
      // console.log(lates, index, 'lates');
    }
  });

  // let message = JSON.stringify(lates);

  cron.schedule('30 23 * * 5', async () => {
    if (lates) {
      //Email message option
      const mailOptions = {
        from: 'eramos.devacad@gmail.com',
        to: 'ericramosofficial18@gmail.com',
        subject: 'Email from Break System',
        text: `${dateToday.toDateString()} \n List of lates: \n ${lates}`,
      };

      //send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email send: ' + info.response);
        }
      });
    }
  });
};

module.exports = emailSender;
