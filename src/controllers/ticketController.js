const Ticket = require("../models/Ticket");

exports.createTicket = async (req, res) => {
    try {
        const { subject, message } = req.body;

        const ticket = new Ticket({
            user: req.user.id,
            subject,
            replies: [
                {
                    author: req.user.id,
                    message
                }
            ]
        });

        await ticket.save();

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: "Server Fehler" });
    }
};

exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user.id })
            .populate("user", "email")
            .populate("replies.author", "email")
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Server Fehler" });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate("user", "email")
            .populate("replies.author", "email")
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Server Fehler" });
    }
};

exports.addReply = async (req, res) => {
    try {
        const { message } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket nicht gefunden" });
        }

        ticket.replies.push({
            author: req.user.id,
            message
        });

        await ticket.save();

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: "Server Fehler" });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket nicht gefunden" });
        }

        ticket.status = status;
        await ticket.save();

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: "Server Fehler" });
    }
};