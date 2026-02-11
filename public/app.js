const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const dashboardContainer = document.querySelector(".dashboard-container");

if (window.location.pathname.includes("dashboard.html")) {

    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");

    if (oauthToken) {
        localStorage.setItem("token", oauthToken);
        window.history.replaceState({}, document.title, "/dashboard.html");
    }
}

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        message.textContent = data.message || "Registrierung abgeschlossen";
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const rememberMe = document.getElementById("rememberMe")?.checked;

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password, rememberMe })
        });

        const data = await res.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            window.location.href = "dashboard.html";
        } else {
            message.textContent = data.message;
        }
    });
}

if (dashboardContainer) {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
    }

    const ticketList = document.getElementById("ticketList");
    const createTicketBtn = document.getElementById("createTicket");
    const logoutBtn = document.getElementById("logoutBtn");

    const loadTickets = async () => {
        const res = await fetch("/api/tickets/my", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const tickets = await res.json();

        ticketList.innerHTML = "";

        tickets.forEach(ticket => {
            const div = document.createElement("div");
            div.className = "ticket-card";
            div.innerHTML = `
                <h3>${ticket.subject}</h3>
                <p>Status: ${ticket.status}</p>
                <p>Antworten: ${ticket.replies.length}</p>
            `;
            ticketList.appendChild(div);
        });
    };

    createTicketBtn.addEventListener("click", async () => {
        const subject = document.getElementById("subject").value;
        const message = document.getElementById("ticketMessage").value;

        await fetch("/api/tickets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ subject, message })
        });

        loadTickets();
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    });

    loadTickets();
}

const forgotForm = document.getElementById("forgotForm");

if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const message = document.getElementById("message");

        const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        window.location.href = "email-sent.html";
    });
}

const resetForm = document.getElementById("resetForm");

if (resetForm) {
    resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const password = document.getElementById("password").value;
        const message = document.getElementById("message");

        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        const res = await fetch(`/api/auth/reset-password/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });

        const data = await res.json();
        window.location.href = "reset-success.html";
    });
}