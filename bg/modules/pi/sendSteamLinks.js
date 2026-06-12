import { errorString, getKey, sendResponse } from "../../bg.js";
import { getOrgSteamLinks } from "../orgSteamLinks.js";

export async function sendSteamLinks(steamId, tabId, returnObject) {
    const rawLinks = [];

    const key = await getKey("BME_PLAYER_INSIGHT_API_KEY");
    if (!key) return sendResponse(tabId, returnObject, errorString.noKey);
    if (key.length !== 64) return sendResponse(tabId, returnObject, errorString.invalidKey);

    const resp = await fetch(`https://player-insight.flqyd.dev/api/steam/linked/${steamId}?token=${key}`);
    if (resp?.status === 403) return sendResponse(tabId, returnObject, errorString.invalidKey);
    if (resp?.status === 401) return sendResponse(tabId, returnObject, errorString.noPerm);
    if (resp?.status !== 200) {
        console.error(`Failed to fetch steam links! | ${steamId} | ${key.substring(0, 10)} | ${resp?.status}`);
        return sendResponse(tabId, returnObject, errorString.failedToFetch);
    }

    const data = await resp.json();
    data.data.links.forEach(item => rawLinks.push(item));

    const orgLinks = await getOrgSteamLinks();
    orgLinks.forEach(item => rawLinks.push(item));

    const links = [];
    for (const link of rawLinks) {
        const index = links.findIndex(item => item.discordId === link.discordId);
        if (index === -1) {
            links.push({ discordId: link.discordId, lastSeen: link.lastSeen, owners: [link.owner], attached: link.attached ? link.attached : [] });
            continue;
        }

        links[index].owners.push(link.owner);

        if (link.attached.length === 0) return
        link.attached.forEach(attached => {
            if (links[index].attached.includes(attached)) return;

            links[index].attached.push(attached);
        })
    }

    sendResponse(tabId, returnObject, links);
}