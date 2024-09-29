const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const formRoutes = require("./routes/formRoutes");
const authRouter = require("./routes/authRoutes");
// const formRoutes = require("./ro");
const app = express();

const mongoURI = "mongodb://127.0.0.1:27017/formfirst";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use(cors());
app.use(bodyParser.json());
app.get("/", (_, res) => {
  res.send("Hello, this is demo the demon local host up and running ");
});
app.use("/api", formRoutes);
app.use("/auth", authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
