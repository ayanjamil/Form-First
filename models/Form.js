const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  formId: {
    type: String,
    required: true,
    unique: true,
  },
  fields: {
    type: [String], // Array of form fields (e.g., ["name", "email"])
    required: true,
  },
  originalUrl: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String, // Add this field to store the email of the user who created the form
    required: true,
  },
  submissions: [
    {
      type: Map, // Using Map to store key-value pairs (e.g., name: "John", email: "john@example.com")
      of: String,
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Form", formSchema);
