const express = require("express");
const router = express.Router();
const passport = require("passport");

const { register, login } = require("../controllers/authController");
const { forgotPassword, resetPassword } = require("../controllers/authController"); 

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        const token = req.user.token;
        res.redirect(`/dashboard.html?token=${token}`);
    }
);

router.get(
    "/discord",
    passport.authenticate("discord")
);

router.get(
    "/discord/callback",
    passport.authenticate("discord", { session: false }),
    (req, res) => {
        const token = req.user.token;
        res.redirect(`/dashboard.html?token=${token}`);
    }
);

module.exports = router;