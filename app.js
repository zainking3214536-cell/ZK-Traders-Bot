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

    return true;
}


// ============================================================
// API COMMAND
// ============================================================

async function sendCommand(account, command) {

    if (!isAdmin()) {
        alert("Admin access required.");
        return false;
    }

    const token = getToken();

    if (!token) {
        alert("Please login first.");
        return false;
    }

    try {

        const response = await fetch(
            API_URL + "/command",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },

                body: JSON.stringify({
                    account: account,
                    command: command
                })
            }
        );

        let data = {};

        try {
            data = await response.json();
        } catch (error) {
            data = {};
        }

        console.log("ZK Traders API:", data);

        if (!response.ok || data.ok === false) {

            alert(
                "API Error: " +
                (data.error || "Request failed")
            );

            return false;
        }

        updateStatus(account, command);
        addActivity(
            account,
            command
        );

        return true;

    } catch (error) {

        console.error(
            "ZK Traders API Error:",
            error
        );

        alert(
            "API connection failed."
        );

        return false;
    }
}


// ============================================================
// BOT STATUS
// ============================================================

function updateStatus(account, status) {

    let normalizedStatus =
        String(status || "").toUpperCase();

    if (
        normalizedStatus === "START"
    ) {
        normalizedStatus = "RUNNING";
    }

    if (
        normalizedStatus === "PAUSE"
    ) {
        normalizedStatus = "PAUSED";
    }

    if (
        normalizedStatus === "STOP"
    ) {
        normalizedStatus = "STOPPED";
    }

    const statusId =
        account === "premium"
            ? "premium-status"
            : "second-status";

    const statusElement =
        document.getElementById(statusId);

    if (statusElement) {

        statusElement.textContent =
            normalizedStatus;

        statusElement.className =
            "status " +
            normalizedStatus.toLowerCase();
    }

    console.log(
        "Bot Status:",
        account,
        normalizedStatus
    );
}


// ============================================================
// SET BOT STATUS
// ============================================================

async function setBotStatus(
    account,
    status
) {

    if (!requireAdmin()) {
        return;
    }

    let command =
        String(status || "").toUpperCase();

    if (command === "RUNNING") {
        command = "START";
    }

    if (command === "PAUSED") {
        command = "PAUSE";
    }

    if (command === "STOPPED") {
        command = "STOP";
    }

    if (
        command !== "START" &&
        command !== "PAUSE" &&
        command !== "STOP"
    ) {
        alert("Invalid bot command.");
        return;
    }

    await sendCommand(
        account,
        command
    );
}


// ============================================================
// EMERGENCY STOP
// ============================================================

async function emergencyStop(account) {

    if (!requireAdmin()) {
        return;
    }

    const confirmed =
        confirm(
            "Are you sure you want to EMERGENCY STOP this account?"
        );

    if (!confirmed) {
        return;
    }

    await sendCommand(
        account,
        "EMERGENCY_STOP"
    );
}


// ============================================================
// ACTIVITY LOG
// ============================================================

function addActivity(
    account,
    command
) {

    const activityList =
        document.getElementById(
            "activity-list"
        );

    if (!activityList) {
        return;
    }

    const item =
        document.createElement("div");

    item.className =
        "activity-item";

    item.innerHTML = `
        <strong>${account}</strong>
        <span>${command}</span>
    `;

    activityList.prepend(item);
}


// ============================================================
// CONTROL TOGGLE
// ============================================================

function toggleControl(
    element
) {

    if (!element) {
        return;
    }

    if (!isAdmin()) {
        alert("Admin access required.");
        return;
    }

    element.classList.toggle(
        "active"
    );
}


// ============================================================
// ACCOUNT SETTINGS PLACEHOLDER
// ============================================================

async function loadSettings(account) {

    console.log(
        "Loading settings:",
        account
    );

    return true;
}
// ============================================================
// ROLE ACCESS
// ============================================================

function applyRoleAccess() {

    const admin = isAdmin();

    document
        .querySelectorAll(".admin-only")
        .forEach(function (element) {

            if (admin) {
                element.classList.remove(
                    "admin-access-hidden"
                );
            } else {
                element.classList.add(
                    "admin-access-hidden"
                );
            }
        });


    document
        .querySelectorAll(
            "[data-admin-only='true']"
        )
        .forEach(function (element) {

            if (admin) {
                element.classList.remove(
                    "admin-access-hidden"
                );
            } else {
                element.classList.add(
                    "admin-access-hidden"
                );
            }
        });


    console.log(
        "Role Access:",
        admin ? "ADMIN" : "CUSTOMER"
    );
}


// ============================================================
// SUBSCRIBER COUNT
// ============================================================

async function loadSubscriberCount() {

    if (!isAdmin()) {

        console.log(
            "Subscriber count: Admin access required. Skipping API."
        );

        return;
    }

    const token = getToken();

    if (!token) {
        return;
    }

    try {

        const response =
            await fetch(
                API_URL +
                "/subscribers/count",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const data =
            await response.json();

        console.log(
            "Subscriber Count:",
            data
        );

        if (
            !response.ok ||
            data.ok === false
        ) {
            console.warn(
                "Subscriber count error:",
                data.error
            );

            return;
        }

        const count =
            data.count ??
            data.subscribers ??
            0;

        const elements =
            document.querySelectorAll(
                ".subscriber-count"
            );

        elements.forEach(
            function (element) {
                element.textContent =
                    count;
            }
        );

    } catch (error) {

        console.error(
            "Subscriber count error:",
            error
        );
    }
}


// ============================================================
// CUSTOMERS
// ============================================================

async function loadCustomers() {

    if (!isAdmin()) {

        console.log(
            "Customers: Admin access required. Skipping customer API."
        );

        return;
    }

    const token = getToken();

    if (!token) {
        return;
    }

    try {

        const response =
            await fetch(
                API_URL + "/customers",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const data =
            await response.json();

        console.log(
            "Customers:",
            data
        );

        if (
            !response.ok ||
            data.ok === false
        ) {

            console.warn(
                "Customers API error:",
                data.error
            );

            return;
        }

        const customers =
            Array.isArray(data)
                ? data
                : (
                    data.customers ||
                    data.data ||
                    []
                );

        renderCustomers(
            customers
        );

    } catch (error) {

        console.error(
            "Customers error:",
            error
        );
    }
}


// ============================================================
// RENDER CUSTOMERS
// ============================================================

function renderCustomers(
    customers
) {

    const tableBody =
        document.querySelector(
            "#customers-table tbody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    if (
        !customers ||
        customers.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No customers found.
                </td>
            </tr>
        `;

        return;
    }

    customers.forEach(
        function (customer) {

            const row =
                document.createElement("tr");

            const customerId =
                customer.customer_id ||
                customer.id ||
                "-";

            const email =
                customer.email ||
                "-";

            const role =
                customer.role ||
                "customer";

            const created =
                customer.created_at ||
                customer.created ||
                "-";

            const status =
                customer.status ||
                "Active";

            row.innerHTML = `
                <td>${customerId}</td>
                <td>${email}</td>
                <td>${role}</td>
                <td>${created}</td>
                <td>${status}</td>
                <td>
                    <button
                        type="button"
                        onclick='viewCustomer(${JSON.stringify(customer)})'
                    >
                        View
                    </button>
                </td>
            `;

            tableBody.appendChild(
                row
            );
        }
    );
}


// ============================================================
// VIEW CUSTOMER
// ============================================================

function viewCustomer(
    customer
) {

    if (!requireAdmin()) {
        return;
    }

    if (!customer) {
        return;
    }

    console.log(
        "Customer Details:",
        customer
    );

    const customerId =
        document.getElementById(
            "detail-customer-id"
        );

    const customerEmail =
        document.getElementById(
            "detail-customer-email"
        );

    const customerRole =
        document.getElementById(
            "detail-customer-role"
        );

    if (customerId) {
        customerId.textContent =
            customer.customer_id ||
            customer.id ||
            "-";
    }

    if (customerEmail) {
        customerEmail.textContent =
            customer.email ||
            "-";
    }

    if (customerRole) {
        customerRole.textContent =
            customer.role ||
            "customer";
    }
}


// ============================================================
// LOGIN
// ============================================================

async function customerLogin() {

    const emailElement =
        document.getElementById(
            "customer-email"
        );

    const passwordElement =
        document.getElementById(
            "customer-password"
        );

    if (
        !emailElement ||
        !passwordElement
    ) {

        alert(
            "Login fields not found."
        );

        return;
    }

    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value;

    if (!email || !password) {

        alert(
            "Please enter email and password."
        );

        return;
    }

    try {

        const response =
            await fetch(
                API_URL +
                "/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

        const data =
            await response.json();

        console.log(
            "ZK Login:",
            data
        );

        if (
            !response.ok ||
            data.ok === false
        ) {

            alert(
                "Login failed: " +
                (
                    data.error ||
                    "Invalid email or password"
                )
            );

            return;
        }

        if (!data.token) {

            alert(
                "Login successful but no token was returned."
            );

            return;
        }

        localStorage.setItem(
            "ZK_customer_token",
            data.token
        );

        localStorage.setItem(
            "ZK_customer_id",
            data.customer_id ||
            data.id ||
            ""
        );

        localStorage.setItem(
            "ZK_customer_role",
            data.role ||
            "customer"
        );

        applyRoleAccess();

        alert(
            "Login successful."
        );

        await loadSubscriberCount();
        await loadCustomers();

    } catch (error) {

        console.error(
            "ZK Login Error:",
            error
        );

        alert(
            "Login connection failed."
        );
    }
}


// ============================================================
// REGISTER
// ============================================================

async function customerRegister() {

    const emailElement =
        document.getElementById(
            "customer-email"
        );

    const passwordElement =
        document.getElementById(
            "customer-password"
        );

    if (
        !emailElement ||
        !passwordElement
    ) {

        alert(
            "Registration fields not found."
        );

        return;
    }

    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value;

    if (!email || !password) {

        alert(
            "Please enter email and password."
        );

        return;
    }

    try {

        const response =
            await fetch(
                API_URL +
                "/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

        const data =
            await response.json();

        console.log(
            "ZK Register:",
            data
        );

        if (
            !response.ok ||
            data.ok === false
        ) {

            alert(
                "Registration failed: " +
                (
                    data.error ||
                    "Unable to create account"
                )
            );

            return;
        }

        alert(
            "Account created successfully. Please login."
        );

    } catch (error) {

        console.error(
            "ZK Register Error:",
            error
        );

        alert(
            "Registration connection failed."
        );
    }
}
// ============================================================
// SUBSCRIPTION
// ============================================================

async function subscribePremium() {

    if (!getToken()) {
        alert("Please login first.");
        return;
    }

    alert(
        "Premium subscription request submitted."
    );
}


async function subscribeDemo() {

    if (!getToken()) {
        alert("Please login first.");
        return;
    }

    alert(
        "Demo account subscription request submitted."
    );
}


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        applyRoleAccess();

        loadSettings("premium");
        loadSettings("second");

        loadSubscriberCount();
        loadCustomers();

        console.log(
            "ZK Traders Bot Dashboard loaded."
        );
    }
);


// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.setBotStatus =
    setBotStatus;

window.emergencyStop =
    emergencyStop;

window.customerLogin =
    customerLogin;

window.customerRegister =
    customerRegister;

window.subscribePremium =
    subscribePremium;

window.subscribeDemo =
    subscribeDemo;

window.toggleControl =
    toggleControl;

window.renderCustomers =
    renderCustomers;

window.viewCustomer =
    viewCustomer;

window.loadCustomers =
    loadCustomers;

window.loadSubscriberCount =
    loadSubscriberCount;

window.loadSettings =
    loadSettings;

window.sendCommand =
    sendCommand;

window.updateStatus =
    updateStatus;

window.applyRoleAccess =
    applyRoleAccess;

window.requireAdmin =
    requireAdmin;

window.isAdmin =
    isAdmin;
