const express = require("express");
const app = express();
const dbconnect = require("./config/db");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware");

require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
dbconnect();
app.get("/", (req, res) => {
  res.send("Server Running");
});
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  return next();
});
//routes
app.use("/shg", require("./routes/shgroute"));
app.use("/department", require("./routes/departmentroute"));
app.use("/order", require("./routes/orderroute"));
app.use("/institute", require("./routes/instituteroute"));
app.use("/ceo", require("./routes/ceoroute"));
//middlewares
app.use(errorHandler);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started at port ${port}`));
