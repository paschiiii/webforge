const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const transporter = require("../config/mail");

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User existiert bereits" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: "User erfolgreich registriert" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Fehler" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, rememberMe} = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Ungültige Daten" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Ungültige Daten" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: rememberMe ? "30d" : "1h"}
        );

        res.json({
            message: "Login erfolgreich",
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Fehler" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ message: "Wenn die Email existiert, wurde ein Link gesendet." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;

        console.log("Sende Email an:", user.email);

        await transporter.sendMail({
            from: `"WebForge" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: "WebForge Passwort zurücksetzen",
            html: `
                <h2>Passwort zurücksetzen</h2>
                <p>Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>Der Link ist 15 Minuten gültig.</p>
            `
        });

        console.log("Email erfolgreich gesendet");

        res.json({ message: "Wenn die Email existiert, wurde ein Link gesendet." });

    } catch (error) {
        console.log("Forgot Password Fehler:", error);
        res.status(500).json({ message: "Server Fehler" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Token ungültig oder abgelaufen." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ message: "Passwort erfolgreich geändert." });

    } catch (error) {
        res.status(500).json({ message: "Server Fehler" });
    }
};