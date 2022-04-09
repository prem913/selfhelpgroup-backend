const express = require("express");
const app = express();
const dbconnect = require("./config/db");
const cors = require("cors");
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
dbconnect();
app.get("/", (req, res) => {
  res.send("Hello World");
});
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started at port ${port}`));
