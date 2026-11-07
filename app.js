const API_URL = "https://nameless-waterfall-e777.zainking3214536.workers.dev";

// ============================================================
// AUTH / ROLE HELPERS
// ============================================================

function getToken() {
    return localStorage.getItem("ZK_customer_token") || "";
}

function getUserRole() {
    return (
        localStorage.getItem("ZK_customer_role") || ""
    ).toLowerCase();
}

function isAdmin() {
    return getUserRole() === "admin";
}

function requireAdmin() {
    if (!isAdmin()) {
        alert("Admin access required.");
        return false;
    }
    if (!getToken()) {
        alert("Please login first.");
        return false;
    }
    return true;
}

// ============================================================
// SAFE TEXT HELPER
// ============================================================

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value ?? "-";
    }
}

// ============================================================
// API COMMAND
// ============================================================

async function sendCommand(account, command) {
    if (!requireAdmin()) return false;

    const allowedAccounts = ["premium", "second"];
    const allowedCommands = [
        "START",
        "PAUSE",
        "STOP",
        "EMERGENCY_STOP",
        "RUNNING"
    ];

    if (!allowedAccounts.includes(account)) {
        alert("Invalid account.");
        return false;
    }

    if (!allowedCommands.includes(command)) {
        alert("Invalid bot command.");
        return false;
    }

    const token = getToken();

    try {
        const response = await fetch(API_URL + "/command", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                account: account,
                command: command
            })
        });

        let data = {};
        try {
            data = await response.json();
        } catch (error) {
            data = {};
        }

        console.log("ZK Traders API:", data);

        if (!response.ok || data.ok === false) {
            alert("API Error: " + (data.error || "Request failed"));
            return false;
        }

        updateStatus(account, command);
        addActivity(account, command);
        return true;

    } catch (error) {
        console.error("ZK Traders API Error:", error);
        alert("API connection failed.");
        return false;
    }
}

// ============================================================
// BOT STATUS
// ============================================================

function updateStatus(account, status) {
    let normalizedStatus = String(status || "").toUpperCase();

    if (normalizedStatus === "START") normalizedStatus = "RUNNING";
    if (normalizedStatus === "PAUSE") normalizedStatus = "PAUSED";
    if (normalizedStatus === "STOP") normalizedStatus = "STOPPED";
    if (normalizedStatus === "EMERGENCY_STOP") {
        normalizedStatus = "EMERGENCY STOP";
    }

    const statusId =
        account === "premium" ? "premium-status" : "second-status";

    const statusElement = document.getElementById(statusId);

    if (statusElement) {
        statusElement.textContent = normalizedStatus;
        statusElement.className =
            "status " + normalizedStatus.toLowerCase().replace(/\s+/g, "-");
    }

    console.log("Bot Status:", account, normalizedStatus);
}

// ============================================================
// SET BOT STATUS
// ============================================================

async function setBotStatus(account, status) {
    if (!requireAdmin()) return;

    const requested = String(status || "").toUpperCase();

    if (requested === "EMERGENCY_STOP") {
        await emergencyStop(account);
        return;
    }

    const commandMap = {
        "RUNNING": "START",
        "START": "START",
        "PAUSED": "PAUSE",
        "PAUSE": "PAUSE",
        "STOPPED": "STOP",
        "STOP": "STOP"
    };

    const command = commandMap[requested];

    if (!command) {
        alert("Invalid bot command.");
        return;
    }

    await sendCommand(account, command);
}

// ============================================================
// EMERGENCY STOP
// ============================================================

async function emergencyStop(account) {
    if (!requireAdmin()) return;

    const confirmed = confirm(
        "Are you sure you want to EMERGENCY STOP this account?"
    );

    if (!confirmed) return;

    await sendCommand(account, "EMERGENCY_STOP");
}

// ============================================================
// ACTIVITY LOG
// ============================================================

function addActivity(account, command) {
    const activityList = document.getElementById("activity-list");
    if (!activityList) return;

    const item = document.createElement("div");
    item.className = "activity-item";

    const accountText = document.createElement("strong");
    accountText.textContent = account;

    const commandText = document.createElement("span");
    commandText.textContent = command;

    item.appendChild(accountText);
    item.appendChild(commandText);
    activityList.prepend(item);
} 
// ============================================================
// CONTROL TOGGLE
// ============================================================

function toggleControl(account, setting, enabled) {
    if (!requireAdmin()) {
        return;
    }

    console.log("Control changed:", {
        account: account,
        setting: setting,
        enabled: Boolean(enabled)
    });

    // Frontend state only.
    // Database/Worker integration baad mein hogi.
}

// ============================================================
// ACCOUNT SETTINGS
// ============================================================

async function loadSettings(account) {
    console.log("Loading settings:", account);
    return true;
}

// ============================================================
// ROLE ACCESS
// ============================================================

function applyRoleAccess() {
    const admin = isAdmin();

    document.querySelectorAll(
        ".admin-only, [data-admin-only='true']"
    ).forEach(function (element) {
        element.classList.toggle(
            "admin-access-hidden",
            !admin
        );
    });

    document.querySelectorAll(".customer-only").forEach(
        function (element) {
            element.classList.toggle(
                "customer-access-hidden",
                admin
            );
        }
    );

    console.log("Role Access:", admin ? "ADMIN" : "CUSTOMER");
}

// ============================================================
// SUBSCRIBER COUNT
// ============================================================

async function loadSubscriberCount() {
    if (!isAdmin()) {
        console.log("Subscriber count: Admin access required. Skipping API.");
        return;
    }

    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(API_URL + "/subscribers/count", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();
        console.log("Subscriber Count:", data);

        if (!response.ok || data.ok === false) {
            console.warn("Subscriber count error:", data.error);
            return;
        }

        const count = data.count ?? data.subscribers ?? 0;

        document.querySelectorAll(".subscriber-count").forEach(
            function (element) {
                element.textContent = count;
            }
        );

    } catch (error) {
        console.error("Subscriber count error:", error);
    }
}

// ============================================================
// CUSTOMERS
// ============================================================

async function loadCustomers() {
    if (!isAdmin()) {
        console.log("Customers: Admin access required. Skipping customer API.");
        return;
    }

    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(API_URL + "/customers", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();
        console.log("Customers:", data);

        if (!response.ok || data.ok === false) {
            console.warn("Customers API error:", data.error);
            return;
        }

        const customers = Array.isArray(data)
            ? data
            : (data.customers || data.data || []);

        renderCustomers(customers);

    } catch (error) {
        console.error("Customers error:", error);
    }
}

// ============================================================
// RENDER CUSTOMERS SAFELY
// ============================================================

function renderCustomers(customers) {
    const tableBody = document.querySelector("#customers-list");

    if (!tableBody) {
        console.error("Customers table body not found.");
        return;
    }

    tableBody.replaceChildren();

    if (!Array.isArray(customers) || customers.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 6;
        cell.textContent = "No customers found.";
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    customers.forEach(function (customer) {
        const row = document.createElement("tr");

        const values = [
            customer.customer_id || customer.id || "-",
            customer.email || "-",
            customer.role || "customer",
            customer.created_at || customer.created || "-",
            customer.status || "Active"
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = String(value);
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const viewButton = document.createElement("button");

        viewButton.type = "button";
        viewButton.textContent = "View";
        viewButton.addEventListener("click", function () {
            viewCustomer(customer);
        });

        actionCell.appendChild(viewButton);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });

    console.log("Customers rendered:", customers.length);
}

// ============================================================
// VIEW CUSTOMER
// ============================================================

function viewCustomer(customer) {
    if (!requireAdmin() || !customer) return;

    setText(
        "detail-customer-id",
        customer.customer_id || customer.id || "-"
    );
    setText(
        "detail-email",
        customer.email || "-"
    );
    setText(
        "detail-role",
        customer.role || "customer"
    );
    setText(
        "detail-status",
        customer.status || "Active"
    );
    setText(
        "detail-created",
        customer.created_at || customer.created || "-"
    );

    const panel = document.getElementById("customer-details-panel");
    if (panel) panel.style.display = "block";

    console.log("Customer Details:", customer);
}

// ============================================================
// CLOSE CUSTOMER DETAILS
// ============================================================

function closeCustomerDetails() {
    const panel = document.getElementById("customer-details-panel");
    if (panel) panel.style.display = "none";
}
// ============================================================
// CUSTOMER LOGIN
// ============================================================

async function customerLogin() {
    const emailElement = document.getElementById("customer-email");
    const passwordElement = document.getElementById("customer-password");

    if (!emailElement || !passwordElement) {
        alert("Login fields not found.");
        return;
    }

    const email = emailElement.value.trim();
    const password = passwordElement.value;

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    try {
        const response = await fetch(API_URL + "/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log("ZK Login:", data);

        if (!response.ok || data.ok === false) {
            alert("Login failed: " + (data.error || "Invalid email or password"));
            return;
        }

        if (!data.token) {
            alert("Login successful but no token was returned.");
            return;
        }

        localStorage.setItem("ZK_customer_token", data.token);
        localStorage.setItem(
            "ZK_customer_id",
            data.customer_id || data.id || ""
        );
        localStorage.setItem(
            "ZK_customer_role",
            String(data.role || "customer").toLowerCase()
        );

        applyRoleAccess();

        alert("Login successful.");

        await loadSubscriberCount();
        await loadCustomers();

    } catch (error) {
        console.error("ZK Login Error:", error);
        alert("Login connection failed.");
    }
}

// ============================================================
// CUSTOMER REGISTER
// ============================================================

async function customerRegister() {
    const emailElement = document.getElementById("customer-email");
    const passwordElement = document.getElementById("customer-password");

    if (!emailElement || !passwordElement) {
        alert("Registration fields not found.");
        return;
    }

    const email = emailElement.value.trim();
    const password = passwordElement.value;

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    try {
        const response = await fetch(API_URL + "/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log("ZK Register:", data);

        if (!response.ok || data.ok === false) {
            alert("Registration failed: " + (data.error || "Unable to create account"));
            return;
        }

        alert("Account created successfully. Please login.");

    } catch (error) {
        console.error("ZK Register Error:", error);
        alert("Registration connection failed.");
    }
}

// ============================================================
// SUBSCRIPTIONS
// ============================================================

function subscribePremium() {
    window.location.href = "payment.html";
}

async function subscribeDemo() {
    if (!getToken()) {
        alert("Please login first.");
        return;
    }

    alert("Demo account subscription request submitted.");
}

// ============================================================
// DOM READY
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
    applyRoleAccess();

    loadSettings("premium");
    loadSettings("second");

    loadSubscriberCount();
    loadCustomers();

    console.log("ZK Traders Bot Dashboard loaded.");
});

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.setBotStatus = setBotStatus;
window.emergencyStop = emergencyStop;
window.customerLogin = customerLogin;
window.customerRegister = customerRegister;
window.subscribePremium = subscribePremium;
window.subscribeDemo = subscribeDemo;
window.toggleControl = toggleControl;
window.renderCustomers = renderCustomers;
window.viewCustomer = viewCustomer;
window.closeCustomerDetails = closeCustomerDetails;
window.loadCustomers = loadCustomers;
window.loadSubscriberCount = loadSubscriberCount;
window.loadSettings = loadSettings;
window.sendCommand = sendCommand;
window.updateStatus = updateStatus;
window.applyRoleAccess = applyRoleAccess;
window.requireAdmin = requireAdmin;
window.isAdmin = isAdmin;
