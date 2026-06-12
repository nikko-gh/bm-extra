import { errorString, getKey, sendResponse } from "../../bg.js";

export async function sendDiscordData(discordId, tabId, returnObject) {
    const key = await getKey("BME_PLAYER_INSIGHT_API_KEY");
    if (!key) return sendResponse(tabId, returnObject, errorString.noKey);
    if (key.length !== 64) return sendResponse(tabId, returnObject, errorString.invalidKey);

    const resp = await fetch(`https://player-insight.flqyd.dev/api/discord/user/${discordId}?token=${key}`);
    if (resp?.status === 403) return sendResponse(tabId, returnObject, errorString.invalidKey);
    if (resp?.status === 401) return sendResponse(tabId, returnObject, errorString.noPerm);
    if (resp?.status !== 200) {
        console.error(`Failed to request discord data | ${discordId} | ${key.substring(0, 10)} | ${resp?.status}`)
        return sendResponse(tabId, returnObject, errorString.failedToFetch)
    }

    const data = await resp.json();
    const account = data.data;

    sendResponse(tabId, returnObject, account);
}