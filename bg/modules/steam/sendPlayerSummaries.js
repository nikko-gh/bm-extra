import {  errorString, getKey, sendResponse } from "../../bg.js";

export async function sendPlayerSummaries(steamIds, tabId, returnObject) {
    const key = await getKey("BME_STEAM_API_KEY");
    if (!key) return sendResponse(tabId, returnObject, errorString.noKey);
    if (key.length !== 32) return sendResponse(tabId, returnObject, errorString.invalidKey);

    const resp = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamIds}`);    
    if (resp?.status !== 200) {
        console.error(`Failed to fetch steam player summaries! | ${steamIds} | ${key.substring(0, 10)} | ${resp?.status}`);
        return sendResponse(tabId, returnObject, errorString.failedToFetch);
    }

    const data = await resp.json();
    const value = data?.response?.players?.map(item => {
        return {
            steamId: item.steamid,
            name: item.personaname,
            avatar: item.avatarhash,
            online: item.personastate,
            inGame: item.gameextrainfo ? item.gameextrainfo : "Not playing",
            setup: item.profilestate ? true : false,
        }
    });
    
    sendResponse(tabId, returnObject, value || []);
}
