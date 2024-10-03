const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const AWS = require("aws-sdk");
const env = require("dotenv").config();

// AWS SDK setup
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const JWT_SECRET = "SDXC"; // Use a secure secret key

// Register User
router.post("/register", async (req, res) => {
  console.log("REGISTER ROUTE HIT");
  const { username, email, password } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const user = {
      userId: Date.now().toString(), // Simple way to generate userId
      username,
      email,
      password: hashedPassword,
    };
    // console.log("USER IS : ", user);

    // DynamoDB params to save the user
    const params = {
      TableName: "Users", // Ensure this table exists in DynamoDB
      Item: user,
    };
    // console.log("PARAMS PASSED : ", params);

    // Save the user to DynamoDB
    dynamoDb.put(params, (err, data) => {
      if (err) {
        console.error("Error saving user:", JSON.stringify(err));
        res.status(500).json({ error: "Error saving user" });
      } else {
        // Generate JWT token after registration
        const token = jwt.sign({ userId: user.userId }, JWT_SECRET, {
          expiresIn: "1h",
        });
        res.status(201).json({ token });
      }
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Error registering user");
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // DynamoDB params to query user by email
  const params = {
    TableName: "Users",
    IndexName: "email-index", // Name of the index you just created
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  try {
    // Query the user from DynamoDB
    dynamoDb.query(params, async (err, data) => {
      if (err) {
        console.error("Error retrieving user:", JSON.stringify(err));
        return res.status(500).json({ error: "Error retrieving user" });
      }

      if (data.Items.length === 0) {
        return res.status(400).json({ error: "User not found" });
      }

      const user = data.Items[0];

      // Check the password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.userId }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token });
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Error logging in");
  }
});

module.exports = router;
