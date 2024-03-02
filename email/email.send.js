const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async (to, content) => {
  const config = {
    to: to,
    from: "info@torotutor.com",
    subject: "ToroTutor Email Confirmation",
    html: content,
  };

  try {
    await sgMail.send(config);
  } catch (err) {
    console.error(err);
  }
};
