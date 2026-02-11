const express = require("express");
const router = express.Router();

const { createTicket, getMyTickets, getAllTickets, addReply, updateStatus } = require("../controllers/ticketController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/", authMiddleware, createTicket);
router.get("/my", authMiddleware, getMyTickets);
router.get("/all", authMiddleware, adminMiddleware, getAllTickets);
router.post("/:id/reply", authMiddleware, addReply);
router.patch("/:id/status", authMiddleware, adminMiddleware, updateStatus);

module.exports = router;