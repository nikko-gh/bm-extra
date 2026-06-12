export function checkSidebarSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem("BME_SIDEBAR_SETTINGS"));
        if (typeof (settings) !== "object") throw new Error("Settings error");
        if (typeof (settings.friendComparator) !== "object") throw new Error("Settings error");
        if (typeof (settings.friendComparator.enabled) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.friendComparator.spot) !== "string") throw new Error("Settings error");
        if (typeof (settings.friendComparator.color) !== "string") throw new Error("Settings error");
        if (typeof (settings.friends) !== "object") throw new Error("Settings error");
        if (typeof (settings.friends.enabled) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.friends.spot) !== "string") throw new Error("Settings error");
        if (typeof (settings.friends.showOnline) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.friends.onlineColor) !== "string") throw new Error("Settings error");
        if (typeof (settings.historicFriends) !== "object") throw new Error("Settings error");
        if (typeof (settings.historicFriends.enabled) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.historicFriends.spot) !== "string") throw new Error("Settings error");
        if (typeof (settings.historicFriends.seenOnOrigin) !== "string") throw new Error("Settings error");
        if (typeof (settings.historicFriends.seenOnFriend) !== "string") throw new Error("Settings error");
        if (typeof (settings.currentTeam) !== "object") throw new Error("Settings error");
        if (typeof (settings.currentTeam.enabled) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.currentTeam.spot) !== "string") throw new Error("Settings error");
        if (typeof (settings.relatedPlayers) !== "object") throw new Error("Settings error");
        if (typeof (settings.relatedPlayers.enabled) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.relatedPlayers.max) !== "number") throw new Error("Settings error");
        if (typeof (settings.relatedPlayers.spot) !== "string") throw new Error("Settings error");
        if (typeof (settings.publicBans) !== "object") throw new Error("Settings error");
        if (typeof (settings.publicBans.enabled) !== "boolean") throw new Error("Settings error");
        if (typeof (settings.publicBans.spot) !== "string") throw new Error("Settings error");
    } catch (error) {
        const defaultSettings = getDefaultSidebarSettings();
        localStorage.setItem("BME_SIDEBAR_SETTINGS", JSON.stringify(defaultSettings));
    }
}
export function getDefaultSidebarSettings() {
    const settings = {};
    settings.friendComparator = {}
    settings.friendComparator.enabled = false;
    settings.friendComparator.spot = "right-slot-1";
    settings.friendComparator.color = "#ffffff"

    settings.friends = {}
    settings.friends.enabled = false;
    settings.friends.spot = "right-slot-2"
    settings.friends.showOnline = true;
    settings.friends.onlineColor = "#00ffff";

    settings.historicFriends = {}
    settings.historicFriends.enabled = false;
    settings.historicFriends.spot = "right-slot-3"
    settings.historicFriends.seenOnOrigin = "#263434"
    settings.historicFriends.seenOnFriend = "#343426"

    settings.currentTeam = {};
    settings.currentTeam.enabled = true;
    settings.currentTeam.spot = "left-slot-1";

    settings.relatedPlayers = {}
    settings.relatedPlayers.enabled = false;
    settings.relatedPlayers.max = 5;
    settings.relatedPlayers.spot = "left-slot-2";

    settings.publicBans = {}
    settings.publicBans.enabled = false;
    settings.publicBans.spot = "left-slot-3";

    return settings;
}