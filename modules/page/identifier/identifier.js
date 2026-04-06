import { getElementWhenAppears, getIdentifierType, getTimeSpan } from "../../misc.js";
import { cache, getProxyCheckIpInfo } from "../cache/cache.js";
import { fillDiscordUserElement } from "./discordUserElement.js";

export async function showExtraDataOnIps(bmId, bmProfile, requestProxyCheck) {
    bmProfile = await bmProfile;

    let ips = bmProfile.included
        .filter(item => item.attributes.type === "ip")
        .map(item => {
            const conInfo = item.attributes?.metadata?.connectionInfo;
            const isVpn = conInfo ? conInfo.datacenter || conInfo.proxy || conInfo.tor : false;
            const isp = Boolean(conInfo?.isp) ? conInfo.isp : null;
            const asn = Boolean(conInfo?.asn) ? conInfo.asn : null;
            const lastSeen = item?.attributes?.lastSeen ? new Date(item.attributes.lastSeen).getTime() : 0;
            return {
                id: item.id ?? null,
                ip: item.attributes?.identifier ?? null,
                isp, asn, isVpn, lastSeen
            }
        });

    if (requestProxyCheck) {
        const proxyCheckData = await getProxyCheckIpInfo(ips);
        ips = ips.map(item => {
            const ip = item.ip;
            const proxyCheck = proxyCheckData.get(ip) || null;

            return { ...item, proxyCheck }
        })
    }

    const padEndValues = {};
    padEndValues.identifier = Math.max(...ips.map(ip => ip?.ip?.length || 0), 15);
    padEndValues.isp = Math.max(...ips.map(ip => ip?.isp?.length || ip?.proxyCheck?.net?.isp?.length || 0), 3);
    padEndValues.asn = Math.max(...ips.map(ip => ip?.asn?.length || ip?.proxyCheck?.net?.asn?.length || 0), 3);

    const identifierWrapper = await getElementWhenAppears("css-11gv980", true);
    const identifierTable = identifierWrapper?.lastChild?.children;
    if (!identifierTable) console.error("BM-EXTRA: Failed to find identifier table.");

    for (const identifier of identifierTable) {
        const { type, id } = getIdentifierType(identifier);
        if (type !== "IP" || !id) continue;

        const ipObject = ips.find(ip => ip.id == id);
        if (!ipObject) continue;

        convertIdentifier(identifier, ipObject, padEndValues, requestProxyCheck)
    }
}
function convertIdentifier(identifier, ipObject, padEndValues, requestProxyCheck) {
    const ipElement = identifier?.firstChild?.firstChild?.querySelector("span");

    const ipAddress = ipElement?.innerText?.split(" | ")[0].trim();
    const ipValue = `${ipAddress}`.padEnd(padEndValues.identifier);
    const ispValue = `${ipObject.isp || ipObject.proxyCheck?.net?.isp || "N/A"}`.padEnd(padEndValues.isp);
    const asnValue = `${ipObject.asn || ipObject.proxyCheck?.net?.asn || "N/A"}`.padEnd(padEndValues.asn);

    const conTypeValue = getConType(ipObject.proxyCheck);
    const conTypeString = conTypeValue && typeof (conTypeValue) === "object" ?
        `<span class="${conTypeValue.color}">${conTypeValue.value}</span>` :
        conTypeValue;

    let text = `${ipValue}  |  ISP: ${ispValue}  |  ${asnValue}`;
    if (requestProxyCheck) text += `  |  ${conTypeString || ""}`
    ipElement.innerHTML = text;
    if (!conTypeString && requestProxyCheck) {
        const pcButton = getPcButton(identifier, ipObject, padEndValues, requestProxyCheck);
        ipElement.after(pcButton);
    }

    if (!ipObject.proxyCheck) return;
    const pcDataElement = getPcDataElement(ipObject.proxyCheck);
    ipElement.classList.add("bme-pc-ip-main")
    ipElement.after(pcDataElement)

    ipElement.addEventListener("click", e => {
        if (pcDataElement.classList.contains("bme-pc-open"))
            return pcDataElement.classList.remove("bme-pc-open");

        pcDataElement.classList.add("bme-pc-open");
    })
}
function getPcButton(identifier, ipObject, padEndValues, requestProxyCheck) {
    const button = document.createElement("button");
    button.classList.add("bme-button")
    button.innerText = "CHECK";

    button.addEventListener("click", async (e) => {
        if (e.target.classList.contains("bme-button-disabled")) return;
        if (e.target.classList.contains("bme-button-redacted")) return;
        if (e.target.classList.contains("bme-pressed")) return;
        e.target.classList.add("bme-pressed")

        const ipMap = await getProxyCheckIpInfo([ipObject], false);
        ipObject.proxyCheck = ipMap.get(ipObject.ip) || null;
        convertIdentifier(identifier, ipObject, padEndValues, requestProxyCheck)
        e.target.remove();
    })

    return button;
}
function getPcDataElement(pc) {
    const element = document.createElement("div");
    element.classList.add("bme-ip-nest")

    const table = document.createElement("div");
    table.classList.add("bme-pc-details-table")

    const firstSectionContent = [
        { maxWidth: "20ch", labelWidth: "13ch", valueWidth: "7ch" },
        { label: "vpn:", ...trueOrFalse(pc.det.vpn, true, false) },
        { label: "proxy:", ...trueOrFalse(pc.det.proxy, true, false) },
        { label: "scraper:", ...trueOrFalse(pc.det.scraper, true, false) },
        { label: "tor:", ...trueOrFalse(pc.det.tor, true, false) },
        { label: "anonymous:", ...trueOrFalse(pc.det.anon, true, false) },
        { label: "compromised:", ...trueOrFalse(pc.det.compromised, true, false) },
    ]
    const secondSectionContent = [
        { maxWidth: "35ch", labelWidth: "10ch", valueWidth: "25ch" },
        { label: "score:", ...getScore(pc.det.score) },
        { label: "risk:", ...getScore(pc.det.risk, true) },
        { label: "zone:", value: `${pc.loc.continent} | ${pc.loc.countryCode} | ${pc.loc.regionCode}` },
        { label: "county:", value: pc.loc.countryName },
        { label: "region:", value: pc.loc.regionName },
        { label: "city:", value: pc.loc.cityName },
    ]

    const host = pc.net.host?.substring(0, 40) || null;
    const thirdSectionContent = [
        { maxWidth: "55ch", labelWidth: "10ch", valueWidth: "45ch" },
        { label: "ASN:", value: pc.net.asn },
        { label: "ISP:", value: pc.net.isp?.substring(0, 40) },
        { label: "Org:", value: pc.net.org?.substring(0, 40) },
        { label: "Host:", value: String(host), className: "bme-ip-host", title: String(host) },
        { label: "Range:", value: pc.net.range, className: "bme-ip-range", title: pc.net.range },
        { label: "Type:", value: pc.net.type },
    ]
    table.append(
        getPcInfoSection(firstSectionContent),
        getPcInfoSection(secondSectionContent),
        getPcInfoSection(thirdSectionContent)
    );

    element.append(table)
    return element;
}
function getPcInfoSection(rows) {
    const element = document.createElement("div");
    element.classList.add("bme-pc-details-row");
    element.style.setProperty("--width", rows[0].maxWidth);

    for (const row of rows) {
        if (!row.label) continue;

        const rowElement = document.createElement("div");
        rowElement.classList.add("bme-pc-details-column")

        const label = document.createElement("span");
        label.style.setProperty("--width", rows[0].labelWidth)
        label.innerText = row.label;

        const value = document.createElement("span");
        value.style.setProperty("--width", rows[0].valueWidth)
        value.innerText = row.value;
        if (row.className) value.classList.add(row.className);
        if (row.title) value.title = row.title;

        rowElement.append(label, value);
        element.append(rowElement);
    }

    return element;
}
function trueOrFalse(value, redColor, greenColor) {
    const className = value === redColor ? "bme-red-text" : value === greenColor ? "bme-green-text" : null;
    return { value, className }
}
function getScore(value, reverse = false) {
    let color = null;
    if (reverse) color = value > 75 ? "red" : value > 25 ? "yellow" : value >= 0 ? "green" : null;
    else color = value > 75 ? "green" : value > 25 ? "yellow" : value >= 0 ? "red" : null;

    if (!color) return value
    return { value, className: `bme-${color}-text` };
}
function getConType(pc) {
    if (pc === null) return null;

    const type = pc?.net?.type;
    if (type === "Hosting" || type === "Wireless") return { value: type, color: "bme-red-text" }
    return type || "N/A";
}

export async function highlightVpnIdentifiers(bmId, vpnSettings) {
    const identifierWrapper = (await getElementWhenAppears("css-11gv980", true));
    const identifierTable = identifierWrapper?.lastChild?.children;
    if (!identifierTable) console.error("BM-EXTRA: Failed to find identifier table.");

    for (const identifier of identifierTable) {
        const { type, id } = getIdentifierType(identifier);
        if (type !== "IP") continue;
        if (!identifier.firstChild?.innerText?.includes("This IP appears to belong to")) continue;
        makeItVpn(identifier, vpnSettings);
    }
    if (vpnSettings.threshold > -1) checkConnections(identifierTable, vpnSettings);
}
async function checkConnections(identifierTable, vpnSettings) {
    for (let i = 0; i < 50; i++) { //Wait till shared identifiers load
        if (!document.body.contains(identifierTable[0])) return;
        if (identifierTable[0].parentNode.innerText.includes("Identifier shared with")) break;
        await new Promise(r => { setTimeout(r, 150 * (i / 10)) })
    }

    for (const identifier of identifierTable) {
        const { type, id } = getIdentifierType(identifier);
        if (type !== "IP") continue;
        if (identifier.classList.contains("bme-vpn-identifier")) continue;

        const sharedText = identifier?.firstChild?.lastChild?.innerText?.trim();
        if (!sharedText.includes("Identifier shared with")) continue;

        let connectionCount = sharedText === "Identifier shared with more than 250 players." ?
            250 : Number(sharedText.split("with ")[1].split(" player")[0]);

        if (connectionCount > vpnSettings.threshold) makeItVpn(identifier, vpnSettings);
    }

}
function makeItVpn(identifier, vpnSettings) {
    identifier.classList.add("bme-vpn-identifier");
    identifier.style.background = vpnSettings.background;
    identifier.style.opacity = vpnSettings.opacity;
    if (vpnSettings.label) {
        const nodes = identifier.firstChild.childNodes;
        nodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE) node.remove(); });
    }
}

export async function displayAvatars(bmId, avatars, zoomable) {
    avatars = await avatars;

    const identifierWrapper = (await getElementWhenAppears("css-11gv980", true));
    const identifierTable = identifierWrapper?.lastChild?.children;
    if (!identifierTable) return console.error("BM-EXTRA: Failed to find identifierTable!");
    const nameElement = Array.from(identifierTable).find(item => item?.innerText?.trim() === "Name");
    if (!nameElement) return console.error("BM-EXTRA: Failed to locate nameElement!");

    if (avatars.length === 0) return;
    const avatarTitle = getIdentifierTableTitle("Avatar");
    nameElement.before(avatarTitle);

    avatars.forEach(item => {
        const payload = `
            <div title="${item.avatar}" class="css-8uhtka bme-avatar-container ${zoomable ? "bme-zoomable-avatar" : ""}">
                <div class="bme-avatar-placeholder">
                    <div>
                        <img src="https://avatars.fastly.steamstatic.com/${item.avatar}_full.jpg" class="bme-avatar-identifier">
                    </div>
                </div>
                <span class="css-q39y9k" title="${item.avatar}">${item.avatar}${item.avatarHits !== "N/A" ? ` | Seen on ${item.avatarHits < 101 ? item.avatarHits : "100+"} players` : ""}</span>
            </div>
        `;
        const avatarElement = getIdentifierTableElement("Avatar", payload, Number(item.lastSeen) * 1000)
        nameElement.before(avatarElement);
    })
}

export async function displaySteamLinks(bmId, steamLinks, loadData) {
    steamLinks = await steamLinks;
    if (steamLinks.length === 0) return;

    const identifierWrapper = (await getElementWhenAppears("css-11gv980", true));
    const identifierTable = identifierWrapper?.lastChild?.children;
    if (!identifierTable) return console.error("BM-EXTRA: Failed to find identifierTable!");
    const under = Array.from(identifierTable).find(item => {
        const text = item?.innerText?.trim();
        if (text === "IP" || text === "Name") return true;
        return false;
    });
    if (!under) return console.error("BM-EXTRA: Failed to locate ipTitle!");

    const discordTitle = getIdentifierTableTitle("Discord");
    under.insertAdjacentElement("beforebegin", discordTitle)

    steamLinks.forEach(link => {
        const payload = `
            <div title="${link.discordId}" class="css-8uhtka bme-unloaded-discord">
                <span class="css-q39y9k bme-discord-title" title="${link.discordId}">${link.discordId}</span>
            </div>
            <div class="bme-discord-wrapper bme-discord-unloaded" style="--main-height: 0px; --main-overflow: hidden;" title="${link.discordId}"></div>
        `;
        const element = getIdentifierTableElement("Discord", payload, Number(link.lastSeen), link.owners)
        discordTitle.insertAdjacentElement("afterend", element)
    })

    if (loadData) displayDiscordData();
}

function getIdentifierTableTitle(title) {
    const element = document.createElement("tr");
    element.classList.add("css-147tpna");

    const inner = document.createElement("th")
    inner.colSpan = 3;
    inner.innerText = title;
    element.append(inner);

    return element;
}
let _locale = null;
function getIdentifierTableElement(type, payload, lastSeen, meta) {
    const tr = document.createElement("tr");
    const locale = getLocale();

    const date = new Date(lastSeen);
    const dateStr = date.toLocaleDateString(locale);
    const timeStr = date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });

    //Heavily modified Standard BattleMetrics Identifier
    tr.innerHTML = `
        <td data-title="Identifier">
            ${payload}
        </td>
        <td data-title="Type">
            <div class="css-18s4qom">${type}</div>
            ${meta?.owners?.length > 0 ?
            `
                <button title="Show organizations that have this identifier." type="button" class="css-p43owu">
                    <i class="glyphicon glyphicon-info-sign"></i>
                </button>
            `: ``
        }
        </td>
        <td data-title="Last Seen">
            <time>${dateStr}</time><br />
            <time class="css-18s4qom">${timeStr}</time>
            <time class="css-18s4qom">${getTimeSpan(lastSeen)} ago</time>
        </td>
    `;

    const button = tr.querySelector("button");
    if (button) {
        button.addEventListener("click", () => {
            alert(`Organizations who owns this identifier:\n - ${meta.owners.join("\n - ")}`)
        })
    }

    return tr;
    function getLocale(params) {
        if (_locale) return _locale;

        const locale = JSON.parse(document.getElementById("storeBootstrap")?.innerText || null)?.state?.account?.locale || "en-gb";
        _locale = locale;
        return locale;
    }
}


export function displayDiscordData() {
    const token = JSON.parse(localStorage.getItem("BME_PLAYER_INSIGHT_API")).apiKey;


    const unloadedDiscords = Array.from(document.querySelectorAll(".bme-unloaded-discord"));
    const discordData = cache.discordUserData;
    if (discordData.length === 0) return;

    for (const discordElement of unloadedDiscords) {
        const discordId = discordElement.title;

        const data = discordData.find(item => item.user.id = discordId);
        
        const discordAvatar = document.createElement("div");
        discordAvatar.classList.add("bme-avatar-placeholder");
        discordAvatar.innerHTML = `
            <div>
                <img src="${data.user.avatar}?token=${token}" class="bme-avatar-identifier">
            </div>
        `;
        discordElement.insertAdjacentElement("afterbegin", discordAvatar);

        const span = discordElement.querySelector("span");

        const ccCount = data.guilds.filter(guild => guild.tags?.contains("cc")).length
        let mCount = 0;
        data.guilds.forEach(guild => mCount += Number(guild.messageCount));
        span.innerText = `${data.user.name} | ${data.user.displayName} | ${data.guilds.length} guilds | ${ccCount} cc | ${mCount} messages`;
        span.classList.add("bme-clickable");

        const discordUserElement = discordElement.parentNode.querySelector(".bme-discord-wrapper");
        fillDiscordUserElement(discordUserElement, data, token)

        let timeout = null;
        span.addEventListener("click", e => {
            if (timeout) clearTimeout(timeout);

            const target = e.target;
            const height = discordUserElement.scrollHeight;
            if (target.classList.contains("open")) {
                target.classList.remove("open");

                discordUserElement.style.setProperty("--main-height", `${height}px`)
                setTimeout(() => {
                    discordUserElement.style.setProperty("--main-height", "0px")
                    discordUserElement.style.setProperty("--main-overflow", "hidden")
                }, 5);
            }else{
                target.classList.add("open")
                discordUserElement.style.setProperty("--main-height", `${height}px`)
                timeout = setTimeout(() => {
                    discordUserElement.style.setProperty("--main-height", `fit-content`)
                    discordUserElement.style.setProperty("--main-overflow", "visible")
                }, 350);
            }
        })

    }
}