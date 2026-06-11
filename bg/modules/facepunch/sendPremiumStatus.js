import { errorString, sendResponse } from "../../bg.js";

export async function sendPremiumStatus(steamId, tabId, returnObject) {
    const resp = await fetch("https://rust-api.facepunch.com/api/premium/verify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: `{"SteamIds":[${steamId}]}`,
    });
    if (resp?.status !== 200) {
        console.error(`Failed to fetch premium status! | ${steamId} | ${resp?.status}`);
        sendResponse(tabId, returnObject, errorString.failedToFetch);
    }

    const data = await resp.json();
    const value = { premium: data.Results[steamId] }
    
    sendResponse(tabId, returnObject, value.premium || false);
}