const express = require("express");
const router = express.Router();
const shortid = require("shortid");
const fs = require("fs");
const path = require("path");

// Path to store data (using simple JSON for now)
const dbFilePath = path.join(__dirname, "../data/db.json");

// Generate new form link
router.post("/generate-link", (req, res) => {
  const { fields, originalUrl } = req.body;

  // Generate unique ID for the form
  const formId = shortid.generate();
  const formData = {
    id: formId,
    fields,
    originalUrl,
  };

  // Save formData to JSON file (for now, no DB)
  let dbData = JSON.parse(fs.readFileSync(dbFilePath, "utf8"));
  dbData.forms.push(formData);
  fs.writeFileSync(dbFilePath, JSON.stringify(dbData, null, 2));

  res.json({ formLink: `http://localhost:5000/api/form/${formId}` });
});

// Serve the form based on the generated link
router.get("/form/:id", (req, res) => {
  const { id } = req.params;

  let dbData = JSON.parse(fs.readFileSync(dbFilePath, "utf8"));
  const form = dbData.forms.find((form) => form.id === id);

  if (!form) return res.status(404).send("Form not found");
  res.json({ fields: form.fields });
});

// Submit the form and redirect
router.post("/submit-form", (req, res) => {
  const { formId, formData } = req.body;

  let dbData = JSON.parse(fs.readFileSync(dbFilePath, "utf8"));
  const form = dbData.forms.find((f) => f.id === formId);

  if (!form) return res.status(404).send("Form not found");

  // Here you could process form data (e.g., save to DB)

  // Redirect to original URL after submission
  res.json({ redirectUrl: form.originalUrl });
});

module.exports = router;
