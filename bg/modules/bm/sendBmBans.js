import { sendResponse } from "../../bg.js";
import { rateLimitLock } from "./rateLimitLock.js";

//Dev note: Don't forget to implement session cache
export async function sendBmBans(bmId, tabId, returnObject, token) {
    const bans = await getBmBansData(bmId, token);
    sendResponse(tabId, returnObject, bans)
}

async function getBmBansData(bmId, token, count = 0) {
    if (count > 2) return null;
    try {
        const resp = await fetch(`https://api.battlemetrics.com/bans?version=^0.1.0&sort=-timestamp&filter[player]=${bmId}&filter[expired]=false&access_token=${token}`)
        if (resp?.status === 429) await new Promise(r => { setTimeout(r, 5000); })
        if (resp?.status !== 200) throw new Error(`Fetch failed for ${bmId} | Status: ${resp?.status}`);
        await rateLimitLock(Number(resp.headers.get("x-rate-limit-remaining")));

        const data = await resp.json();
        return data
    } catch (error) {
        console.error(`Failed to request BattleMetrics Bans: ${error.message}`);
        await new Promise(r => { setTimeout(r, 1000) });
        return getPlayerData(bmId, token, count + 1);
    }
}