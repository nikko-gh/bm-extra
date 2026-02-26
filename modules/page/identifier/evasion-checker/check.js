import { getAuthToken, getSteamFriendlistFromRustApi, getSteamFriendlistFromSteam, talkToBackgroundScript } from "../../../misc.js";
import { colorPlayer } from "./actions.js";
import { getEcSettings } from "./panel.js";
import { showcaseDetails } from "./showcase.js";

let main = null;

export async function checkPlayer(playerElement, settings, check) {
    try {
        const authToken = getAuthToken();

        if (!main && main === null) {
            main = undefined;
            setUpMain(authToken, settings)
        };

        colorPlayer(playerElement, "checking")

        const bmId = playerElement.dataset.id;
        const player = await getPlayerProfile(bmId, authToken, settings)
        await lockTillMain();

        const outcome = getOutcome(main, player, settings.core, check);
        setupPlayerElement(playerElement, outcome, player, settings);

        colorPlayer(playerElement, outcome.color)
        playerElement.classList.remove("bme-ec-unchecked")
        playerElement.classList.add("bme-ec-active")
        playerElement.children[0].addEventListener("click", () => { showcaseDetails(main, player, outcome, settings) })

        const links = getLinks(player.account.bmId);
        links.forEach(item => {
            const clone = playerElement.cloneNode(true);
            clone.children[0].addEventListener("click", () => { showcaseDetails(main, player, outcome, settings) })
            item.replaceWith(clone)
        })
    } catch (error) {
        console.error(`BME-EXTRA: Failed to check ${playerElement.dataset.id}: ${error.message}`);

        colorPlayer(playerElement, "failed")
        playerElement.classList.remove("bme-ec-unchecked")
        playerElement.classList.add("bme-ec-failed")
    }
}
async function getPlayerProfile(bmId, authToken, settings) {
    const player = {}

    const playerPromise = getAccountData(bmId, authToken);
    const bansPromise = getBanData(bmId, authToken);

    player.account = await playerPromise;
    const associates = getAssociates(player.account, settings.core);

    player.bans = await bansPromise;
    player.associates = await associates;

    if (settings.core.checkType === "deep") player.sessions = null;

    return player;
}
async function setUpMain(authToken, settings) {
    const bmId = window.location.href.split("/")[5];
    main = await getPlayerProfile(bmId, authToken, settings);
}
async function lockTillMain() {
    while (!main) {
        await new Promise(r => { setTimeout(r, 150) })
    }
}
function getOutcome(main, player, settings, check) {
    let isMatch = false;
    const maxNameMatch = getMaxNameMatch(main, player, settings);
    const commonAssociates = countCommonAssociates(main, player);
    const difference = getDifference(main, player);

    if (settings.matchMinAssociate <= commonAssociates) isMatch = true;
    if (!isMatch && settings.matchMinNamePercentage <= maxNameMatch) isMatch = true;
    if (!isMatch && difference !== null && settings.matchMaxDifference > difference) isMatch = true;

    let color = "clean"
    const serverBanned = getServerBanned(player, check);

    const gameBanned = player.account.steamId?.rustBans || null;
    if (gameBanned?.banned) gameBanned.days = getDaysSince(gameBanned.lastBan);

    if (color === "clean" && serverBanned?.days < settings.oldServerBan) color = `serverBanned${isMatch ? "Match" : ""}`;
    if (color === "clear" || !settings.serverBanPriority) {
        if (gameBanned?.banned && gameBanned.days < settings.oldGameBan) color = `gameBanned${isMatch ? "Match" : ""}`;
    }

    if (color === "clean" && serverBanned?.days > settings.oldServerBan) color = `serverBannedOld${isMatch ? "Match" : ""}`;
    if (color === "clear" || !settings.serverBanPriority) {
        if (gameBanned?.banned && gameBanned.days > settings.oldGameBan) color = `gameBannedOld${isMatch ? "Match" : ""}`;
    }

    if (color === "clean" && !player.account.steamId) color = "inconclusive";
    return {
        maxNameMatch, commonAssociates, difference,
        serverBanned, gameBanned, color
    }
}
function getMaxNameMatch(main, player, settings) {
    let max = 0;
    let mainNames = main.account.identifiers.names.map(item => item.identifier);
    let playerNames = player.account.identifiers.names.map(item => item.identifier);

    if (!settings.nameMatchCaseSensitive) {
        mainNames = mainNames.map(item => item.toLowerCase());
        playerNames = mainNames.map(item => item.toLowerCase());
    }

    mainNames.forEach(mainName => {
        playerNames.forEach(playerName => {
            const distance = levenshtein(mainName, playerName);
            const length = Math.max(mainName.length, playerName.length);

            const percentage = Math.round((1 - distance / length) * 100);
            //console.log([distance, length, percentage, mainName, playerName].map(item=> `${item}`.padEnd(3)).join(" | "));         
            if (max < percentage) max = percentage;
        })
    })
    return max;
}
function levenshtein(longer, shorter) {
    if (longer.length < shorter.length) {
        const tmp = longer;
        longer = shorter;
        shorter = tmp;
    }

    const previousRow = new Uint16Array(shorter.length + 1);
    const currentRow = new Uint16Array(shorter.length + 1);

    for (let j = 0; j <= shorter.length; j++) previousRow[j] = j;

    for (let i = 1; i <= longer.length; i++) {
        currentRow[0] = i;
        const charA = longer[i - 1];

        for (let j = 1; j <= shorter.length; j++) {
            const charB = shorter[j - 1];

            const cost = charA === charB ? 0 : 1;

            const deletion = previousRow[j] + 1;
            const insertion = currentRow[j - 1] + 1;
            const substitution = previousRow[j - 1] + cost;

            currentRow[j] = Math.min(deletion, insertion, substitution);
        }

        previousRow.set(currentRow);
    }

    return previousRow[shorter.length];
}
function countCommonAssociates(main, player) {
    const mainAssociates = getAssociatesFromPlayer(main.associates)
    const playerAssociates = getAssociatesFromPlayer(player.associates)

    let matchCount = 0;
    mainAssociates.forEach(mainAssociate => {
        let match = false;
        playerAssociates.forEach(playerAssociate => {
            if (mainAssociate === playerAssociate) matchCount++;
        })
    })
    return matchCount;
}
function getAssociatesFromPlayer(associatesObj) {
    const associates = [];
    for (const key in associatesObj) {
        const associate = associatesObj[key];
        associate.forEach(steamId => {
            if (associate.includes(steamId)) return;

            associates.push(steamId);
        })
    }
    return associates;
}
function getDifference(main, player) {
    if (!main.sessions || !player.sessions) return null;

    //SessionChecks
}
function getServerBanned(player, check) {
    let bans = player.bans;

    if (!isNaN(Number(check.org))) bans = bans.filter(ban => ban.orgId === check.org)

    const ban = bans[0] || null;
    if (!ban) return null;

    return {
        reason: ban.reason,
        days: getDaysSince(ban.timestamp)
    }
}
function getDaysSince(timestamp) {
    const now = Date.now();
    const since = now - timestamp;
    const ONE_DAY = 24 * 60 * 60 * 1000;

    return Math.floor(since / ONE_DAY);
}
function setupPlayerElement(playerElement, outcome, player, settings) {
    const statLine = document.getElementById(`bme-ec-player-stat-line-${playerElement.dataset.id}`);
    setupStatLine(statLine, outcome, player, settings)

    const banLine = document.getElementById(`bme-ec-player-ban-line-${playerElement.dataset.id}`);
    setupBanLine(banLine, outcome)
}
function setupStatLine(statLine, outcome, player, settings) {
    let stats = [];
    stats.push(getNameStat(outcome, settings));
    stats.push(getAssociateStat(outcome, settings));
    if (outcome.difference) stats.push(`D: ${outcome.difference}`.padEnd(7));
    stats.push(`F: ${getStatLineStr(`${getDaysSince(player.account.firstSeen)}d`, 5)}`);
    
    const lastSeen = player.account.servers[0]?.lastSeen || null;
    if (lastSeen) stats.push(`L: ${getDaysSince(lastSeen)}d`.padEnd(8))

    statLine.innerHTML = stats.join(" | ")
}
function getNameStat(outcome, settings) {
    const percentage = outcome.maxNameMatch;
    const limit = settings.core.matchMinNamePercentage;

    let str = `N: `;
    if (percentage < limit) str += getStatLineStr(`${percentage}%`, 4);
    else str += `<span class="bme-colored-span" style="--color: ${settings.color[outcome.color]}">${getStatLineStr(`${percentage}%`, 4)}</span>`

    return str;
}
function getAssociateStat(outcome, settings) {
    const numberOfAssociates = outcome.commonAssociates;
    const limit = settings.core.matchMinAssociate;

    let str = `A: `;
    if (numberOfAssociates < limit) str += getStatLineStr(`${numberOfAssociates}`, 2);
    else str += `<span class="bme-colored-span" style="--color: ${settings.color[outcome.color]}">${getStatLineStr(`${numberOfAssociates}%`, 2)}</span>`

    return str;
}
function getStatLineStr(str, padEnd) {
    return `${str}`.padEnd(padEnd).replaceAll(" ", "&nbsp");
}
function setupBanLine(banLine, outcome) {
    const bans = [];
    if (outcome.serverBanned) bans.push(`SB(${getBanReason(outcome.serverBanned.reason)}): ${outcome.serverBanned.days} days`);
    if (outcome.gameBanned?.banned) bans.push(`RGB: ${outcome.gameBanned.days} days`)

    banLine.innerHTML = bans.join(" | ")

}
function getBanReason(reason) {
    const settings = getEcSettings();

    for (const item of settings.core.reasons) {
        reason
    }
    reason = reason.toLowerCase();
    if (reason.includes("assoc")) return "A"
    if (reason.includes("cheat")) return "H"
    if (reason.includes("hack")) return "H"
    if (reason.includes("evasi")) return "E"
    if (reason.includes("evadi")) return "E"
    if (reason.includes("suspi")) return "S"
    if (reason.includes("verif")) return "S"
    if (reason.includes("rule")) return "R"

    return "?"
}
function getLinks(bmId) {
    const players = Array.from(document.querySelectorAll("ol > li > a[href]"));
    const matches = [];
    players.forEach(item => {
        if (item.href !== `https://www.battlemetrics.com/rcon/players/${bmId}`) return;

        matches.push(item)
    })
    return matches;
}

/**
 *  CACHE FOR EVASION CHECKER
 */

/* bmId => {bans, account, friends, sessions} */
const playerCache = new Map();

async function getAccountData(bmId, token) {
    const cached = playerCache.get(bmId);
    if (cached && cached["account"])
        return cached["account"];

    const data = await talkToBackgroundScript("BME_BM_ACCOUNT", bmId, token, 60000)

    const servers = data.included
        .filter(item => item.type === "server")
        .filter(item => item.relationships?.game?.data?.id === "rust")
        .map(server => {
            return {
                id: server.id,
                orgId: server?.relationships?.organization?.data?.id || null,
                name: server.attributes.name,
                timePlayed: server.meta.timePlayed,
                firstSeen: new Date(server.meta.firstSeen).getTime(),
                lastSeen: new Date(server.meta.lastSeen).getTime()
            }
        })
        .sort((a, b) => b.lastSeen - a.lastSeen);

    let steamId = data.included.filter(item => item.attributes?.type === "steamID")[0] || null;
    let avatar = "https://avatars.fastly.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";
    if (steamId) {
        if (steamId.attributes?.metadata?.profile?.avatarfull)
            avatar = steamId.attributes?.metadata?.profile?.avatarfull;

        steamId = {
            identifier: steamId.attributes.identifier,
            rustBans: getRustBans(steamId.attributes?.metadata?.rustBans),
        }
    }
    function getRustBans(rustBans) {
        if (!rustBans) return null;
        return {
            banned: rustBans.banned,
            lastBan: new Date(rustBans.lastBan).getTime(),
        }
    }

    const names = data.included
        .filter(item => item.attributes.type === "name")
        .map(item => {
            return {
                identifier: item.attributes.identifier,
                lastSeen: new Date(item.attributes.lastSeen).getTime()
            }
        })
        .sort((a, b) => b.lastSeen - a.lastSeen)
        .filter((item, index, arr) => index === arr.findIndex(name => name.identifier === item.identifier));

    const ips = data.included
        .filter(item => item.attributes.type === "ip")
        .map(item => {
            const meta = item.attributes?.metadata.connectionInfo || null;

            return {
                identifier: item.attributes?.identifier || null,
                country: item.attributes?.metadata?.country,
                asn: meta?.asn || null,
                isp: meta?.isp || null,
                isVpn: meta ? meta?.datacenter || meta?.proxy || meta?.tor : null,
            }
        })

    const flags = data.included
        .filter(item => item.type === "playerFlag")
        .map(item => {
            return {
                name: item.attributes.name,
                orgId: item.relationships?.organization?.data?.id || null,
            }
        })

    const player = {};
    player.name = names[0].identifier;
    player.bmId = data.data.id;
    player.steamId = steamId;
    player.avatarUrl = avatar;
    player.firstSeen = new Date(data.data.attributes.createdAt).getTime();

    player.identifiers = {};
    player.identifiers.names = names;
    player.identifiers.ips = ips;

    player.servers = servers;
    player.flags = flags;

    saveCache(bmId, player, "account");
    return player;
}
async function getBanData(bmId, token, count = 0) {
    const cached = playerCache.get(bmId);
    if (cached && cached["bans"])
        return cached["bans"];

    const data = await talkToBackgroundScript("BME_BM_BANS", bmId, token, 60000)

    const bans = data.data.map(ban => {
        return {
            id: ban.id,
            reason: ban.attributes?.reason,
            expires: ban.attributes?.expires || null,
            active: isActive(ban),
            timestamp: new Date(ban.attributes?.timestamp).getTime(),
            orgId: ban.relationships?.organization?.data?.id || null,
            banList: ban.relationships?.banList?.data?.id,
            orgWide: ban.attributes.orgWide,
            note: ban.attributes.note,
        }
    })
        .filter(ban => ban.active);


    saveCache(bmId, bans, "bans")
    return bans;

    function isActive(ban) {
        if (ban.attributes?.expires == null) return true;

        const now = Date.now();
        const expires = new Date(ban.attributes.expires).getTime();

        if (now < expires) return true;
        return false;
    }
}
async function getAssociates(playerData, core) {
    const steamId = playerData.steamId.identifier;
    if (!steamId) return [];

    const associates = {};
    associates.friends = await getSteamFriends(steamId, core);
    associates.historicFriends = await getHistoricSteamFriends(steamId, core);
    associates.teammates = [];
    associates.historicTeammates = [];

    return associates;
}
async function getSteamFriends(steamId, core) {
    const friends = [];
    if (core.requestFriendsFromSteam) {
        const steamFriends = await getSteamFriendlistFromSteam(steamId);
        if (typeof (steamFriends) !== "string")
            steamFriends.forEach(friend => { friends.push(friend.steamId) });
    }
    return friends;
}
async function getHistoricSteamFriends(steamId, core) {
    const friends = [];
    if (core.requestFriendsFromRustApi) {
        const steamFriends = await getSteamFriendlistFromRustApi(steamId);
        if (typeof (steamFriends) !== "string")
            steamFriends.forEach(friend => {
                if (!friends.includes(friend.steamId)) friends.push(friend.steamId)
            });
    }
    return friends;
}

function saveCache(bmId, data, type) {
    const cache = playerCache.get(bmId) || {};
    cache[type] = data;

    playerCache.set(bmId, cache);
}