//Every battlemetrics request goes through here so a rejected key is noticed in one place
export const bmKeyState = { status: "ok" }; //ok, missing or invalid

export function setBmKeyState(status) {
    if (bmKeyState.status === status) return;

    bmKeyState.status = status;
    window.dispatchEvent(new CustomEvent("BME_BM_KEY_STATE"));
}

export async function bmFetch(url, count = 0) {
    if (count > 2) return "FAILED_TO_FETCH";
    try {
        const resp = await fetch(url);

        //A 401 is always the key, retrying it just wastes requests
        if (resp?.status === 401) {
            setBmKeyState("invalid");
            return "INVALID_API_KEY";
        }

        if (resp?.status === 429) await new Promise(r => { setTimeout(r, 5000) });
        if (resp?.status === 403) return "Forbidden";
        if (resp?.status === 400) return "Bad request";
        if (resp?.status !== 200) throw new Error(`Failed to fetch | Status: ${resp?.status}`);

        setBmKeyState("ok");
        return await resp.json();
    } catch (error) {
        console.log(`BME-EXTRA: ${error}`);
        return bmFetch(url, count + 1);
    }
}

//Cheapest authenticated call there is, used to check a key before saving it
export async function validateBmKey(key) {
    if (!key) return "missing";

    try {
        const resp = await fetch(`https://api.battlemetrics.com/servers?page[size]=1&filter[rcon]=true&access_token=${key}`);
        if (resp?.status === 401) return "invalid";
        if (resp?.status !== 200) return "error";

        return "ok";
    } catch (error) {
        console.error(`BM-EXTRA: Failed to validate the battlemetrics key. | ${error.message}`);
        return "error";
    }
}
