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
  submissions: [
    {
      type: Map, // Using Map to store key-value pairs (e.g., name: "John", email: "john@example.com")
      of: String,
    },
  ],
});

module.exports = mongoose.model("Form", formSchema);
