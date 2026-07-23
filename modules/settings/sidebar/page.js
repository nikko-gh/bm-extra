import { getResetButton, getSettingsElement } from "../settings.js";

export function getSidebarSettings() {
    const element = document.createElement("div");
    const title = document.createElement("h1");
    title.innerText = "Sidebar Settings";
    element.appendChild(title);

    const allSidebarSlots = [
        { value: "right-slot-1", display: "RIGHT 1" },
        { value: "right-slot-2", display: "RIGHT 2" },
        { value: "right-slot-3", display: "RIGHT 3" },
        { value: "right-slot-4", display: "RIGHT 4" },
        { value: "left-slot-1", display: "LEFT 1" },
        { value: "left-slot-2", display: "LEFT 2" },
        { value: "left-slot-3", display: "LEFT 3" },
        { value: "left-slot-4", display: "LEFT 4" },
    ]

    const bucket = "BME_SIDEBAR_SETTINGS";
    const settings = JSON.parse(localStorage.getItem(bucket));

    const currentTeamSegment = document.createElement("div")
    currentTeamSegment.classList.add("bme-settings-segment");

    const currentTeamEnabled = getSettingsElement(
        "toggle", "Show Current Team",
        "Shows the current team of the player.",
        null, bucket, "currentTeam-enabled",
        settings.currentTeam.enabled, { segment: currentTeamSegment }
    )

    const currentTeamSpot = getSettingsElement(
        "switch", "Position:",
        "Choose which sidebar spot the current team should appear in.",
        null, bucket, "currentTeam-spot", settings.currentTeam.spot, { options: allSidebarSlots }
    )
    currentTeamSegment.append(currentTeamSpot)

    
    const relatedPlayersSegment = document.createElement("div");
    relatedPlayersSegment.classList.add("bme-settings-segment");

    const relatedPlayersEnabled = getSettingsElement(
        "toggle", "Show Related Players",
        "Shows you the players who spent the most time with your suspect on the same server in the last 30 days.",
        null, bucket, "relatedPlayers-enabled", settings.relatedPlayers.enabled, {segment: relatedPlayersSegment}
    )

    const relatedPlayersMax = getSettingsElement(
        "number", "Max profiles",
        "Maximum number of profiles to be shown.",
        null, bucket, "relatedPlayers-max", settings.relatedPlayers.max, {max: 100, min: 0 }
    )

    const relatedPlayersSpot = getSettingsElement(
        "switch", "Position:",
        "Choose which sidebar spot the related players should appear in.",
        null, bucket, "relatedPlayers-spot", settings.relatedPlayers.spot, { options: allSidebarSlots }
    )

    relatedPlayersSegment.append(relatedPlayersMax, relatedPlayersSpot)




    const friendComparatorSegment = document.createElement("div");
    friendComparatorSegment.classList.add("bme-settings-segment");

    const friendComparatorEnabled = getSettingsElement(
        "toggle", "Player Comparator",
        "Allows you to easily compare players friend lists for common friends between them.",
        null, bucket, "friendComparator-enabled",
        settings.friendComparator.enabled, { segment: friendComparatorSegment }
    )

    const friendComparatorSpot = getSettingsElement(
        "switch", "Position:",
        "Choose which sidebar spot the player comparator should appear in.",
        null, bucket, "friendComparator-spot", settings.friendComparator.spot, { options: allSidebarSlots }
    )
    const comparatorColor = getSettingsElement(
        "color", "Active Color:",
        "This color will be used to highlight the result of the comparison.",
        null, bucket, "friendComparator-color", settings.friendComparator.color
    )
    friendComparatorSegment.append(friendComparatorSpot, comparatorColor)

    const steamFriendsSegment = document.createElement("div")
    steamFriendsSegment.classList.add("bme-settings-segment");

    const steamFriendsEnabled = getSettingsElement(
        "toggle", "Show Friends",
        "Shows the current Steam Friends on the sidebar.",
        ["STEAM API KEY"], bucket, "friends-enabled",
        settings.friends.enabled, { segment: steamFriendsSegment }
    )

    const steamFriendsSpot = getSettingsElement(
        "switch", "Position:",
        "Choose which sidebar spot the Steam Friends should appear in.",
        null, bucket, "friends-spot", settings.friends.spot, { options: allSidebarSlots }
    )
    const steamFriendsShowOnline = getSettingsElement(
        "toggle", "Highlight online friends",
        "Highlights the online friends that are on the same server.",
        null, bucket, "friends-showOnline", settings.friends.showOnline
    )
    const steamFriendsOnlineColor = getSettingsElement(
        "color", "Online friends border color:",
        "Choose the color the online friends are supposed to be highlighted with.",
        null, bucket, "friends-onlineColor", settings.friends.onlineColor
    )
    steamFriendsSegment.append(steamFriendsSpot, steamFriendsShowOnline, steamFriendsOnlineColor)

    const historicFriendsSegment = document.createElement("div")
    historicFriendsSegment.classList.add("bme-settings-segment");

    const historicFriendsEnabled = getSettingsElement(
        "toggle", "Show Historic Friends",
        "Show Historic Friends on the sidebar.",
        ["Player Insight - HF"], bucket, "historicFriends-enabled",
        settings.historicFriends.enabled, { segment: historicFriendsSegment }
    )

    const historicFriendsSpot = getSettingsElement(
        "switch", "Position:",
        "Choose which sidebar spot the Historic Friends should appear in.",
        null, bucket, "historicFriends-spot", settings.historicFriends.spot, { options: allSidebarSlots }
    )
    const seenOnOrigin = getSettingsElement(
        "color", "Seen On Origin:",
        "Choose the background color of the friends who were seen on the origin.",
        null, bucket, "historicFriends-seenOnOrigin", settings.historicFriends.seenOnOrigin
    )
    const seenOnFriend = getSettingsElement(
        "color", "Seen On Friend:",
        "Choose the background color of the friends who were seen on the friend alone.",
        null, bucket, "historicFriends-seenOnFriend", settings.historicFriends.seenOnFriend
    )
    historicFriendsSegment.append(historicFriendsSpot, seenOnOrigin, seenOnFriend)

    const publicBansSegment = document.createElement("div")
    publicBansSegment.classList.add("bme-settings-segment");

    const publicBansEnabled = getSettingsElement(
        "toggle", "Show Public bans",
        "Shows the Public Bans on the sidebar.",
        ["Player Insight - PB"], bucket, "publicBans-enabled",
        settings.publicBans.enabled, { segment: publicBansSegment }
    )

    const publicBansSpot = getSettingsElement(
        "switch", "Position:",
        "Choose which sidebar spot the public bans should appear in.",
        null, bucket, "publicBans-spot", settings.publicBans.spot, { options: allSidebarSlots }
    )
    publicBansSegment.append(publicBansSpot)

    const resetButton = getResetButton("bm-sidebar")
    element.append(
        currentTeamEnabled, currentTeamSegment,
        friendComparatorEnabled, friendComparatorSegment,
        steamFriendsEnabled, steamFriendsSegment,
        historicFriendsEnabled, historicFriendsSegment,
        relatedPlayersEnabled, relatedPlayersSegment,
        publicBansEnabled, publicBansSegment,
        resetButton
    )
    return element;
}