const API_URL =
    "https://nameless-waterfall-e777.zainking3214536.workers.dev";

async function sendCommand(account, command) {
    try {
        const response = await fetch(API_URL + "/command", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                account: account,
                command: command
            })
        });

        const data = await response.json();

        console.log("ZK Traders API:", data);

        if (!response.ok || !data.ok) {
            alert("API Error");
            return;
        }

        updateStatus(account, command);

    } catch (error) {
        console.error("API connection error:", error);
        alert("API connection failed");
    }
}


function updateStatus(account, status) {

    const statusElement =
        document.getElementById(account + "-status");

    if (!statusElement) {
        return;
    }

    statusElement.textContent = status;

    if (status === "RUNNING") {
        statusElement.style.color = "#4ade80";
    }

    else if (status === "PAUSED") {
        statusElement.style.color = "#fbbf24";
    }

    else {
        statusElement.style.color = "#f87171";
    }
}


function setBotStatus(account, status) {

    let command = status;

    if (status === "STOPPED") {
        command = "STOP";
    }

    sendCommand(account, command);
}


function toggleControl(account, control, enabled) {

    console.log(
        account +
        " | " +
        control +
        " | " +
        (enabled ? "ON" : "OFF")
    );
}


function saveSettings(account) {

    const settings = {

        risk:
            document.getElementById(account + "-risk")?.value || 1,

        dailyTarget:
            document.getElementById(account + "-target")?.value || 1,

        dailyLoss:
            document.getElementById(account + "-loss")?.value || 1
    };


    localStorage.setItem(
        "ZK_Traders_" + account,
        JSON.stringify(settings)
    );


    alert(account + " settings saved.");
}
