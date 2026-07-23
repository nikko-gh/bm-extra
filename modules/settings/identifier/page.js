import { getResetButton, getSettingsElement } from "../settings.js";

export function getIdentifierSettings() {
    const element = document.createElement("div");
    const title = document.createElement("h1");
    title.innerText = "Identifier Settings";
    element.appendChild(title);

    const bucket = "BME_IDENTIFIER_SETTINGS";
    const settings = JSON.parse(localStorage.getItem(bucket));

    const showAvatarToggle = getSettingsElement(
        "toggle", "Show avatar on page",
        "Shows the player's avatar when it's available next to their name.",
        null, bucket, "showAvatar", settings.showAvatar
    )
    const swapBattleEyeGuid = getSettingsElement(
        "toggle", "Swap BattlEye GUID",
        "Swap BattlEye GUID to the player's streamer mode name.",
        ["SM Names"], bucket, "swapBattleEyeGuid", settings.swapBattleEyeGuid
    )

    const showExtraInfoSegment = document.createElement("div")
    showExtraInfoSegment.classList.add("bme-settings-segment");

    const showIspAsnData = getSettingsElement(
        "toggle", "Show extra IP info",
        "Shows the name of the ISP and ASN of the IP addresses.",
        null, bucket, "showIspAndAsnData", settings.showIspAndAsnData, { segment: showExtraInfoSegment }
    )

    const showMore = getSettingsElement(
        "toggle", "Show Proxycheck Info",
        "Shows extra information related to the IP Address from proxycheck.io.",
        null, bucket, "requestProxyCheck", settings.requestProxyCheck
    )
    showExtraInfoSegment.append(showMore);

    const vpnSegment = document.createElement("div")
    vpnSegment.classList.add("bme-settings-segment");
    const highlightVpn = getSettingsElement(
        "toggle", "Highlight VPNs",
        "Highlights VPNs to make it easier to differentiate.",
        null, bucket, "highlightVpn",
        settings.highlightVpn, { segment: vpnSegment }
    )

    const removeVpnLabel = getSettingsElement(
        "toggle", "Remove VPN label",
        "Removes the VPN labels from the identifiers.",
        null, bucket, "removeVpnLabel", settings.removeVpnLabel
    )
    const vpnAbove = getSettingsElement(
        "number", "VPN connection requirement:",
        "The number of connections needed to classify the identifier as a VPN by default.",
        null, bucket, "vpnAbove", settings.vpnAbove
    )
    const vpnBgColor = getSettingsElement(
        "color", "VPN Background color:",
        "Choose the background color of the VPN identifier element.",
        null, bucket, "vpnBgColor", settings.vpnBgColor
    )
    const vpnOpacity = getSettingsElement(
        "number", "VPN Opacity:",
        "Choose the Level of Opacity that should be applied to the VPNs.<br />0 - transparent | 1 - fully visible.",
        null, bucket, "vpnOpacity", settings.vpnOpacity, { min: 0, max: 1 }
    )
    vpnSegment.append(removeVpnLabel, vpnAbove, vpnBgColor, vpnOpacity)

    const avatarsSegment = document.createElement("div")
    avatarsSegment.classList.add("bme-settings-segment");

    const displayAvatars = getSettingsElement(
        "toggle", "Display Avatars",
        `Display the avatars as identifiers that the player used in the past. It will only work if the identifiers are sorted by "Type".`,
        ["Player Insight - HA"], bucket, "displayAvatars",
        settings.displayAvatars, { segment: avatarsSegment }
    )

    const zoomableAvatars = getSettingsElement(
        "toggle", "Zoomable Avatars",
        "Make the Avatars grow to their full sizes so you can get a better view of them when hovered over.",
        null, bucket, "zoomableAvatars", settings.zoomableAvatars
    )
    avatarsSegment.append(zoomableAvatars)

    const linkSegment = document.createElement("div")
    linkSegment.classList.add("bme-settings-segment");

    const showLinks = getSettingsElement(
        "toggle", "Show Links",
        `Display linked Discord accounts.`,
        ["Player Insight - SL"], bucket, "showLinks", settings.showLinks, { segment: linkSegment }
    )
    const loadDiscordData = getSettingsElement(
        "toggle", "Load Discord Data",
        `Load and display the Discord account information.`,
        ["Player Insight - DD"], bucket, "loadDiscordData", settings.loadDiscordData
    )
    const showEmptyIdInput = getSettingsElement(
        "toggle", "Show Input",
        `Shows an input field in which you can request Discord data manually.`,
        ["Player Insight - DD"], bucket, "showEmptyIdInput", settings.showEmptyIdInput
    )

    linkSegment.append(loadDiscordData, showEmptyIdInput)


    const resetButton = getResetButton("bm-identifier")
    element.append(
        showAvatarToggle, swapBattleEyeGuid, showIspAsnData,
        showExtraInfoSegment, highlightVpn, vpnSegment,
        displayAvatars, avatarsSegment,
        showLinks, linkSegment,

        resetButton,
    )
    return element;
}