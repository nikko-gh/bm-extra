export async function showcaseDetails(main, player, outcome, settings) {
    const showcase = getShowcaseElement(main, player, outcome, settings);
    document.body.append(showcase);

    showcase.offsetWidth;
    showcase.classList.add("bme-ec-showcase-visible");
}
function getShowcaseElement(main, player, outcome, settings) {
    const showcase = document.createElement("div")
    showcase.id = "bme-ec-showcase";
    const color = settings.color[outcome.color]
    showcase.style.setProperty("--bg", `${color}45`);
    showcase.style.setProperty("--border", color);

    showcase.addEventListener("click", e => {
        const target = e.target;
        if (target.id !== "bme-ec-showcase") return;

        target.classList.remove("bme-ec-showcase-visible");
        setTimeout(() => { target.remove(); }, 400);
    })

    const container = getShowcaseContainer(main, player, outcome, settings)
    showcase.append(container)

    return showcase;
}

function getShowcaseContainer(main, player, outcome, settings) {
    const container = document.createElement("div");
    container.id = "bme-showcase-container";

    const header = getHeader(main, player)

    //const nameSection = getNameSection()

    container.append(header);
    return container;
}
function getHeader(main, player) {
    const header = document.createElement("div");
    header.classList.add("bme-flex");
    header.id = "bme-showcase-header"

    console.log(main, player);
    const mainProfile = getHeaderProfile(main);
    const divider = getDivider();
    const playerProfile = getHeaderProfile(player)

    header.append(mainProfile, divider, playerProfile);
    return header;
}
function getHeaderProfile(player) {
    const profile = document.createElement("div");
    profile.classList.add("bme-showcase-profile-header")

    const avatarUrl = player.account.avatarUrl;
    const name = player.account.name;
    const steamId = player.account?.steamId?.identifier || null;
    const bmId = player.account.bmId;

    const bmAccountAge = player.account.firstSeen;
    const hours = getBmHours(player.account.servers);

    const bans = []
    if (player.bans[0]) bans.push(player.bans[0].timestamp);
    if (player.account?.steamId?.rustBans?.banned)
        bans.push(player.account.steamId.rustBans.lastBan)

    const lastBanTimestamp = Math.max(...bans, 0);

    const isServerBanned = Boolean(player.bans[0]);
    const isGameBanned = Boolean(player.account?.steamId?.rustBans?.banned);
    const lastBan = lastBanTimestamp === 0 ? "Not Banned" : `${getShowCaseTimeString(lastBanTimestamp)} ago`;

    const html = `
    <div class="bme-header-profile"> 
        <div class="bme-showcase-first-line">
            <img src="${avatarUrl}">
            <div>
                <p>${name}</p>
                <div>
                    <a target="_blank" href="${`https://www.battlemetrics.com/rcon/players/${bmId}`}">BM Profile</a>
                    ${steamId ?
                        `<a target="_blank" href="${`https://steamcommunity.com/profiles/${steamId}`}">Steam Profile</a>` :
                        `<p>Steam Profile</p>`
                    }
                </div>
            </div>
        </div>
        <div class="bme-showcase-header-details">
            <p>BM Account Age: ${getShowCaseTimeString(bmAccountAge)}</p>
            <p>BM Hours: ${hours} hours</p>
            <div class="bme-flex">
                <p>Last ban: ${lastBan}</p>
                ${isGameBanned ?
            `<img title="Currently Rust Game Banned" src="${chrome.runtime.getURL('/assets/img/eac-banned.png')}">` :
            `<img title="Not Game Banned" src="${chrome.runtime.getURL('/assets/img/not-eac-banned.png')}">`
        }
                ${isServerBanned ?
            `<img title="Server Banned" src="${chrome.runtime.getURL('/assets/img/server-banned.png')}">` :
            `<img title="Not Server Banned" src="${chrome.runtime.getURL('/assets/img/not-server-banned.png')}">`
        }
            </div>
        </div>
    </div>
    `

    profile.innerHTML = html;
    return profile;

    function getBmHours(servers) {
        let timePlayed = 0;

        servers.forEach(server => { timePlayed += server.timePlayed });
        return Math.floor(timePlayed / 60 / 60);
    }

}





function getDivider() {
    const div = document.createElement("div");
    div.classList.add("bme-showcase-divider")
    return div;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
function getShowCaseTimeString(timestamp) {
    const now = Date.now();
    const since = now - timestamp;

    let str = null;

    if (since > DAY) str = plural(since / DAY, "day");
    if (!str && since > HOUR) str = plural(since / HOUR, "hour");
    if (!str && since > MINUTE) str = plural(since / MINUTE, "minute");
    if (!str && since > SECOND) str = plural(since / MINUTE, "second");
    if (!str) str = `${since} ms`;

    return str;
}
function plural(value, unit) {
    value = Math.floor(value);

    if (value <= 1) return `${value} ${unit}`;
    return `${value} ${unit}s`;
}