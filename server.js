const express = require("express");
const app = express();
const dbconnect = require("./config/db");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware");
const cookieParser = require("cookie-parser");
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: ["http://localhost:3000", 'https://online-shg-item-procurement-system.netlify.app'] }));
app.use(cookieParser());
dbconnect();
app.get("/", (req, res) => {
  res.send("Server Running");
});
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'https://online-shg-item-procurement-system.netlify.app'
  ];
  const { origin } = req.headers;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Credentials', 'true');
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  }
  else {
    next();
  }
});
//routes
app.use("/shg", require("./routes/shgroute"));
app.use("/department", require("./routes/departmentroute"));
app.use("/order", require("./routes/orderroute"));
app.use("/institute", require("./routes/instituteroute"));
app.use("/ceo", require("./routes/ceoroute"));
app.use("/zone", require("./routes/zoneroute"));
//middlewares
app.use(errorHandler);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started at port ${port}`));
