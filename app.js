const API_URL =
    "https://nameless-waterfall-e777.zainking3214536.workers.dev";


// ======================================================
// ZK TRADERS BOT - COMMAND CONTROL
// ======================================================

async function sendCommand(account, command) {
  if (!isLoggedIn()) {
        alert("Please login first.");
        return false;
    }

    if (!isAdmin()) {
        alert("Admin access required.");
        return false;
          }
    try {

        const token =
            localStorage.getItem("ZK_customer_token");

        if (!token) {
            alert("Please login first.");
            return false;
        }

        const response =
            await fetch(
                API_URL + "/command",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({
                        account: account,
                        command: command
                    })
                }
            );

        const data =
            await response.json();

        console.log(
            "ZK Traders API:",
            data
        );

        if (
            !response.ok ||
            !data.ok
        ) {

            alert(
                "API Error: " +
                (data.error || "Unknown error")
            );

            return false;
        }

        updateStatus(
            account,
            command
        );

        addActivity(
            account,
            command
        );

        return true;

    } catch (error) {

        console.error(
            "API connection error:",
            error
        );

        alert(
            "API connection failed"
        );

        return false;
    }
}


function updateStatus(
    account,
    status
) {

    const statusElement =
        document.getElementById(
            account + "-status"
        );

    if (!statusElement) {
        return;
    }

    statusElement.textContent =
        status;

    if (status === "RUNNING") {

        statusElement.style.color =
            "#4ade80";

    } else if (
        status === "PAUSED"
    ) {

        statusElement.style.color =
            "#fbbf24";

    } else {

        statusElement.style.color =
            "#f87171";
    }
}


function setBotStatus(
    account,
    status
) {

    let command = status;

    if (status === "PAUSED") {
        command = "PAUSE";
    }

    if (status === "STOPPED") {
        command = "STOP";
    }

    if (status === "RUNNING") {
        command = "RUNNING";
    }

    sendCommand(
        account,
        command
    );
}


function emergencyStop(
    account
) {

    if (
        !confirm(
            "Emergency Stop " +
            account +
            " bot?"
        )
    ) {
        return;
    }

    sendCommand(
        account,
        "EMERGENCY_STOP"
    );
}


// ======================================================
// BOT CONTROL SETTINGS
// ======================================================

function toggleControl(
    account,
    control,
    enabled
) {

    console.log(
        account +
        " | " +
        control +
        " | " +
        (
            enabled
                ? "ON"
                : "OFF"
        )
    );

    localStorage.setItem(
        "ZK_Control_" +
        account +
        "_" +
        control,

        enabled
            ? "ON"
            : "OFF"
    );
}


// ======================================================
// ACCOUNT SETTINGS
// ======================================================

function saveSettings(
    account
) {

    const settings = {

        risk:
            document.getElementById(
                account + "-risk"
            )?.value || 1,

        dailyTarget:
            document.getElementById(
                account + "-target"
            )?.value || 1,

        dailyLoss:
            document.getElementById(
                account + "-loss"
            )?.value || 1
    };

    localStorage.setItem(
        "ZK_Traders_" + account,

        JSON.stringify(
            settings
        )
    );

    alert(
        account +
        " settings saved.\n\n" +

        "Risk: " +
        settings.risk +
        "%\n" +

        "Daily Target: " +
        settings.dailyTarget +
        "%\n" +

        "Daily Loss: " +
        settings.dailyLoss +
        "%"
    );
}


function loadSettings(
    account
) {

    const saved =
        localStorage.getItem(
            "ZK_Traders_" + account
        );

    if (!saved) {
        return;
    }

    try {

        const settings =
            JSON.parse(saved);

        const risk =
            document.getElementById(
                account + "-risk"
            );

        const target =
            document.getElementById(
                account + "-target"
            );

        const loss =
            document.getElementById(
                account + "-loss"
            );

        if (
            risk &&
            settings.risk !== undefined
        ) {
            risk.value =
                settings.risk;
        }

        if (
            target &&
            settings.dailyTarget !== undefined
        ) {
            target.value =
                settings.dailyTarget;
        }

        if (
            loss &&
            settings.dailyLoss !== undefined
        ) {
            loss.value =
                settings.dailyLoss;
        }

    } catch (error) {

        console.error(
            "Settings load error:",
            error
        );
    }
}


// ======================================================
// ACTIVITY
// ======================================================

function addActivity(
    account,
    command
) {

    console.log(
        "Activity:",
        account,
        command,
        new Date().toLocaleString()
    );
}


// ======================================================
// SUBSCRIPTIONS
// ======================================================

function subscribePremium() {

    alert(
        "Premium Subscription\n\n" +
        "Price: Rs 5,000\n" +
        "Duration: 30 Days\n" +
        "Payment Method: JazzCash\n\n" +
        "Payment page will open next."
    );
}


function subscribeDemo() {

    alert(
        "Demo Account Test\n\n" +
        "Demo subscription / testing page will open next."
    );
}


// ======================================================
// SUBSCRIBER COUNT
// ======================================================

async function loadSubscriberCount() {

    try {

        const token =
            localStorage.getItem(
                "ZK_customer_token"
            );

        if (!token) {

            console.log(
                "Admin login required for subscriber count."
            );

            return;
        }

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
            !data.ok
        ) {

            console.error(
                "Subscriber count error:",
                data.error
            );

            return;
        }

        const elements =
            document.querySelectorAll(
                ".subscriber-count"
            );

        elements.forEach(
            function(element) {

                element.textContent =
                    data.total;
            }
        );

    } catch (error) {

        console.error(
            "Subscriber count connection error:",
            error
        );
    }
}


// ======================================================
// CUSTOMERS TABLE
// ======================================================

function findCustomersTableBody() {

    return (
        document.getElementById(
            "customers-table-body"
        ) ||

        document.getElementById(
            "customersTableBody"
        ) ||

        document.getElementById(
            "customers-list"
        ) ||

        document.querySelector(
            "#customers-table tbody"
        ) ||

        document.querySelector(
            "#customersTable tbody"
        ) ||

        document.querySelector(
            ".customers-table tbody"
        )
    );
}


function setCustomersMessage(
    message
) {

    const body =
        findCustomersTableBody();

    if (!body) {

        console.warn(
            "Customers table body not found."
        );

        return;
    }

    body.innerHTML = "";

    const row =
        document.createElement("tr");

    const cell =
        document.createElement("td");

    cell.colSpan = 8;

    cell.textContent =
        message;

    cell.style.textAlign =
        "center";

    cell.style.padding =
        "20px";

    row.appendChild(cell);

    body.appendChild(row);
}


function renderCustomers(customers) {

    const body =
        findCustomersTableBody();

    if (!body) {
        console.warn(
            "Customers table body not found."
        );
        return;
    }

    body.innerHTML = "";

    const list =
        Array.isArray(customers)
            ? customers
            : [];

    if (!list.length) {

        const row =
            document.createElement("tr");

        const cell =
            document.createElement("td");

        cell.colSpan = 6;

        cell.textContent =
            "No customers found.";

        cell.style.textAlign =
            "center";

        cell.style.padding =
            "20px";

        row.appendChild(cell);

        body.appendChild(row);

        return;
    }

    list.forEach(function(customer) {

        const row =
            document.createElement("tr");


        // CUSTOMER ID

        const idCell =
            document.createElement("td");

        idCell.textContent =
            customer.customer_id ??
            customer.id ??
            "-";


        // EMAIL

        const emailCell =
            document.createElement("td");

        emailCell.textContent =
            customer.email ??
            "-";


        // ROLE

        const roleCell =
            document.createElement("td");

        roleCell.textContent =
            customer.role ??
            "customer";


        // CREATED

        const createdCell =
            document.createElement("td");

        const created =
            customer.created_at ??
            customer.created ??
            "-";

        createdCell.textContent =
            created !== "-"
                ? new Date(created).toLocaleString()
                : "-";


        // STATUS

        const statusCell =
            document.createElement("td");

        statusCell.textContent =
            customer.status ??
            customer.subscription_status ??
            "Active";


        // ACTION

        const actionCell =
            document.createElement("td");

        const viewButton =
            document.createElement("button");

        viewButton.textContent =
            "VIEW";

        viewButton.type =
            "button";

        viewButton.style.padding =
            "7px 12px";

        viewButton.style.border =
            "none";

        viewButton.style.borderRadius =
            "6px";

        viewButton.style.cursor =
            "pointer";

        viewButton.style.background =
            "#2563eb";

        viewButton.style.color =
            "#ffffff";

        viewButton.addEventListener(
            "click",
            function() {

                viewCustomer(customer);

            }
        );

        actionCell.appendChild(
            viewButton
        );


        // ADD CELLS

        row.appendChild(idCell);
        row.appendChild(emailCell);
        row.appendChild(roleCell);
        row.appendChild(createdCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        body.appendChild(row);

    });
}
            customers
        );

    } catch (error) {

        console.error(
            "Customers connection error:",
            error
        );

        setCustomersMessage(
            "Customers load failed."
        );
    }
}
// ======================================================
// CUSTOMER LOGIN
// ======================================================

async function customerLogin() {

    const email =
        document.getElementById(
            "customer-email"
        )?.value.trim();

    const password =
        document.getElementById(
            "customer-password"
        )?.value;

    if (!email || !password) {

        alert(
            "Email aur password enter karein."
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
            !data.ok
        ) {

            alert(
                data.error ||
                "Login failed."
            );

            return;
        }

        localStorage.setItem(
            "ZK_customer_token",
            data.token
        );

        localStorage.setItem(
            "ZK_customer_id",
            data.customer_id
        );

        localStorage.setItem(
            "ZK_customer_role",
            data.role
        );

        alert(
            "Login successful!\n\n" +
            "Customer ID: " +
            data.customer_id +
            "\nRole: " +
            data.role
        );

        loadSubscriberCount();
        loadCustomers();

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        alert(
            "Login server se connect nahi ho saka."
        );
    }
}


// ======================================================
// CUSTOMER REGISTER
// ======================================================

async function customerRegister() {

    const email =
        document.getElementById(
            "customer-email"
        )?.value.trim();

    const password =
        document.getElementById(
            "customer-password"
        )?.value;

    if (!email || !password) {

        alert(
            "Email aur password enter karein."
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
            "ZK Registration:",
            data
        );

        if (
            !response.ok ||
            !data.ok
        ) {

            alert(
                data.error ||
                "Registration failed."
            );

            return;
        }

        alert(
            "Account created!\n\n" +
            "Customer ID: " +
            data.customer_id
        );

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        alert(
            "Registration server se connect nahi ho saka."
        );
    }
}


// ======================================================
// LOGOUT
// ======================================================

function customerLogout() {

    localStorage.removeItem(
        "ZK_customer_token"
    );

    localStorage.removeItem(
        "ZK_customer_id"
    );

    localStorage.removeItem(
        "ZK_customer_role"
    );

    alert(
        "Logout successful."
    );

    location.reload();
}


// ======================================================
// CURRENT LOGIN INFORMATION
// ======================================================

function getCurrentCustomer() {

    return {

        token:
            localStorage.getItem(
                "ZK_customer_token"
            ),

        customer_id:
            localStorage.getItem(
                "ZK_customer_id"
            ),

        role:
            localStorage.getItem(
                "ZK_customer_role"
            )
    };
}


function isLoggedIn() {

    return Boolean(
        localStorage.getItem(
            "ZK_customer_token"
        )
    );
}


function isAdmin() {

    const role =
        localStorage.getItem(
            "ZK_customer_role"
        );

    return role === "admin";
}
function applyRoleAccess() {

    const admin = isAdmin();

    const commandButtons = document.querySelectorAll(
        'button[onclick*="sendCommand"],' +
        'button[onclick*="setBotStatus"],' +
        'button[onclick*="emergencyStop"]'
    );

    commandButtons.forEach(function(button) {

        if (admin) {
            button.style.display = "";
        } else {
            button.style.display = "none";
        }

    });

    console.log(
        "ZK Role Access:",
        admin ? "ADMIN" : "CUSTOMER"
    );
}

// ======================================================
// ADMIN ACCESS CHECK
// ======================================================

function requireAdmin() {

    if (!isLoggedIn()) {

        alert(
            "Please login first."
        );

        return false;
    }

    if (!isAdmin()) {

        alert(
            "Admin access required."
        );

        return false;
    }

    return true;
}


// ======================================================
// SUBSCRIPTION DISPLAY
// ======================================================

function showPremiumSubscription() {

    alert(
        "Premium Subscription\n\n" +
        "Price: Rs 5,000\n" +
        "Duration: 30 Days\n" +
        "Payment: JazzCash"
    );
}


function showDemoSubscription() {

    alert(
        "Demo Account Test\n\n" +
        "Demo account testing subscription."
    );
}


// ======================================================
// CUSTOMER DATA FROM LOCAL STORAGE
// ======================================================

function getSavedCustomers() {

    try {

        const saved =
            localStorage.getItem(
                "ZK_customers"
            );

        if (!saved) {
            return [];
        }

        const customers =
            JSON.parse(saved);

        return Array.isArray(customers)
            ? customers
            : [];

    } catch (error) {

        console.error(
            "Saved customers error:",
            error
        );

        return [];
    }
}


// ======================================================
// REFRESH CUSTOMERS
// ======================================================

async function refreshCustomers() {

    await loadCustomers();

}


// ======================================================
// REFRESH DASHBOARD
// ======================================================

async function refreshDashboard() {

    if (!isLoggedIn()) {
        return;
    }

    await loadSubscriberCount();
    await loadCustomers();

}


// ======================================================
// PAGE INITIALIZATION
// ======================================================

function initializeZKDashboard() {
 applyRoleAccess();
    loadSettings(
        "premium"
    );

    loadSettings(
        "second"
    );

    if (isLoggedIn()) {

        loadSubscriberCount();
        loadCustomers();
    }

    console.log(
        "ZK Traders Bot Dashboard loaded."
    );
}
// ======================================================
// DOM READY
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeZKDashboard();

    }
);


// ======================================================
// GLOBAL FUNCTIONS
// ======================================================

window.sendCommand =
    sendCommand;

window.setBotStatus =
    setBotStatus;

window.emergencyStop =
    emergencyStop;

window.toggleControl =
    toggleControl;

window.saveSettings =
    saveSettings;

window.loadSettings =
    loadSettings;

window.subscribePremium =
    subscribePremium;

window.subscribeDemo =
    subscribeDemo;

window.showPremiumSubscription =
    showPremiumSubscription;

window.showDemoSubscription =
    showDemoSubscription;

window.loadSubscriberCount =
    loadSubscriberCount;

window.loadCustomers =
    loadCustomers;

window.renderCustomers =
    renderCustomers;
window.viewCustomer =
    viewCustomer;
window.refreshCustomers =
    refreshCustomers;

window.refreshDashboard =
    refreshDashboard;

window.customerLogin =
    customerLogin;

window.customerRegister =
    customerRegister;

window.customerLogout =
    customerLogout;

window.getCurrentCustomer =
    getCurrentCustomer;

window.isLoggedIn =
    isLoggedIn;

window.isAdmin =
    isAdmin;

window.requireAdmin =
    requireAdmin;


// ======================================================
// DASHBOARD READY
// ======================================================

console.log(
    "ZK Traders Bot Dashboard JavaScript loaded successfully."
);
