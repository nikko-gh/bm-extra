# bm-extra
Chromium-based BattleMetrics extension providing quality-of-life features for Rust admins.

> **Warning:** BattleMetrics has been updating their site recently, so some features such as Ban Presets might be unstable or not work at all.

## Installation
1. Download: Go to the [Github repository](https://github.com/nikko-gh/bm-extra) and download the latest release.
2. Unpack the ZIP file.
3. Open Chrome Extensions Settings: Navigate to `chrome://extensions/` in Google Chrome.
4. Turn on `Developer mode` in the top right corner.
5. Click `Load Unpacked` and select the unpacked `bm-extra` directory.

> **Note:** Some features will not work properly on smaller screen sizes.

## Features:
- [Steam Friends](#steam-friends)
- [Ban Presets](#ban-presets)
- [Teaminfo](#teaminfo)
- [BM Information Panel](#bm-information-panel)
- [Identifier Panel](#identifier-panel)
- [Evasion Checker](#evasion-checker)
- [Privacy Keybinds](#privacy-keybinds)
- [Player Insight](#player-insight)
- [Streamer Mode Names](#streamer-mode-names)
- [Versatile Settings](#versatile-settings)

### Steam Friends
Displays the current Steam Friends of the player if you provided a [Steam API Key](https://steamcommunity.com/dev/apikey).

### Ban Presets
Set up your most common ban types so you can activate them with one click.

### Teaminfo
Displays basic information about a player's team status on the BattleMetrics RCON profile.
> Teaminfo is only available on a handful of organizations/servers. If you would like it added to yours, see [README_FOR_DEVS.md](README_FOR_DEVS.md). You can also contact me through [my Discord profile](https://discord.com/users/1306722481842819144) and I might implement it for you.

### BM Information Panel
Displays a new panel on the overview page called `BM Information`, which offers details to support your investigation.

### Identifier Panel
Reworks the identifier list on the player profile. It can display the player's avatar next to their name, swap the BattlEye GUID for the streamer mode name, and show the ISP and ASN behind every IP address. If you provide a [Proxycheck API Key](https://proxycheck.io/) it can show further detail about each IP.

### Evasion Checker
Helps you identify possible ban evaders more quickly and easily.

### Privacy Keybinds
Set a keybind which redacts IP addresses, Steam IDs and BattlEye GUIDs for a short period so you can take a screenshot of the page without leaking anything sensitive. There is a second keybind which converts every duration on the page into days.

### Player Insight
Extended player profiles are available through Player Insight for those who have access to it. Depending on your permissions it can display extra data such as the player's historic avatars.

### Streamer Mode Names
Resolves the Streamer Mode name of a player once you upload the name list from your own game files. Go to the settings and upload the file `C:\Program Files (x86)\Steam\steamapps\common\Rust\RustClient_Data\StreamingAssets\RandomUsernames.json`. The names may change with a game update, in which case they have to be uploaded again.

### Versatile Settings
Behind the whole extension there is a fully customizable settings page which allows you to decide which features you want to use and which features you don't.

## Requirements
The BattleMetrics API Key is required.
The other two keys are optional and only unlock the features they are listed under.
- **BattleMetrics API Key**: [Developer Page](https://www.battlemetrics.com/developers)
- **Steam API Key**: [Steam Web API documentation](https://steamcommunity.com/dev)
- **Proxycheck API Key**: [proxycheck.io](https://proxycheck.io/)

Your keys are stored locally in your own browser and can be set on the `API Keys` page of the settings.
