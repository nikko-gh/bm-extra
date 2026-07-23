import { getResetButton, getSettingsElement } from "../settings.js";

export function getEvasionCheckerSettings() {
    const element = document.createElement("div");

    const titleRow = document.createElement("div");
    titleRow.classList.add("bme-flex", "bme-title-row")
    element.appendChild(titleRow);

    const title = document.createElement("h1");
    title.innerText = "Evasion Checker";
    titleRow.appendChild(title);

    element.append(titleRow)
    const bucket = "BME_EVASION_CHECKER_SETTINGS";
    const settings = JSON.parse(localStorage.getItem(bucket));

    const specialSegment = document.createElement("div");

    const enabled = getSettingsElement(
        "toggle", "Enabled",
        "Enables Evasion Checker.",
        null, bucket, "enabled", settings.enabled, { segment: specialSegment }
    )

    const panelPlacementOptions = [
        { value: "top", display: "TOP" },
        { value: "bottom", display: "BOTTOM" },
    ]
    const placement = getSettingsElement(
        "switch", "Placement",
        "Choose where the Evasion Checker panel appears.",
        null, bucket, "panelPlacement", settings.panelPlacement, { options: panelPlacementOptions }
    )

    const autoStart = getSettingsElement(
        "toggle", "Auto Start",
        "Auto-start evasion checks when conditions are met.",
        null, bucket, "core-autoStart", settings.core.autoStart
    )
    const autoStartLimit = getSettingsElement(
        "number", "Auto Start Limit",
        "Maximum number of accounts to start the process automatically. Use -1 for unlimited.",
        null, bucket, "core-autoStartLimit", settings.core.autoStartLimit
    )
    const serverBanPriority = getSettingsElement(
        "toggle", "Server Ban Priority",
        "Prioritize server bans over EAC game bans.",
        null, bucket, "core-serverBanPriority", settings.core.serverBanPriority
    )
    const oldServerBan = getSettingsElement(
        "number", "Old Server Ban",
        "Days until a server ban is marked as old. Use -1 for never.",
        null, bucket, "core-oldServerBan", settings.core.oldServerBan
    )

    const oldGameBan = getSettingsElement(
        "number", "Old Game Ban",
        "Days until a game ban is marked as old. Use -1 for never.",
        null, bucket, "core-oldGameBan", settings.core.oldGameBan
    )

    const matchMinAssociate = getSettingsElement(
        "number", "Min Associates",
        "Minimum number of associates required to consider it a match.",
        null, bucket, "core-matchMinAssociate", settings.core.matchMinAssociate
    )

    const matchMinName = getSettingsElement(
        "number", "Min Name Match",
        "Minimum name match percentage required to consider it a match.",
        null, bucket, "core-matchMinNamePercentage", settings.core.matchMinNamePercentage
    )

    const caseSensitive = getSettingsElement(
        "toggle", "Case-Sensitive Name Matching",
        "Treat uppercase and lowercase letters differently when matching names.",
        null, bucket, "core-nameMatchCaseSensitive", settings.core.nameMatchCaseSensitive
    )

    /*
    //Reserved for a later update
    const matchMaxDifference = getSettingsElement(
        "number", "Max Difference", 
        "Reserved for future update, doesn't do anything at the moment.",
        null, bucket, "core-matchMaxDifference", settings.core.matchMaxDifference
    )
    */
    const friendsFromSteam = getSettingsElement(
        "toggle", "Friends from Steam",
        "Load friends from Steam. May cause issues if used too often.",
        ["STEAM API KEY"], bucket, "core-requestFriendsFromSteam", settings.core.requestFriendsFromSteam
    )
    const friendsFromRustApi = getSettingsElement(
        "toggle", "Friends from Player Insight",
        "Load friends from Player Insight.",
        ["Player Insight - HF"], bucket, "core-requestFriendsFromRustApi", settings.core.requestFriendsFromRustApi,
    )

    //IGNOREDNAMES
    //REMOVEDNAMES
    //SERVER BAN REASONS

    const unchecked = getSettingsElement(
        "color", "Unchecked:",
        "Color of an unchecked row.",
        null, bucket, "color-unchecked", settings.color.unchecked,
    )
    const checking = getSettingsElement(
        "color", "Checking:",
        "Color of a row when it's being checked.",
        null, bucket, "color-checking", settings.color.checking,
    )
    const clean = getSettingsElement(
        "color", "Clean:",
        "Color of a clean row.",
        null, bucket, "color-clean", settings.color.clean,
    )
    const inconclusive = getSettingsElement(
        "color", "Inconclusive",
        "Color of an inconclusive row.",
        null, bucket, "color-inconclusive", settings.color.inconclusive,
    )
    const failed = getSettingsElement(
        "color", "Failed:",
        "Color of a failed row.",
        null, bucket, "color-failed", settings.color.failed,
    )
    const gameBan = getSettingsElement(
        "color", "Game ban:",
        "Color of a game banned row.",
        null, bucket, "color-gameBanned", settings.color.gameBanned,
    )
    const oldGameBanColor = getSettingsElement(
        "color", "Old Game ban:",
        "Color of an old game banned row.",
        null, bucket, "color-gameBannedOld", settings.color.gameBannedOld,
    )

    const gameBannedMatch = getSettingsElement(
        "color", "Game banned match:",
        "Color of a game banned matched row.",
        null, bucket, "color-gameBannedMatch", settings.color.gameBannedMatch,
    )
    const gameBannedOldMatch = getSettingsElement(
        "color", "Old game banned match:",
        "Color of an old game banned matched row.",
        null, bucket, "color-gameBannedOldMatch", settings.color.gameBannedOldMatch,
    )
    const serverBanned = getSettingsElement(
        "color", "Server ban:",
        "Color of a server banned row.",
        null, bucket, "color-serverBanned", settings.color.serverBanned,
    )
    const serverBannedOld = getSettingsElement(
        "color", "Old server ban:",
        "Color of an old server banned row.",
        null, bucket, "color-serverBannedOld", settings.color.serverBannedOld,
    )
    const serverBannedMatch = getSettingsElement(
        "color", "Server banned match:",
        "Color of a server banned match.",
        null, bucket, "color-serverBannedMatch", settings.color.serverBannedMatch,
    )
    const serverBannedOldMatch = getSettingsElement(
        "color", "Old server banned match:",
        "Color of an old server banned match.",
        null, bucket, "color-serverBannedOldMatch", settings.color.serverBannedOldMatch,
    )

    specialSegment.append(
        placement, autoStart, autoStartLimit, serverBanPriority, oldServerBan,
        oldGameBan, matchMinAssociate, matchMinName, caseSensitive, /*matchMaxDifference,*/
        friendsFromSteam, friendsFromRustApi,

        unchecked, checking, clean, inconclusive, failed, gameBan, oldGameBanColor,
        gameBannedMatch, gameBannedOldMatch, serverBanned, serverBannedOld, serverBannedMatch,
        serverBannedOldMatch
    )

    const resetButton = getResetButton("bm-evasion");
    element.append(enabled, specialSegment, resetButton)

    return element
}
