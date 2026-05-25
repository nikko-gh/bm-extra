/**
 * This function is intended to be implemented by organizations who want to
 * integrate their own data source into the extension.
 *
 * Fetch linked Discord Ids for a given Steam ID
 *
 * The returned data will be displayed on the Identifier page
 * 
 * @param {string} steamId - SteamID64 of the user
 *
 * @returns {Array<{
 *   discordId: string,
 *   lastSeen: number,
 *   owner: string,
 *   attached: string[]
 * }>}
 *
 * @example
 * return [
 *   {
 *     discordId: "1094976844027134113",
 *     lastSeen: 1773067973707,
 *     owner: "Organization Name",
 *     attached: ["76561198345792209", "76561198345792210"]
 *   }
 * ];
 * 
 * @remarks
 * - `discordId` must be a valid Discord user ID (string)
 * - `lastSeen` must be a Unix timestamp in milliseconds
 * - `owner` the owner of the data
 * - `attached` Array of Strings, where each of them is a Steam ID that this identifier also belongs to
 * 
 * - Do NOT merge entries from different sources
 *   If the same `discordId` exists in multiple datasets, return each entry separately.
 *   Example:
 *     { discordId: "1094976844027134113", lastSeen: 1775206569243, owner: "Super Cool Rust Org", attached: [] }
 *     { discordId: "1094976844027134113", lastSeen: 1770108969246, owner: "Another Rust Org", attached: ["76561198345792209", "76561198345792210"] }
 *
 * - Always return an array
 * - Return an empty array on failure or when no data exists
 * - Authentication is up to you to solve on your own endpoint
 */
export async function getOrgSteamLinks(steamId) {
    /*
    try {
        const res = await fetch(`https://your-linking-service.com/links/${steamId}`);
        const data = await res.json();

        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
    */

    return [];
}