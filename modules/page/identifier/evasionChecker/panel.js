import { getBootstrap } from "../../../misc.js";
import { checkPlayersPressed, loadPlayersPressed } from "./actions.js";
import { outcomeCollection } from "./check.js";

let firstCall = true;
export function getEvasionCheckerPanel(settings) {
    if (firstCall) {
        firstCall = false;
        startObserver();
    }

    _settings = settings;

    const panel = document.createElement("div");
    panel.classList.add("bme-ec-panel")
    panel.id = "bme-ec-panel";

    const header = getHeader();
    const settingsPanel = getEvasionCheckerSettingsPanel();
    const playerContainer = getPlayerContainer();

    panel.append(header, settingsPanel, playerContainer);
    return panel;
}

let _settings = null;
export function getEcSettings() {
    if (_settings) return _settings;

    const settings = JSON.parse(localStorage.getItem("BME_EVASION_CHECKER_SETTINGS"));
    _settings = settings;

    return settings;
}

function getHeader() {
    const element = document.createElement("div");
    element.classList.add("bme-ec-header")

    element.innerHTML = `<h2>Evasion Checker</h2><p id="bme-ec-msg"></p>`
    return element;
}

function getEvasionCheckerSettingsPanel() {
    const element = document.createElement("div");
    element.classList.add("bme-ec-setting-panel");

    const settingsInputs = document.createElement("div");
    const loadModeChanger = getLoadModeChanger();
    const orgChanger = getOrgChanger();
    settingsInputs.append(loadModeChanger, orgChanger)

    const controlButtons = document.createElement("div");
    const loadButton = getStandardButton("Load Players", "bme-ec-load-button", loadPlayersPressed);
    const checkButton = getStandardButton("Check Players", "bme-ec-check-button", checkPlayersPressed);
    controlButtons.append(loadButton, checkButton);

    element.append(settingsInputs, controlButtons)
    return element;
}
function getStandardButton(text, id, invokeFunction) {
    const button = document.createElement("button");
    button.classList.add("bme-ec-button");
    button.id = id;

    button.innerText = text;
    if (invokeFunction) button.addEventListener("click", invokeFunction);

    return button;
}
function getLoadModeChanger() {
    const evasionCheckModes = ["Normal", "Inclusive", "Thorough"]
    const element = document.createElement("div");
    element.classList.add("bme-ec-setting-item")

    const label = document.createElement("p");
    label.innerText = "Load mode:"

    const button = document.createElement("button");
    button.dataset.used = `0|0|0`;
    button.dataset.labels = JSON.stringify(evasionCheckModes);
    button.id = "bme-ec-load-mode-changer"
    button.classList.add("bme-ec-button")
    button.innerText = evasionCheckModes[0];

    button.addEventListener("click", e => {
        if (e.target.classList.contains("bme-ec-inactive")) return;

        const text = e.target.innerText;
        const usageIndicators = e.target.dataset.used.split("|").map(item => Number(item));

        const currentIndex = evasionCheckModes.findIndex(item => item === text);
        const nextIndex = evasionCheckModes.length - 1 <= currentIndex ? 0 : currentIndex + 1;

        button.innerText = evasionCheckModes[nextIndex]

        const loadButton = document.getElementById("bme-ec-load-button");

        if (usageIndicators[nextIndex] !== 0) {
            button.classList.add("bme-ec-used");
            loadButton.classList.add("bme-ec-inactive")
        } else {
            button.classList.remove("bme-ec-used")
            loadButton.classList.remove("bme-ec-inactive")
        }
    })

    element.append(label, button);
    return element;
}
function getOrgChanger() {
    const element = document.createElement("div");
    element.classList.add("bme-ec-setting-item")

    const label = document.createElement("p");
    label.innerText = "Org:"
    element.append(label);

    const orgs = getOrgs();

    const select = document.createElement("select");
    select.id = "bme-ec-org-changer"
    orgs.forEach(org => {
        const option = document.createElement("option");
        option.value = org.id;
        option.textContent = org.name;
        select.appendChild(option);
    });
    element.append(select);



    return element;
}
function getOrgs() {
    const orgs = [{ id: "all", name: "Global" }];

    const bootstrapJson = getBootstrap();
    
    const bsAccOrgs = bootstrapJson?.state?.account?.organizations || [];

    for (const org of bsAccOrgs) {
        const orgInfo = getOrgInfo(org);
        orgs.push(orgInfo)
    }
    const bsOrgs = bootstrapJson?.state?.organizations?.organizations;
    for (const org in bsOrgs || {}) {
        const orgInfo = getOrgInfo(bsOrgs[org]);

        const index = orgs.findIndex(org => org.id === orgInfo.id);
        if (index !== -1) continue;

        orgs.push(orgInfo)
    }
    return orgs;

    function getOrgInfo(org) {
        return { id: org.org_id || org.id, name: org.name };
    }
}

function getPlayerContainer() {
    const element = document.createElement("div");

    const title = document.createElement("h3");
    title.innerText = "Loaded players(0):";
    title.id = "bme-ec-players-title";

    const container = document.createElement("div");
    container.id = "bme-ec-players-container";

    element.append(title, container);

    return element;
}







//Disabled as the patch was reverted.
function startObserver() {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (!window.location.href.includes("identifiers")) continue;
                if (node.nodeName !== "OL") continue;

                checkList(node);
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
function checkList(node) {
    const children = Array.from(node.children);
    for (const child of children) {
        if (child.children.length !== 1) return; //Wrong list
        if (child.children[0].nodeName !== "A") return //Wrong list
    }

    for (const child of children) {
        const link = child.children[0];
        const bmId = link.href.split("/")[5];

        const outcome = outcomeCollection.get(bmId);
        if (!outcome) return;

        const clone = outcome.element.cloneNode(true);
        clone.children[0].addEventListener("click", outcome.onClick)
        link.replaceWith(clone)
    }
}