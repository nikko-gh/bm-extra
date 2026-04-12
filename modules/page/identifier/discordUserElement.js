import { getTimeSpan, makeDropDownMenu } from "../../misc.js";

export function fillDiscordUserElement(element, data, token) {
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
        makeDropDownMenu(header, body, 150, "", true)
        
        const roleTitle = document.createElement("h4")
        roleTitle.innerText = "Roles:";
        body.append(roleTitle);
        
        const roles = document.createElement("div");
        roles.classList.add("bme-dc-roles-container")
        body.append(roles)

        for (const item of guild.roles) {
            const role = document.createElement("p");
            role.innerHTML = `${getTimeSpan(item.lastSeen)} ago | ${item.role}`;
            roles.append(role);
        }
        
        const lastMessagesTitle = document.createElement("h4")
        lastMessagesTitle.innerText = "Last Messages:";
        body.append(lastMessagesTitle);

        const messages = document.createElement("div");
        messages.classList.add("bme-dc-messages-container")
        for (const message of guild.lastMessages) {
            const messageWrapper = document.createElement("div");
            const channelName = document.createElement("p");
            channelName.innerText = `#${message.channelName}`;            
            const messageElement = getMessageElement(data.user.displayName || data.user.name, getDiscordTimestamp(message.messageId) ,data.user.avatar, [message.content], token);

            messageWrapper.append(channelName, messageElement);
            messages.append(messageWrapper);
        }
        
        body.append(messages)
        guildElement.append(header, body)
        element.append(guildElement);
    }
}

function getMessageElement(username, timestamp, avatar, contents, token) {
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("bme-dc-message-element", "bme-dc-padding-left")

    messageWrapper.innerHTML = `<img src="${avatar}?token=${token}">`
    const txtContainer = document.createElement("div");
    
    const name = document.createElement("p");
    name.innerText = username;
    name.innerHTML += ` <span>${getTimeSpan(timestamp)} ago</span>`
    txtContainer.append(name);

    for (const content of contents) {
        const message = document.createElement("p");
        message.innerText = content;
        txtContainer.append(content);
    }
    
    messageWrapper.append(txtContainer);
    return messageWrapper
}





function getDiscordTimestamp(snowflake) {
    const DISCORD_EPOCH = 1420070400000n;
    return Number((BigInt(snowflake) >> 22n) + DISCORD_EPOCH);
}