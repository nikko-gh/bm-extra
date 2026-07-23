import { getResetButton, getSettingsElement } from "../settings.js";

export function getOverviewSettings() {
    const element = document.createElement("div");
    const title = document.createElement("h1");
    title.innerText = "Overview Settings";
    element.appendChild(title);

    const settingsBucket = "BME_OVERVIEW_SETTINGS";
    const settings = JSON.parse(localStorage.getItem(settingsBucket));

    const showAvatar = getSettingsElement(
        "toggle", "Show avatar on page",
        "Shows the players avatar when it's available next to his name",
        null, settingsBucket, "showAvatar", settings.showAvatar
    )
    const showAlert = getSettingsElement(
        "toggle", "Show alert",
        "Shows the button that redirects to add an alert to the player.",
        null, settingsBucket, "showAlert", settings.showAlert
    )
    const showBmInfo = getSettingsElement(
        "toggle", "Show BM information",
        "Shows detailed information that is stored by BattleMetrics and usually it is not visible by default",
        null, settingsBucket, "showInfoPanel", settings.showInfoPanel
    );
    const removeSteamInfo = getSettingsElement(
        "toggle", "Remove steam information",
        "Remove the default Steam information panel from the BattleMetrics RCON profile when it appears",
        null, settingsBucket, "removeSteamInfo", settings.removeSteamInfo,
    );
    const showServer = getSettingsElement(
        "toggle", "Show server",
        "Show either the current or the last server the user has played on, as well as displaying connection details",
        null, settingsBucket, "showServer", settings.showServer
    )
    const advancedBans = getSettingsElement(
        "toggle", "Advanced bans",
        "Update ban reasons for a more readable format | May not fit your organization's ban reason formatting.",
        null, settingsBucket, "advancedBans", settings.advancedBans
    )
    const closeAdminLog = getSettingsElement(
        "toggle", "Close admin log",
        "Close admin log by default when opening a BattleMetrics profile.",
        null, settingsBucket, "closeAdminLog", settings.closeAdminLog
    )
    const swapBattleEyeGuid = getSettingsElement(
        "toggle", "Swap BattlEye GUID",
        "Swap BattlEye GUID to the player's streamer mode name",
        ["SM Names"], settingsBucket, "swapBattleEyeGuid", settings.swapBattleEyeGuid
    )
    const maxNamesOnProfile = getSettingsElement(
        "number", "Maximum names:",
        "The maximum number of names allowed to be showed in the overview section.",
        null, settingsBucket, "maxNames", settings.maxNames
    )
    const maxIpsOnProfile = getSettingsElement(
        "number", "Maximum IP addresses:",
        "The maximum number of IP addresses allowed to be showed in the overview section.",
        null, settingsBucket, "maxIps", settings.maxIps
    )
    const resetButton = getResetButton("bm-overview");

    element.append(
        showAvatar, showAlert, showBmInfo, removeSteamInfo, showServer,
        advancedBans, closeAdminLog, swapBattleEyeGuid,
        maxNamesOnProfile, maxIpsOnProfile,

        resetButton
    );

    return element;
}