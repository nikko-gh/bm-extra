# bm-extra for developers
Certain features work specifically with organizations that expose parts of their internal systems, allowing the extension to natively support features such as ***teaminfo*** and ***account linking***. However, any developer can implement these features for their own organization.

## Teaminfo:
When you open the profile of someone who is currently playing, or recently played on a server which belongs to an organization listed in `/modules/page/cache/teaminfo.js`, the organization's `getTeamInfo()` function will be called to request the teaminfo string which looks like this, by default:
```
ID: 1

steamID           username  online leader 
76561100000000001 teammate1               
76561100000000002 teammate2 x             
76561100000000003 teammate3 x      x      
76561100000000004 teammate4               
```
This string is processed and used to display the current team of the player on the sidebar.
```js
class ExampleOrganization {
    id = "1234";

    static {
       organizations.push(new this());
    }
    
    /**
     * Function that returns the response of the `teaminfo` command from a specific server.
     * @param {String} steamId - Steam ID(steamID64) of the target player
     * @param {Number} serverId - Battlemetrics Server ID where the command should run
     * @param {String} token - Battlemetrics Access Token for the API
     * @returns {String}
     */
    async getTeamInfo(steamId, serverId, token) {
       return ""; // return the actual raw teaminfo here
    }
}
```
You can use this template to implement support for any organization that is not supported by default.

In some cases, the string returned by the `teaminfo` command may be:
- `Player is not in a team` - Player doesn't belong to a team
- `Player not found` -  Player cannot be found by the server, likely never joined in this wipe yet.

If any error occurs while you are requesting the teaminfo, simply return `"error"`. It will be processed as a generic failed attempt.

## Account Linking

Some organizations have their own account linking systems, which can be accessed by default and displayed via `/bg/modules/orgSteamLink.js`. If you are interested, refer to the documentation there for implementation details.