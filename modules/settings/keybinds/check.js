export function checkKeybindsSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem("BME_KEYBINDS_SETTINGS"));
        if (!settings || typeof (settings) !== "object") throw new Error("Settings error");
        if (typeof (settings.privacy) !== "object") throw new Error("Settings error");
        if (typeof (settings.privacy.enabled) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.privacy.hotkey) !== "string") throw new Error("Settings error");
        if (typeof (settings.privacy.redactIps) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.privacy.redactSteamId) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.privacy.redactTime) !== "number") throw new Error("Settings error");

        if (typeof (settings.showDays) !== "object") throw new Error("Settings error");
        if (typeof (settings.showDays.enabled) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.showDays.hotkey) !== "string") throw new Error("Settings error");
        if (typeof (settings.showDays.duration) !== "number") throw new Error("Settings error");
    } catch (error) {
        const defaultSettings = getDefaultKeybindsSettings();
        localStorage.setItem("BME_KEYBINDS_SETTINGS", JSON.stringify(defaultSettings));
    }
}
export function getDefaultKeybindsSettings() {
    const settings = {};

    settings.privacy = {};
    settings.privacy.enabled = true;
    settings.privacy.hotkey = "control+shift";
    settings.privacy.redactIps = true;
    settings.privacy.redactSteamId = true;
    settings.privacy.redactTime = 5000;

    settings.showDays = {};
    settings.showDays.enabled = true;
    settings.showDays.hotkey = "control";
    settings.showDays.duration = 10000;

    return settings;
}
