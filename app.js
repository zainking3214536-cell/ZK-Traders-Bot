function setBotStatus(account, status) {
    const statusElement = document.getElementById(account + "-status");

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

    console.log(account + " bot status:", status);
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
        risk: document.getElementById(account + "-risk")?.value || 1,
        dailyTarget: document.getElementById(account + "-target")?.value || 1,
        dailyLoss: document.getElementById(account + "-loss")?.value || 1
    };

    localStorage.setItem(
        "ZK_Traders_" + account,
        JSON.stringify(settings)
    );

    alert(account + " settings saved.");
}
