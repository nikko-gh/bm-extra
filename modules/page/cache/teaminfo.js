import { talkToBackgroundScript } from "../../misc.js";

export const organizations = [];

class Atlas {
    id = "41737";

    static {
        organizations.push(new this());
    }

    async getTeamInfo(steamId, serverId, token) {
        const data = await talkToBackgroundScript("BME_ATLAS_TEAMINFO", `${steamId}-${serverId}`, token);
        const result = data?.data?.attributes?.result[0]?.children[1]?.children[0]?.children[0]?.reference.result;
        if (!result) {
            console.error(`Failed to request teaminfo | Status: ${resp.status} | Result: ${result}`);
            return "error";
        }

        return result;
    }
}

class BestRust {
    id = "18611";

    static {
        organizations.push(new this());
    }

    async getTeamInfo(steamId, serverId, token) {
        const roles = JSON.parse(document.getElementById("storeBootstrap").innerText)?.state?.account?.rconRoles;
        const brRoles = roles.filter(role => role.org_id === this.id);

        const triggers = [];
        brRoles.forEach(role => {
            for (const trigger in role.permissions.triggers || {}) triggers.push(trigger)
        })

        const payload = getBrPayload(triggers, steamId);
        const resp = await fetch(`https://api.battlemetrics.com/servers/${serverId}/command`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept-Version": "^0.1.0"
            },
            body: JSON.stringify({
                data: payload,
            })
        })

        if (resp.status !== 200) {
            console.error(`Failed to request teaminfo | Status: ${resp.status}`);
            return "error";
        }

        const data = await resp.json();

        const result = data.data?.attributes?.result[0]?.children[1]?.children[0]?.children[0]?.reference.result
        if (!result) {
            console.error(`Failed to request teaminfo | Status: ${resp.status} | Result: ${result}`);
            return "error";
        }

        return result;

        function getBrPayload(triggers, steamId) {
            if (triggers.includes("edb0be86-6f5e-4e4b-a655-5fcecd4af11f")) {
                return {
                    type: "rconCommand",
                    attributes: {
                        command: "edb0be86-6f5e-4e4b-a655-5fcecd4af11f",
                        options: {
                            command: "teaminfo",
                            steamid: steamId,
                            format: " "
                        }
                    }
                }
            } else if (triggers.includes("4cc932cc-8a86-440f-95aa-d8d99a8ac6ec")) {
                return {
                    type: "rconCommand",
                    attributes: {
                        command: "4cc932cc-8a86-440f-95aa-d8d99a8ac6ec",
                        options: {
                            command: "teaminfo",
                            steamid: steamId,
                        }
                    }
                }

            }
        }
    }
}

class BattleZone {
    id = "29251";

    static {
        organizations.push(new this());
    }

    async getTeamInfo(steamId, serverId, token) {
        const resp = await fetch(`https://api.battlemetrics.com/servers/${serverId}/command`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept-Version": "^0.1.0"
            },
            body: JSON.stringify({
                data: {
                    type: "rconCommand",
                    attributes: {
                        command: "raw",
                        options: {
                            raw: `teaminfo ${steamId}`
                        }
                    }
                }
            })
        })

        if (resp.status !== 200) {
            console.error(`Failed to request teaminfo | Status: ${resp.status}`);
            return "error";
        }

        const data = await resp.json();
        const result = data.data?.attributes?.result
        if (!result) {
            console.error(`Failed to request teaminfo | Status: ${resp.status} | Result: ${result}`);
            return "error";
        }

        return result;
    }
}


// class ExampleOrganization {
//     id = "1234";
// 
//     static {
//        organizations.push(new this());
//     }
//
//     /**
//      * Function that returns the response of the `teaminfo` command from a specific server.
//      * @param {String} steamId - Steam ID(steamID64) of the target player
//      * @param {Number} serverId - Battlemetrics Server ID where the command should run
//      * @param {String} token - Battlemetrics Access Token for the API
//      * @returns {String}
//      */
//     async getTeamInfo(steamId, serverId, token) {
//        return ""; // return the actual raw teaminfo here
//     }
// }
