export function checkProxyCheckSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem("BME_PROXY_CHECK_SETTINGS"));
        if (!settings || typeof (settings) !== "object") throw new Error("Settings error");
        if (typeof (settings.apiKey) !== "string") throw new Error("Settings error");
        if (typeof (settings.maxIps) !== "number") throw new Error("Settings error");
        if (typeof (settings.checkAfter) !== "number") throw new Error("Settings error");
        if (typeof (settings.keepCache) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.ignoreKnownVpns) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.lastRateLimit) !== "number") throw new Error("Settings error");
    } catch (error) {
        const defaultSettings = getDefaultProxyCheckSettings();
        localStorage.setItem("BME_PROXY_CHECK_SETTINGS", JSON.stringify(defaultSettings));
    }
}
function getDefaultProxyCheckSettings() {
    const settings = {};

    settings.apiKey = "";
    settings.maxIps = 10;
    settings.checkAfter = 2592000000;
    settings.ignoreKnownVpns = true;
    settings.keepCache = true;

    settings.lastRateLimit = -1;

    return settings;
}
