const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const formRoutes = require("./routes/formRoutes");
const authRouter = require("./routes/authRoutes");
const env = require("dotenv").config(); // Make sure .env is configured properly

const app = express();

// AWS SDK setup
const AWS = require("aws-sdk");

// Update the region from environment variables
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Use environment variables
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Use environment variables
});

// Initialize DynamoDB Document Client
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample route to verify server is running
app.get("/", (_, res) => {
  res.send("Hello, this is demo the demon local host up and running ");
});

// Use form routes and auth routes
app.use("/api", formRoutes);
app.use("/auth", authRouter);

// Server listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
