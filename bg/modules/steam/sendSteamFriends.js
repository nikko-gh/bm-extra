import { errorString, getKey, sendResponse } from "../../bg.js";

export async function sendSteamFriends(steamId, tabId, returnObject) {
    const key = await getKey("BME_STEAM_API_KEY");
    if (!key) return sendResponse(tabId, returnObject, errorString.noKey);
    if (key.length !== 32) return sendResponse(tabId, returnObject, errorString.invalidKey);

    const resp = await fetch(`https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${key}&steamid=${steamId}&relationship=friend`);
    if (resp?.status === 401) return sendResponse(tabId, returnObject, "PRIVATE");
    if (resp?.status !== 200) {
        console.error(`Failed to fetch steam friends! | ${steamId} | ${key.substring(0, 10)} | ${resp?.status}`);
        return sendResponse(tabId, returnObject, errorString.failedToFetch);
    }

    const data = await resp.json();
    const friends = data.friendslist.friends.map(item => {
        return {
            steamId: item.steamid,
            since: item.friend_since,
        }
    })
    
    sendResponse(tabId, returnObject, friends);
}