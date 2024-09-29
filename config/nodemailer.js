const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Use Gmail or your preferred email service
  auth: {
    user: "testworkerai@gmail.com", // Your email
    pass: "ijzp hbna sblp rxqy", // Your password or app-specific password
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: "testworkerai@gmail.com",
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendEmail;
