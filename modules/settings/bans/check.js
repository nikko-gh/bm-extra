export function checkBanPageSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem("BME_BAN_PAGE_SETTINGS"));
        if (typeof (settings.selectLastServer) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.presets) !== "object") throw new Error("Settings error");
        if (typeof (settings.presets.enabled) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.presets.pasteEvidenceIfEmpty) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.presets.setupBansAfterFirst) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.presets.spot) !== "string") throw new Error("Settings error");
        if (typeof (settings.presets.items) !== "object") throw new Error("Settings error");
    } catch (error) {
        const defaultSettings = getDefaultBanPageSettings();
        localStorage.setItem("BME_BAN_PAGE_SETTINGS", JSON.stringify(defaultSettings));
    }
}
export function getDefaultBanPageSettings() {
    const settings = {};

    settings.selectLastServer = true;
    settings.presets = {};
    settings.presets.enabled = false;
    settings.presets.pasteEvidenceIfEmpty = true;
    settings.presets.setupBansAfterFirst = true;
    settings.presets.spot = "right-slot-1";
    settings.presets.items = [];

    return settings;
}
