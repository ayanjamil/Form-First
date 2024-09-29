const express = require("express");
const router = express.Router();
const shortid = require("shortid");
// const Form = require("../models/Form");
const Form = require("../models/Form");
// const auth = require("../middleware/auth");
const auth = require("../ middleware/auth");
const sendEmail = require("../config/nodemailer");
const User = require("../models/User");

// Protect the form creation route
router.post("/generate-link", auth, async (req, res) => {
  const { fields, originalUrl, userEmail } = req.body;
  const formId = shortid.generate();

  try {
    const newForm = new Form({
      formId,
      fields,
      originalUrl,
      userEmail,
      // createdBy: req.user, // Add user who created the form
    });
    await newForm.save();

    res.json({
      formLink: `http://localhost:5000/api/form/${formId}`,
      formId: formId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating form link");
  }
});

// Serve the form based on the generated link
router.get("/form/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const form = await Form.findOne({ formId: id });

    if (!form) {
      return res.status(404).send("Form not found");
    }

    res.json({ fields: form.fields });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching form");
  }
});

router.post("/submit-form", async (req, res) => {
  const { formId, formData } = req.body;

  try {
    const form = await Form.findOne({ formId });
    console.log("FORM : ", form);
    if (!form) return res.status(404).send("Form not found");

    // Fetch the user who created the form
    // const userEmail = await User.findOne({ email: form.createdBy });
    const userEmail = form.userEmail;
    console.log("USER IS : ", userEmail);

    // Send email notification
    const emailText = `Form with ID ${formId} has been filled. Details: ${JSON.stringify(
      formData
    )}`;
    // sendEmail(user.username, "Form Submission Notification", emailText);
    sendEmail(userEmail, "Form Submission Notification", emailText);

    res.json({ redirectUrl: form.originalUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error submitting form");
  }
});

module.exports = router;
