const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const formRoutes = require("./routes/formRoutes");
// const formRoutes = require("./ro");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get("/", (_, res) => {
  res.send("Hello, this is demo the demon local host up and running ");
});
app.use("/api", formRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
