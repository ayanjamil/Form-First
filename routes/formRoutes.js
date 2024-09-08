const express = require("express");
const router = express.Router();
const shortid = require("shortid");
// const Form = require("../models/Form");
const Form = require("../models/Form");
// const auth = require("../middleware/auth");
const auth = require("../ middleware/auth");

// Protect the form creation route
router.post("/generate-link", auth, async (req, res) => {
  const { fields, originalUrl } = req.body;
  const formId = shortid.generate();

  try {
    const newForm = new Form({
      formId,
      fields,
      originalUrl,
      createdBy: req.user, // Add user who created the form
    });
    await newForm.save();

    res.json({ formLink: `http://localhost:5000/api/form/${formId}` });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating form link");
  }
});

// Generate new form link
// router.post("/generate-link", async (req, res) => {
//   const { fields, originalUrl } = req.body;

//   // Generate unique ID for the form
//   const formId = shortid.generate();

//   try {
//     const newForm = new Form({
//       formId,
//       fields,
//       originalUrl,
//     });

//     await newForm.save(); // Save the form in MongoDB

//     res.json({ formLink: `http://localhost:5000/api/form/${formId}` });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error generating form link");
//   }
// });

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

// Submit the form and redirect
router.post("/submit-form", async (req, res) => {
  const { formId, formData } = req.body; // formData will contain the submitted values (e.g., {name: "John", email: "john@example.com"})

  try {
    // Find the form using formId
    const form = await Form.findOne({ formId });

    if (!form) {
      return res.status(404).send("Form not found");
    }

    // Add the submitted form data to the "submissions" array
    form.submissions.push(formData);

    // Save the updated form with new submissions
    await form.save();

    // Redirect user to the original URL after successful submission
    res.json({ redirectUrl: form.originalUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error submitting form");
  }
});

module.exports = router;
