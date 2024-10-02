const express = require("express");
const router = express.Router();
const shortid = require("shortid");
// const Form = require("../models/Form");
const Form = require("../models/Form");
// const auth = require("../middleware/auth");
const auth = require("../ middleware/auth");
const sendEmail = require("../config/nodemailer");
const excel = require("exceljs");

// Protect the form creation route
router.post("/generate-link", auth, async (req, res) => {
  const { fields, originalUrl, userEmail } = req.body;
  const formId = shortid.generate();
  console.log("USER : ", req.user);

  try {
    const newForm = new Form({
      formId,
      fields,
      originalUrl,
      userEmail,
      createdBy: req.user, // Add the authenticated user ID
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

router.get("/all-forms", auth, async (req, res) => {
  try {
    const forms = await Form.find({ createdBy: req.user });
    res.json(forms);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching forms");
  }
});

router.get("/export/:formId", async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findOne({ formId });

    if (!form || !form.submissions || form.submissions.length === 0) {
      return res.status(404).send("No submissions found for this form.");
    }

    // Create a new Excel workbook
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Submissions");

    // Add column headers (Adjust this based on your form fields)
    worksheet.columns = [
      { header: "S.No", key: "s_no", width: 10 },
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      // Add other form fields if necessary
    ];

    // Map form submissions to worksheet rows
    console.log("SUBMISSION : ", form.submissions);
    form.submissions.forEach((submission, index) => {
      // Since submission is a Map, use get() to retrieve the values
      worksheet.addRow({
        s_no: index + 1,
        name: submission.get("name"),
        email: submission.get("email"),
      });
    });

    // Send the Excel file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "form-submissions.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting data:", error);
    res.status(500).send("Error exporting form submissions");
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
    form.submissions.push(formData);
    await form.save(); // Save the form with the new submission

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
