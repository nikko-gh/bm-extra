import { errorString, getKey, sendResponse } from "../../bg.js";

export async function sendPlayerBanSummaries(steamIds, tabId, returnObject) {
    const key = await getKey("BME_STEAM_API_KEY");
    if (!key) return sendResponse(tabId, returnObject, errorString.noKey);
    if (key.length !== 32) return sendResponse(tabId, returnObject, errorString.invalidKey);
    
    const resp = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${key}&steamids=${steamIds}`);
    if (resp?.status !== 200) {
        console.error(`Failed to fetch steam player ban summaries! | ${steamIds} | ${key.substring(0, 10)} | ${resp?.status}`);
        return sendResponse(tabId, returnObject, errorString.failedToFetch);
    }

    const data = await resp.json();
    const value = data.players.map(item => {
        return {
            steamId: item.SteamId,
            daysSinceLastBan: item.DaysSinceLastBan,
            gameBanCount: item.NumberOfGameBans,
            vacBanCount: item.NumberOfVACBans,
            vacBanStatus: item.VACBanned,
        }
    })
    
    sendResponse(tabId, returnObject, value);
}
