const API_URL =
    "https://nameless-waterfall-e777.zainking3214536.workers.dev";


async function sendCommand(account, command) {

    try {

        const token =
            localStorage.getItem("ZK_customer_token");

        if (!token) {
            alert("Please login first.");
            return false;
        }

        const response = await fetch(
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

        const data = await response.json();

        console.log(
            "ZK Traders API:",
            data
        );

        if (!response.ok || !data.ok) {

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
        JSON.stringify(settings)
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
async function loadSubscriberCount() {

    try {

        const token =
            localStorage.getItem("ZK_customer_token");

        if (!token) {
            console.log("Admin login required for subscriber count.");
            return;
        }

        const response =
            await fetch(
                API_URL + "/subscribers/count",
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
            function (element) {
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
    alert(
        "Demo Account Test\n\n" +
        "Demo subscription / testing page will open next."
    );
}


async function customerLogin() {

    const email =
        document.getElementById(
            "customer-email"
        ).value.trim();

    const password =
        document.getElementById(
            "customer-password"
        ).value;

    if (!email || !password) {

        alert(
            "Email aur password enter karein."
        );

        return;
    }

    try {

        const response =
            await fetch(
                API_URL + "/auth/login",
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


async function customerRegister() {

    const email =
        document.getElementById(
            "customer-email"
        ).value.trim();

    const password =
        document.getElementById(
            "customer-password"
        ).value;

    if (!email || !password) {

        alert(
            "Email aur password enter karein."
        );

        return;
    }

    try {

        const response =
            await fetch(
                API_URL + "/auth/register",
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


document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadSettings(
            "premium"
        );

        loadSettings(
            "second"
        );

        console.log(
            "ZK Traders Bot Dashboard loaded."
        );
    }
);


window.setBotStatus =
    setBotStatus;

window.emergencyStop =
    emergencyStop;

window.customerLogin =
    customerLogin;

window.customerRegister =
    customerRegister;
