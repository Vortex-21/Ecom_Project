// utils/otp.js
const nodemailer = require('nodemailer');
// const twilio = require('twilio');
const crypto = require('crypto');
const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
const client = require("twilio")(accountSid, authToken);

// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: process.env.EMAIL_ID   ,
//     pass: process.env.APP_PASS
//   },
// });

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_ID   ,
      pass: process.env.APP_PASS
    },
  });

// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const generateOTP = () => {
  return crypto.randomBytes(3).toString('hex');
};


const sendEmailOTP = async (email, otp) => {
  const mailOptions = {
    from: {
      name: "XYZ",
      address: process.env.EMAIL_ID,//needs to have company email address.
    },
    to: `${email}`, //test
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`,
  };
  // const mailOptions = {
  //   from: process.env.EMAIL_USER,
  //   to: email,
  //   subject: 'Your OTP Code',
  //   text: `Your OTP code is ${otp}`,
  // };

  await transporter.sendMail(mailOptions);
};

const sendSMSOTP = async (phoneNumber, otp) => {
  await client.messages.create({
    body: `Your OTP code is ${otp}`,
    from: process.env.TWILIO_NUM,
    to: `+91${phoneNumber}`,
  });
};

module.exports = { generateOTP, sendEmailOTP, sendSMSOTP };
