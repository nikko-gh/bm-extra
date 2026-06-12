export function checkEvasionCheckerSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem("BME_EVASION_CHECKER_SETTINGS"));
        if (typeof (settings.enabled) !== "boolean") throw new Error("Settings error");

        if (!settings || typeof (settings) !== "object") throw new Error("Settings error");
        if (typeof (settings.panelPlacement) !== "string") throw new Error("Settings error");

        if (typeof (settings.color) !== "object") throw new Error("Settings error");
        if (typeof (settings.color.unchecked) !== "string") throw new Error("Settings error");
        if (typeof (settings.color.checking) !== "string") throw new Error("Settings error");
        if (typeof (settings.color.clean) !== "string") throw new Error("Settings error");
        if (typeof (settings.color.failed) !== "string") throw new Error("Settings error");
        if (typeof (settings.color.inconclusive) !== "string") throw new Error("Settings error");
        if (typeof (settings.color.gameBanned) !== "string") throw new Error("Settings error");
        if (typeof (settings.color.gameBannedOld) !== "string") throw new Error("Settings error");
        if (typeof (settings.color.gameBannedMatch) !== "string") throw new Error("Settings error");
        if (typeof (settings.color.gameBannedOldMatch) !== "string") throw new Error("Settings error");
        if (typeof (settings.color.serverBanned) !== "string") throw new Error("Settings error");
        if (typeof (settings.color.serverBannedOld) !== "string") throw new Error("Settings error");
        if (typeof (settings.color.serverBannedMatch) !== "string") throw new Error("Settings error");
        if (typeof (settings.color.serverBannedOldMatch) !== "string") throw new Error("Settings error");

        if (typeof (settings.core) !== "object") throw new Error("Settings error");
        if (typeof (settings.core.autoStart) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.core.autoStartLimit) !== "number") throw new Error("Settings error");
        if (typeof (settings.core.serverBanPriority) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.core.oldServerBan) !== "number") throw new Error("Settings error");
        if (typeof (settings.core.oldGameBan) !== "number") throw new Error("Settings error");
        if (typeof (settings.core.nameMatchCaseSensitive) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.core.matchMinNamePercentage) !== "number") throw new Error("Settings error");
        if (typeof (settings.core.matchMinAssociate) !== "number") throw new Error("Settings error");
        if (typeof (settings.core.matchMaxDifference) !== "number") throw new Error("Settings error");
        if (typeof (settings.core.requestFriendsFromSteam) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.core.requestFriendsFromRustApi) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.core.ignoreNames) !== "object") throw new Error("Settings error");
        if (typeof (settings.core.ignoreNameParts) !== "object") throw new Error("Settings error");
        if (typeof (settings.core.reasons) !== "object") throw new Error("Settings error");
    } catch (error) {
        const defaultSettings = getDefaultEvasionCheckerSettings();
        localStorage.setItem("BME_EVASION_CHECKER_SETTINGS", JSON.stringify(defaultSettings));
    }
}
export function getDefaultEvasionCheckerSettings() {
    const settings = {};
    settings.enabled = true;
    settings.panelPlacement = "bottom";

    settings.core = {};
    settings.core.autoStart = true;
    settings.core.autoStartLimit = 45;
    settings.core.serverBanPriority = false;
    settings.core.oldServerBan = 365;
    settings.core.oldGameBan = 180;
    settings.core.nameMatchCaseSensitive = false;
    settings.core.matchMinNamePercentage = 70;
    settings.core.matchMinAssociate = 1;
    settings.core.matchMaxDifference = 86400000,
        settings.core.requestFriendsFromSteam = false;
    settings.core.requestFriendsFromRustApi = false;
    settings.core.ignoreNames = [
        ".",
        "123",
        "321",
        ":)"
    ];
    settings.core.ignoreNameParts = [
        "survivor (",
        "survivor",
        "kiosk",

        "banditcamp.com",
        "banditcamp",
        "rustchance.com",
        "rustchance",
        "rustypot.com",
        "rustypot",
        "rustclash.com",
        "rustclash",
        "cobaltlab",
        "keydrop",
    ];

    settings.core.reasons = [
        { key: "assoc", display: "A" },
        { key: "cheat", display: "H" },
        { key: "hack", display: "H" },
        { key: "evasi", display: "E" },
        { key: "evadi", display: "E" },
        { key: "susp", display: "S" },
        { key: "verif", display: "S" },
        { key: "rule", display: "R" },
        { key: "default", display: "O" },
    ];

    settings.color = {};
    settings.color.unchecked = "#e8bd00";
    settings.color.checking = "#957700";
    settings.color.clean = "#76ff4c";
    settings.color.inconclusive = "#5f5f5f";
    settings.color.failed = "#101010";
    settings.color.gameBanned = "#d60000";
    settings.color.gameBannedOld = "#770707";
    settings.color.gameBannedMatch = "#00a8ae";
    settings.color.gameBannedOldMatch = "#008c91";
    settings.color.serverBanned = "#ff4646";
    settings.color.serverBannedOld = "#b92f2f";
    settings.color.serverBannedMatch = "#00a8ae";
    settings.color.serverBannedOldMatch = "#008c91";

    return settings;
}