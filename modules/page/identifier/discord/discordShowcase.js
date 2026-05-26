import { talkToBackgroundScript } from "../../../misc.js";
import { cache } from "../../cache/cache.js";
import { getDiscordTimestamp, getMessageElement } from "./discordUserElement.js";

export function getDiscordChannelShowcase(guildId, channelId, messageId, message) {
    const messages = [];

    const element = document.createElement("div");
    element.classList.add("bme-dc-showcase-wrapper")
    element.addEventListener("click", e => {
        document.body.classList.remove("bme-scroll-lock")
        if (!e.target.classList.contains("bme-dc-showcase-wrapper")) return;

        element.classList.remove("bme-showcase-visible");

        setTimeout(() => {
            e.target.remove();
        }, 250);
    })

    element.appendChild(getShowcase(guildId, channelId, messageId, message))

    setTimeout(() => { element.classList.add("bme-showcase-visible") }, 15);
    return element;
}

function getShowcase(guildId, channelId, messageId, message) {
    const element = document.createElement("div");
    element.classList.add("bme-dc-showcase");

    const focusMsg = getMessageElement(message.name, getDiscordTimestamp(message.messageId), message.avatar, [message.content], message.token);
    focusMsg.classList.add("bme-msg-focus")

    element.innerHTML = `
        <div class="bme-dc-showcase-header">
            <img class="bme-load-img" id="bme-dc-guild-icon">
            <p class="bme-load-text" id="bme-dc-guild-name"></p>
            <p class="bme-load-text" id="bme-dc-channel-name"></p>
        </div>
        <div id="bme-showcase-messages" data-guild-id="${guildId}" data-channel-id="${channelId}" data-message-id="${messageId}">
            ${Array.from({ length: 25 }).map(i => getEmptyMessageStr()).join("")}
            ${focusMsg.outerHTML}
            ${Array.from({ length: 25 }).map(i => getEmptyMessageStr()).join("")}
        <div>
    `;
    focusOnMessage(element.querySelector(".bme-msg-focus"))

    requestAndCacheData([guildId, channelId, messageId], messageId, "around", message.token, message);
    return element;
}
function getEmptyMessageStr() {
    return `
        <div class="bme-dc-message-element bme-dc-padding-left">
            <img>
            <div>
                <p class="bme-load-text" style="--width: 140px; --height: 14px;"></p>
                <p class="bme-load-text" style="--width: 500px; --height: 10px;"></p>
            </div>
        </div>
    `
}
function loadMoreButton(group, type, message, token) {    
    const button = document.createElement("button");
    button.classList.add("bme-showcase-load-more")

    button.addEventListener("click", () => {
        if (button.classList.contains("bme-active-button")) return;
        button.classList.add("bme-active-button");

        const messageId = message.messageId;
        requestAndCacheData(group, messageId, type, token);

        button.innerText = "Loading messages...";
    })
    button.innerText = "Load more messages!";
    return button;
}



const discordCache = {
    data: {},
    users: new Map()
}
async function requestAndCacheData(group, focusMsgId, type, token, baseMsg) {
    const id = `${group[0]}-${group[1]}-${group[2]}`;
    if (type === "around" && discordCache.data[id])
        return requestAnimationFrame(() => {
            return requestAndFillShowcase(group, token, focusMsgId);
        })


    const data = await talkToBackgroundScript("BME_DISCORD_MESSAGES", `${type}/${group[0]}/${group[1]}/${focusMsgId}`, token);

    if (!discordCache.data[id]) discordCache.data[id] = {};
    discordCache.data[id].channel = data.channel;
    discordCache.data[id].guild = data.guild;

    for (const user of data.users)
        if (!discordCache.users.has(user.id))
            discordCache.users.set(user.id, user);


    if (!discordCache.data[id].messages) discordCache.data[id].messages = [];
    if (baseMsg){
        discordCache.data[id].messages.push({ guildId: group[0], channelId: group[1], messageId: group[2], content: baseMsg.content, author: baseMsg.author })

        const item = cache.discordUserData.find(item => item.user.id === baseMsg.author);        
        discordCache.users.set(item.user.id, {
            avatar: item.user.avatar,
            name: item.user.name,
            displayName: item.user.displayName,
            id: item.user.id,
        })
    } 
    for (const message of data.messages) discordCache.data[id].messages.push(message);

    discordCache.data[id].messages.sort((a, b) => {
        return Number(a.messageId) - Number(b.messageId);
    });

    requestAndFillShowcase(group, token, focusMsgId);
}
function requestAndFillShowcase(group, token, focusMsgId) {
    const id = `${group[0]}-${group[1]}-${group[2]}`;

    const data = discordCache.data[id];

    const guildName = document.querySelector("#bme-dc-guild-name");
    guildName.innerText = data.guild.name;

    const guildIcon = document.querySelector("#bme-dc-guild-icon");
    if (data?.guild?.icon && guildIcon) guildIcon.src = `https://cdn.discordapp.com/icons/${data.guild.guildId}/${data.guild.icon}.png`

    const channelName = document.querySelector("#bme-dc-channel-name");
    channelName.innerText = data.channel.name;

    const messageContainer = document.querySelector("#bme-showcase-messages");
    messageContainer.innerText = "";

    messageContainer.appendChild(loadMoreButton(group, "before", data.messages[0], token));

    let focus = null;
    let prevMsgs = [];
    for (let i = 0; i < data.messages.length + 1; i++) {
        const msg = data.messages[i] || { fake: "yes" };

        const prev = prevMsgs[0];
        if (!prev) { prevMsgs.push(msg); continue; }
        if (msg.author === prev.author) { prevMsgs.push(msg); continue; }

        const contents = prevMsgs.map(item => item.content);
        const user = discordCache.users.get(prev.author) || null;

        const msgElement = getMessageElement(
            user?.displayName || user?.name || "",
            getDiscordTimestamp(prev.messageId),
            user?.avatar, contents, token
        )
        msgElement.dataset.messageId = prev.messageId;

        if (prevMsgs.find(item => item.messageId === focusMsgId)) focus = msgElement;
        messageContainer.appendChild(msgElement)

        prevMsgs = [msg];
    }
    messageContainer.appendChild(loadMoreButton(group, "after", data.messages[data.messages.length - 1], token) );

    if (focus) focusOnMessage(focus);
}


export function focusOnMessage(msg) {
    requestAnimationFrame(() => {
        if (msg) {
            msg.scrollIntoView({
                behavior: "instant",
                block: "center",
            });

            msg.classList.add("bme-focus")
        }
    });
}