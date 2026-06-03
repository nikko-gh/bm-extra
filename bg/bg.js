import { getOrgSteamLinks } from "./modules/orgSteamLinks.js";

console.log("Service worker loaded!")

/**
 * apiKey - API KEY REGARDLESS OF THE SERVICE
 * subject - steam ID, IP
 */
chrome.runtime.onMessage.addListener(async (req, sender) => {
    if (!req.type.startsWith("BME_")) return;
    if (req.type === "BME_JSON_DOWNLOAD") return downloadJsonFile(req.filename, req.data)

    toLog(req.type, req?.apiKey, req.subject)
    /**
     * returnObject:
     * type: original type +"_RESOLVED"
     * status: "OK" | "ERROR"
     * value: the outcome of the request or the error object
     */
    const returnObject = { type: `${req.type}_RESOLVED` }
    if (req.type.startsWith("BME_CURRENT_FRIENDS")) return sendCurrentFriends(req.subject, req.apiKey, sender, returnObject);
    if (req.type.startsWith("BME_HISTORIC_FRIENDS")) return sendHistoricFriends(req.subject, req.apiKey, sender, returnObject)
    if (req.type.startsWith("BME_HISTORIC_AVATARS")) return sendHistoricAvatars(req.subject, req.apiKey, sender, returnObject)
    if (req.type.startsWith("BME_PLAYER_INSIGHT_PERMS")) return sendPlayerInsightPermissions(req.subject, req.apiKey, sender, returnObject)
    if (req.type.startsWith("BME_BM_ACCOUNT")) return sendBmAccount(req.subject, req.apiKey, sender, returnObject);
    if (req.type.startsWith("BME_BM_BANS")) return sendBmBans(req.subject, req.apiKey, sender, returnObject);
    if (req.type.startsWith("BME_STEAM_FRIENDLIST")) return sendFriendlistFromSteam(req.subject, req.apiKey, sender, returnObject);
    if (req.type.startsWith("BME_PREMIUM_STATUS")) return sendPremiumStatus(req.subject, sender, returnObject)
    if (req.type.startsWith("BME_PROXYCHECK")) return sendProxyCheck(req.subject, req.apiKey, sender, returnObject)
    if (req.type.startsWith("BME_PLAYER_SUMMARIES")) return sendSteamPlayerSummaries(req.subject, req.apiKey, sender, returnObject);
    if (req.type.startsWith("BME_BAN_SUMMARIES")) return sendSteamPlayerBanSummaries(req.subject, req.apiKey, sender, returnObject);
    if (req.type.startsWith("BME_PUBLIC_BANS")) return sendPublicBans(req.subject, req.apiKey, sender, returnObject);
    if (req.type.startsWith("BME_STEAM_LINKS")) return sendSteamLinks(req.subject, req.apiKey, sender, returnObject);
    if (req.type.startsWith("BME_DISCORD_DATA")) return sendDiscordData(req.subject, req.apiKey, sender, returnObject);
    if (req.type.startsWith("BME_DISCORD_MESSAGES")) return sendDiscordMessages(req.subject, req.apiKey, sender, returnObject);
    if (req.type.startsWith("BME_ATLAS_TEAMINFO")) return sendAtlasTeaminfo(req.subject, req.apiKey, sender, returnObject);
})

function toLog(type, key, subject) {
    type = type.substring(0, 30).padEnd(30);
    key = `${key?.substring(0, 10) || null}`.padEnd(10);
    subject = subject.includes("-") ?
        `${subject.split("-").join(" | ")}` :
        subject.includes(",") ?
            subject.split(",").length :
            subject;

    console.log(`${type} | ${key} | ${subject}`);
}


function downloadJsonFile(name, content) {
    const json = JSON.stringify(content, null, 4);
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;

    chrome.downloads.download({
        url: dataUrl,
        filename: name,
        saveAs: true,
    });
}
async function sendCurrentFriends(steamId, apiKey, sender, returnObject) {
    try {
        const resp = await fetch(`https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${apiKey}&steamid=${steamId}&relationship=friend`);
        if (resp?.status !== 200 && resp.status !== 401) throw new Error(`Requesting steam friends failed | steamId: ${steamId} | API KEY: ${apiKey.substring(0, 10)}... | Status: ${resp?.status}`)

        const data = await resp.json();
        returnObject.status = "OK";
        if (resp.status === 401) {
            returnObject.value = "Private";
        } else {
            returnObject.value = data.friendslist.friends.map(item => {
                return {
                    steamId: item.steamid,
                    since: item.friend_since,
                }
            })
        }
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function sendHistoricFriends(steamId, apiKey, sender, returnObject) {
    try {
        const resp = await fetch(`https://player-insight.flqyd.dev/api/steam/friends/${steamId}?token=${apiKey}`);
        if (resp?.status !== 200) throw new Error(`Requesting historic friends failed | steamId: ${steamId} | API KEY: ${apiKey.substring(0, 10)}... | Status: ${resp?.status || 600}`)

        const data = await resp.json();
        returnObject.status = "OK";
        returnObject.value = data.data.friends;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function sendPremiumStatus(steamId, sender, returnObject) {
    try {
        const resp = await fetch("https://rust-api.facepunch.com/api/premium/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: `{"SteamIds":[${steamId}]}`,
        });
        if (resp?.status !== 200) throw new Error(`Requesting premium status failed | steamId: ${steamId} | Status: ${resp?.status}`)

        const data = await resp.json();
        const value = { premium: data.Results[steamId] }

        returnObject.status = "OK";
        returnObject.value = value;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function sendProxyCheck(ips, apiKey, sender, returnObject) {
    try {
        const resp = await fetch(`https://proxycheck.io/v3/${ips}?key=${apiKey}`);
        if (resp?.status !== 200) throw new Error(`Requesting Proxycheck data failed | API KEY: ${apiKey.substring(0, 10)}... | Status: ${resp?.status}`)

        const data = await resp.json();

        returnObject.status = "OK";
        returnObject.value = data;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function sendHistoricAvatars(steamId, apiKey, sender, returnObject) {
    try {
        const resp = await fetch(`https://player-insight.flqyd.dev/api/steam/avatars/${steamId}?token=${apiKey}`);
        if (resp?.status !== 200) throw new Error(`Requesting Avatars Failed | steamId: ${steamId} | API KEY: ${apiKey.substring(0, 10)}... | Status: ${resp?.status}`)

        const data = await resp.json();
        returnObject.status = "OK";
        returnObject.value = data.data.avatars;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function sendPlayerInsightPermissions(steamId, apiKey, sender, returnObject) {
    try {
        const resp = await fetch(`https://player-insight.flqyd.dev/api/permissions?token=${apiKey}`);
        if (resp?.status !== 200) throw new Error(`Failed to request permissions | API KEY: ${apiKey.substring(0, 10)}... | Status: ${resp?.status}`)

        const data = await resp.json();
        returnObject.status = "OK";
        returnObject.value = data?.data?.perms;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function sendSteamPlayerSummaries(steamIds, API_KEY, sender, returnObject) {
    try {
        const resp = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${API_KEY}&steamids=${steamIds}`);
        if (resp.status === 429) throw new Error("Rate Limit")
        if (resp?.status !== 200) throw new Error(`Requesting Steam Player Summaries Failed | steamId: ${steamIds} | API KEY: ${API_KEY.substring(0, 10)}... | Status: ${resp?.status}`)

        const data = await resp.json();
        returnObject.status = "OK";
        returnObject.value = data.response.players.map(item => {
            return {
                steamId: item.steamid,
                name: item.personaname,
                avatar: item.avatarhash,
                online: item.personastate,
                inGame: item.gameextrainfo ? item.gameextrainfo : "Not playing",
                setup: item.profilestate ? true : false,
            }
        });
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function sendSteamPlayerBanSummaries(steamIds, API_KEY, sender, returnObject) {
    try {
        const resp = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${API_KEY}&steamids=${steamIds}`);
        if (resp.status === 429) throw new Error("Rate Limit")
        if (resp?.status !== 200) throw new Error(`Requesting Steam Ban Summaries Failed | steamId: ${steamId} | API KEY: ${apiKey.substring(0, 10)}... | Status: ${resp?.status}`)

        const data = await resp.json();
        returnObject.status = "OK";
        returnObject.value = data.players.map(item => {
            return {
                steamId: item.SteamId,
                daysSinceLastBan: item.DaysSinceLastBan,
                gameBanCount: item.NumberOfGameBans,
                vacBanCount: item.NumberOfVACBans,
                vacBanStatus: item.VACBanned,
            }
        })
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function sendPublicBans(steamId, apiKey, sender, returnObject) {
    try {
        const resp = await fetch(`https://player-insight.flqyd.dev/api/steam/bans/${steamId}?token=${apiKey}`);
        if (resp?.status !== 200) throw new Error(`Requesting Public Bans Failed | steamId: ${steamId} | API KEY: ${apiKey.substring(0, 10)}... | Status: ${resp?.status}`)

        const data = await resp.json();
        returnObject.status = "OK";
        returnObject.value = data.data.bans;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function sendSteamLinks(steamId, apiKey, sender, returnObject) {
    try {
        const rawLinks = [];

        const resp = await fetch(`https://player-insight.flqyd.dev/api/steam/linked/${steamId}?token=${apiKey}`);
        if (resp?.status !== 200) throw new Error(`Failed to request steam links | steamId: ${steamId} | API KEY: ${apiKey.substring(0, 10)}... | Status: ${resp?.status}`)
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

        returnObject.status = "OK";
        returnObject.value = links;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function sendDiscordData(discordId, apiKey, sender, returnObject) {
    try {
        const resp = await fetch(`https://player-insight.flqyd.dev/api/discord/user/${discordId}?token=${apiKey}`);
        if (resp?.status !== 200) throw new Error(`Failed to request steam links | steamId: ${discordId} | API KEY: ${apiKey.substring(0, 10)}... | Status: ${resp?.status}`)

        const data = await resp.json();
        returnObject.status = "OK";
        returnObject.value = data.data;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function sendDiscordMessages(path, apiKey, sender, returnObject) {
    try {
        const resp = await fetch(`https://player-insight.flqyd.dev/api/discord/messages/${path}?token=${apiKey}`);
        if (resp?.status !== 200) throw new Error(`Failed to request messages | Path: ${path}| API KEY: ${apiKey.substring(0, 10)}... | Status: ${resp?.status}`)

        const data = await resp.json();
        returnObject.status = "OK";
        returnObject.value = data.data;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function sendAtlasTeaminfo(values, apiKey, sender, returnObject) {
    try {
        const steamId = values.split("-")[0];
        const serverId = values.split("-")[1];

        const resp = await fetch(`https://api.battlemetrics.com/servers/${serverId}/command`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Accept-Version": "^0.1.0"
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        command: "c46e957a-54d8-497c-81ec-c2dcef2cd7e2",
                        options: {
                            player: steamId,
                        }
                    },
                    type: "rconCommand"
                }
            })
        })
        if (resp?.status !== 200) throw new Error(`Requesting Atlas teaminfo failed | steamId: ${steamId} | API KEY: ${apiKey.substring(0, 10)}... | Status: ${resp?.status}`)

        const data = await resp.json();
        returnObject.status = "OK";
        returnObject.value = data;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}



async function sendBmAccount(bmId, token, sender, returnObject) {
    try {
        const data = await getPlayerData(bmId, token);

        returnObject.status = "OK";
        returnObject.value = data;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function getPlayerData(bmId, token, count = 0) {
    if (count > 2) return;
    try {
        const resp = await fetch(`https://api.battlemetrics.com/players/${bmId}?version=^0.1.0&include=identifier,server,playerFlag&access_token=${token}`)

        if (resp?.status === 429) await new Promise(r => { setTimeout(r, 30000); })
        if (resp?.status !== 200) throw new Error(`Fetch failed for ${bmId} | Status: ${resp?.status}`);
        await bmRateLimitLock(Number(resp.headers.get("x-rate-limit-remaining")));

        const data = await resp.json();
        return data
    } catch (error) {
        console.error(`Failed to request BattleMetrics Account: ${error.message}`);
        await new Promise(r => { setTimeout(r, 1000) });
        return getPlayerData(bmId, token, count + 1);
    }
}

async function sendBmBans(bmId, token, sender, returnObject) {
    try {
        const data = await getBmBansData(bmId, token);

        returnObject.status = "OK";
        returnObject.value = data;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    } catch (error) {
        console.error(error);
        returnObject.status = "ERROR";
        returnObject.value = error;
        return chrome.tabs.sendMessage(sender.tab.id, returnObject);
    }
}
async function getBmBansData(bmId, token, count = 0) {
    try {
        const resp = await fetch(`https://api.battlemetrics.com/bans?version=^0.1.0&sort=-timestamp&filter[player]=${bmId}&filter[expired]=false&access_token=${token}`)
        if (resp?.status === 429) await new Promise(r => { setTimeout(r, 30000); })
        if (resp?.status !== 200) throw new Error(`Fetch failed for ${bmId} | Status: ${resp?.status}`);
        await bmRateLimitLock(Number(resp.headers.get("x-rate-limit-remaining")));

        const data = await resp.json();
        return data
    } catch (error) {
        console.error(`Failed to request BattleMetrics Bans: ${error.message}`);
        await new Promise(r => { setTimeout(r, 1000) });
        return getPlayerData(bmId, token, count + 1);
    }
}


async function bmRateLimitLock(current) {
    if (current < 175) await new Promise(r => { setTimeout(r, 1000) })
    if (current < 125) await new Promise(r => { setTimeout(r, 4000) })
    if (current < 100) await new Promise(r => { setTimeout(r, 5000) })
    if (current < 75) await new Promise(r => { setTimeout(r, 10000) })
    if (current < 25) await new Promise(r => { setTimeout(r, 30000) })
    return;
}   