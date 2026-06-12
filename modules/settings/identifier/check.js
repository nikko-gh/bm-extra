export function checkIdentifierSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem("BME_IDENTIFIER_SETTINGS"));
        if (!settings || typeof (settings) !== "object") throw new Error("Settings error");
        if (typeof (settings.showAvatar) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.displayAvatars) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.zoomableAvatars) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.swapBattleEyeGuid) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.showIspAndAsnData) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.requestProxyCheck) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.pCheckMaxIpNumber) !== "number") throw new Error("Settings error");
        if (typeof (settings.pCheckRecently) !== "number") throw new Error("Settings error");
        if (typeof (settings.highlightVpn) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.removeVpnLabel) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.vpnAbove) !== "number") throw new Error("Settings error");
        if (typeof (settings.vpnBgColor) !== "string") throw new Error("Settings error");
        if (typeof (settings.vpnOpacity) !== "number") throw new Error("Settings error");
        if (typeof (settings.showLinks) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.loadDiscordData) !== "boolean") throw new Error("Settings error");


    } catch (error) {
        const defaultSettings = getDefaultIdentifierSettings();
        localStorage.setItem("BME_IDENTIFIER_SETTINGS", JSON.stringify(defaultSettings));
    }
}

export function getDefaultIdentifierSettings() {
    const settings = {};
    settings.showAvatar = false;
    settings.displayAvatars = false;
    settings.zoomableAvatars = true;
    settings.swapBattleEyeGuid = false;
    settings.showIspAndAsnData = true;
    settings.requestProxyCheck = false;
    settings.pCheckMaxIpNumber = 10;
    settings.pCheckRecently = 10;
    settings.highlightVpn = false;
    settings.removeVpnLabel = true;
    settings.vpnAbove = -1;
    settings.vpnBgColor = "#150f0f";
    settings.vpnOpacity = 0.6;
    settings.showLinks = false;
    settings.loadDiscordData = false;
    settings.showEmptyIdInput = false;
    return settings;
}