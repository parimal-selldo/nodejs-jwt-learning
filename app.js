require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const connectMongo = require("./servers/config/db");
const authRoutes = require("./servers/routes/routes");
const { requireAuth, checkCurrentUser } = require("./middlewares/authMiddleWare");

const app = express();

// middleware for static files
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

// setting the view engine
app.set("view engine", "ejs");

// connect to the database
connectMongo();

// routes
app.get("*", checkCurrentUser);
app.get("/", (req, res) => { res.render("home") });
app.get("/smoothies", requireAuth, (req, res) => { res.render("smoothies") });
app.use(authRoutes);

app.listen(3000, () => {
  console.log("Server is listening on 3000");
});
