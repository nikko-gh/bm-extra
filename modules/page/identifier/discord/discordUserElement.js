import { getTimeSpan, makeDropDownMenu, talkToBackgroundScript } from "../../../misc.js";
import { focusOnMessage, getDiscordChannelShowcase } from "./discordShowcase.js";

const meta = {};
const PAGE_COUNT = 15;


export function fillDiscordUserElement(element, data, token) {
    meta.token = token;
    meta.data = data;


    element.classList.remove("bme-discord-unloaded");

    element.innerHTML = `<p>Discord ID: ${data.user.id}</p>`

    const accountAge = getDiscordTimestamp(data.user.id);
    element.innerHTML += `<p>Account Age: ${getTimeSpan(accountAge)}</p>`;

    let firstSeen = data.guilds[0].firstSeen;
    data.guilds.forEach(guild => { if (guild.firstSeen < firstSeen) firstSeen = guild.firstSeen })
    element.innerHTML += `<p>First Seen: ${getTimeSpan(firstSeen)}</p>`;

    let lastSeen = data.guilds[0].lastSeen;
    data.guilds.forEach(guild => { if (guild.lastSeen > lastSeen) lastSeen = guild.lastSeen })
    element.innerHTML += `<p>Last Seen: ${getTimeSpan(lastSeen)}</p>`;

    element.innerHTML += `<h3>Avatars(${data.user.historicAvatars.length}):</h3>
    <div class="bme-discord-avatar-container">
        ${data.user.historicAvatars.map(item => `<img class="bme-discord-avatar" src="${item.avatar}?token=${token}" />`).join("")}
    </div>`

    element.innerHTML += `<h3>Names(${data.user.historicNames.length}):</h3><div class="bme-discord-name-container"></div>`
    const nameContainer = element.querySelector(".bme-discord-name-container");
    for (const item of data.user.historicNames) {
        const nameElement = document.createElement("p");
        nameElement.innerText = `${item.name}`.padEnd(32).replaceAll(" ", "\u00A0");
        nameElement.innerHTML += ` | Last seen: ${getTimeSpan(item.lastSeen)} ago`;

        nameContainer.append(nameElement);
    }


    element.innerHTML += `<h3>Guilds(${data.guilds.length}):</h3>`;

    for (const guild of data.guilds) {
        const guildElement = document.createElement("div");
        guildElement.classList.add("bme-dc-guild-container")

        const header = document.createElement("div");
        header.classList.add("bme-dc-guild-header")

        const guildDetails = [
            `${guild.userCount} users`.padEnd(12).replaceAll(" ", "\u00A0"),
            `${guild.roles.length} Roles`.padEnd(8).replaceAll(" ", "\u00A0"),
            `${guild.messageCount} Messages`.padEnd(14).replaceAll(" ", "\u00A0"),
            `LS: ${getTimeSpan(guild.lastSeen)} ago`
        ]
        header.innerHTML = `
            <img src="${guild.avatar}">
            <div>
                <h4>${guild.name}</h4>
                <p>${guildDetails.join(" | ")}<p>
            <div>`;

        const body = document.createElement("div");
        body.classList.add("bme-dc-guild-body")
        makeDropDownMenu(header, body, 250, "", true)

        const roleTitle = document.createElement("h4")
        roleTitle.innerText = "Roles:";
        body.append(roleTitle);

        const roles = document.createElement("div");
        roles.classList.add("bme-dc-roles-container")
        body.append(roles)



        let longestRole = 0;
        let longestTs = 0;
        for (const item of guild.roles) {
            const inner = new DOMParser().parseFromString(`${getTimeSpan(item.lastSeen)} ago`, 'text/html');
            
            if (longestTs < inner.body.innerText.length) longestTs = inner.body.innerText.length;
            if (longestRole < item.role.length) longestRole = item.role.length;
        }

        for (const item of guild.roles) {
            const role = document.createElement("p");

            role.innerHTML += `${getTimeSpan(item.lastSeen)} ago`;
            if (role.innerText.length < longestTs) {
                role.innerHTML += '&nbsp;'.repeat(longestTs - role.innerText.length);
            }            
            
            role.innerHTML += ` |&nbsp;&nbsp;&nbsp;`;
            role.innerText += `${item.role}`;
            if (item.role.length < longestRole) {
                role.innerHTML += '&nbsp;'.repeat(longestRole - item.role.length);
            }

            role.innerHTML += `&nbsp;&nbsp;&nbsp;| ${item.count}x seen`;            
            roles.append(role);
        }

        const messageContainer = document.createElement("div");
        messageContainer.classList.add("bme-dc-messages-container")

        const lastMessagesTitle = document.createElement("h4")
        lastMessagesTitle.innerText = "Last Messages:";
        body.append(lastMessagesTitle);
        if (guild.messageCount > 15) {
            const selector = getPageSelector(guild, messageContainer, data, token)
            body.appendChild(selector)
        }

        const messages = guild.lastMessages[0] ?? [];
        if (messages.length > 0) fillMessageContainer(messageContainer, messages, guild.id)

        body.append(messageContainer)
        guildElement.append(header, body)
        element.append(guildElement);
    }
}

export function getMessageElement(username, timestamp, avatar, contents, token) {
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("bme-dc-message-element", "bme-dc-padding-left")

    messageWrapper.innerHTML = `<img src="${avatar ? `${avatar}?token=${token}` : `https://cdn.discordapp.com/embed/avatars/3.png`}">`
    const txtContainer = document.createElement("div");

    const locale = JSON.parse(document.getElementById("storeBootstrap").innerHTML)?.state?.account?.locale ?? "en-us";
    const d = new Date(timestamp);
    const year = d.toLocaleString(locale, { year: 'numeric' });
    const month = d.toLocaleString(locale, { month: '2-digit' });
    const day = d.toLocaleString(locale, { day: '2-digit' });
    const dateStr = `${year}-${month}-${day}`;

    const name = document.createElement("p");
    name.innerText = username;
    name.innerHTML += ` <span>${dateStr} | ${getTimeSpan(timestamp)} ago</span>`
    txtContainer.append(name);

    for (const content of contents) {
        const message = document.createElement("p");
        message.innerText = content;
        txtContainer.append(message);
    }

    messageWrapper.append(txtContainer);
    return messageWrapper
}

function getPageSelector(guild, msgContainer, data, token, activeButton = 0) {
    const selector = document.createElement("div");
    selector.id = `bme-selector-${guild.id}`
    selector.classList.add("bme-dc-messages-selector")

    const maxButtons = Math.floor(guild.messageCount / PAGE_COUNT)+1;
    const buttonArray = getButtonRange(activeButton, maxButtons);

    let focus = null;
    for (const idx of buttonArray) {
        const button = document.createElement("button");
        button.innerHTML = idx+1;

        if (idx === activeButton) button.classList.add("bme-active-selector")

        button.addEventListener("click", e => {
            if (e.target.classList.contains("bme-active-selector")) return;
        
            const mainSelector = document.querySelector(`#bme-selector-${guild.id}`);
            getMessagesAndFillContainer(msgContainer, idx, guild, data.user.id, token);
            if (mainSelector) mainSelector.replaceWith(getPageSelector(guild, msgContainer, data, token, idx));
        })


        selector.appendChild(button);
    }
    return selector;

    function getButtonRange(active, maxButtons, limit = 15) {
        if (maxButtons <= limit) return Array.from({ length: maxButtons }, (i, idx) => idx);

        let start = active - Math.floor(limit / 2);
        let end = start + limit;

        if (start < 0) {
            start = 0;
            end = limit;
        }

        if (end > maxButtons) {
            end = maxButtons;
            start = maxButtons - limit;
        }

        return Array.from({ length: end - start }, (i, idx) => start + idx);
    }
}

async function getMessagesAndFillContainer(container, page, guild, userId, token) {
    const messages = guild.lastMessages[page];
    if (messages) return fillMessageContainer(container, messages, guild.id);

    const requestedMessages = await requestMessages(guild, page, userId, token)
    fillMessageContainer(container, requestedMessages, guild.id);

    async function requestMessages(guild, page, userId, token) {
        const messages = guild.lastMessages[page];
        if (messages) return messages;

        const requestedMessages = await talkToBackgroundScript("BME_DISCORD_MESSAGES", `last/${guild.id}/${userId}/${page}`, token)
        guild.lastMessages[page] = requestedMessages;
        return requestedMessages;
    }
}
function fillMessageContainer(container, messages, guildId) {
    container.innerHTML = "";
    const data = meta.data;
    const token = meta.token;

    for (const message of messages) {
        const messageWrapper = document.createElement("div");
        const channelName = document.createElement("p");
        channelName.innerText = `#${message.channelName}`;
        const messageElement = getMessageElement(data.user.displayName || data.user.name, getDiscordTimestamp(message.messageId), data.user.avatar, [message.content], token);
        messageElement.classList.add("bme-clickable");

        messageElement.addEventListener("click", e => {
            message.author = data.user.id;
            message.name = data.user.displayName || data.user.name;
            message.avatar = data.user.avatar;
            message.token = token,
                document.body.appendChild(getDiscordChannelShowcase(guildId, message.channelId, message.messageId, message))
            document.body.classList.add("bme-scroll-lock")
        })

        messageWrapper.append(channelName, messageElement);
        container.append(messageWrapper);
    }
}




export function getDiscordTimestamp(snowflake) {
    const DISCORD_EPOCH = 1420070400000n;
    return Number((BigInt(snowflake) >> 22n) + DISCORD_EPOCH);
}