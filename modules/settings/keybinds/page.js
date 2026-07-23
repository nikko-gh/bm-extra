import { getResetButton, getSettingsElement } from "../settings.js";

export function getKeybindsSettings(params) {
    const element = document.createElement("div");
    const title = document.createElement("h1");
    title.innerText = "Keybinds Settings";
    element.appendChild(title);

    const settingsBucket = "BME_KEYBINDS_SETTINGS";
    const settings = JSON.parse(localStorage.getItem(settingsBucket));

    const privacySegment = document.createElement("div");
    privacySegment.classList.add("bme-settings-segment");

    const privacyEnabled = getSettingsElement(
        "toggle", "Privacy Settings",
        "Enables a keybind which redacts identifiers for a short period so you can take a screenshot of the page without leaking anything sensitive.",
        null, settingsBucket, "privacy-enabled", settings.privacy.enabled, { segment: privacySegment }
    )

    const privacyHotkey = getSettingsElement(
        "hotkey", "Keybind:",
        "Choose your keybind, this will trigger the redaction of the current page.",
        null, settingsBucket, "privacy-hotkey", settings.privacy.hotkey,
        { max: 5 }
    )
    const redactIps = getSettingsElement(
        "toggle", "Redact IP addresses",
        "When you activate your keybind, all the IP identifiers will be redacted.",
        null, settingsBucket, "privacy-redactIps", settings.privacy.redactIps
    )
    const redactSteamId = getSettingsElement(
        "toggle", "Redact SteamId",
        "When you activate your keybind, Steam ID and BattlEye GUID identifier will be redacted.",
        null, settingsBucket, "privacy-redactSteamId", settings.privacy.redactSteamId
    )
    const redactTimeOptions = [
        { display: "500 ms", value: 500 },
        { display: "1 second", value: 1000 },
        { display: "2 seconds", value: 2000 },
        { display: "3 seconds", value: 3000 },
        { display: "5 seconds", value: 5000 },
        { display: "10 seconds", value: 10000 },
        { display: "30 seconds", value: 30000 },
    ]
    const redactTime = getSettingsElement(
        "select", "Redact Time",
        "Choose how long identifiers should be redacted after activating your keybind.",
        null, settingsBucket, "privacy-redactTime", settings.privacy.redactTime, { options: redactTimeOptions }
    )
    privacySegment.append(privacyHotkey, redactIps, redactSteamId, redactTime)

    const showDaysSegment = document.createElement("div");
    showDaysSegment.classList.add("bme-settings-segment");

    const showDaysEnabled = getSettingsElement(
        "toggle", "Show Days",
        "Enables a Hotkey which changes all the durations to be converted into days by default.",
        null, settingsBucket, "showDays-enabled", settings.showDays.enabled, { segment: showDaysSegment }
    )

    const showDaysHotkey = getSettingsElement(
        "hotkey", "Keybind:",
        "Choose your keybind, this will covert all the time durations into days.",
        null, settingsBucket, "showDays-hotkey", settings.showDays.hotkey
    )
    const showDaysDurationOptions = [
        { display: "500 ms", value: 500 },
        { display: "1 second", value: 1000 },
        { display: "2 seconds", value: 2000 },
        { display: "3 seconds", value: 3000 },
        { display: "5 seconds", value: 5000 },
        { display: "10 seconds", value: 10000 },
        { display: "30 seconds", value: 30000 },
    ]
    const showDaysDuration = getSettingsElement(
        "select", "Duration:",
        "Choose the duration of the time conversion.",
        null, settingsBucket, "showDays-duration", settings.showDays.duration, { options: showDaysDurationOptions }
    )
    showDaysSegment.append(showDaysHotkey, showDaysDuration);

    const resetButton = getResetButton("bm-keybinds")
    element.append(
        privacyEnabled, privacySegment,
        showDaysEnabled, showDaysSegment,
        resetButton
    )

    return element;
}