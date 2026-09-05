import { bmKeyState } from "../bmApi.js";

//Shown in place of the panels when the battlemetrics key is missing or rejected
export function displayBmKeyNotice(sidebar) {
    markSettingsButton();
    if (!sidebar) return;

    const invalid = bmKeyState.status === "invalid";

    const element = document.createElement("div");
    element.classList.add("bme-key-notice");

    const title = document.createElement("h3");
    title.innerText = invalid ? "Your BattleMetrics key was rejected" : "No BattleMetrics key set";
    element.appendChild(title);

    const text = document.createElement("p");
    text.innerText = invalid ?
        "BattleMetrics answered with a 401. Open the settings with the cogwheel and update your key." :
        "Open the settings with the cogwheel and add your key, then refresh the page.";
    element.appendChild(text);

    sidebar.left.children[0].appendChild(element);
    return element;
}

export function markSettingsButton() {
    const button = document.getElementById("bme-settings-button");
    if (!button) return;

    const alert = bmKeyState.status !== "ok";
    button.classList.toggle("bme-settings-button-alert", alert);
    button.title = alert ? "Your BattleMetrics key needs attention" : "";
}

//A key can be rejected long after the page was built
window.addEventListener("BME_BM_KEY_STATE", markSettingsButton);
