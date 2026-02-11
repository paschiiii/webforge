require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("./src/config/passport");

const connectDB = require("./src/config/db");

const app = express();
const PORT = 3000;

connectDB();

app.use(express.json());
app.use(session({
    secret: "webforge_secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

const authRoutes = require("./src/routes/authRoutes");
app.use("/api/auth", authRoutes);

const dashboardRoutes = require("./src/routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

const ticketRoutes = require("./src/routes/ticketRoutes");
app.use("/api/tickets", ticketRoutes);

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});