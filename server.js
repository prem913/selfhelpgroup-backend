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
//routes
app.use("/shg", require("./routes/shgroute"));
app.use("/department", require("./routes/departmentroute"));
app.use("/order", require("./routes/orderroute"));
//middlewares
app.use(errorHandler);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started at port ${port}`));
