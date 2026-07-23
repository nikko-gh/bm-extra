import { errorString, getKey, sendResponse } from "../../bg.js";

export async function sendProxyCheckData(ips, tabId, returnData) {
    const key = await getKey("BME_PROXY_CHECK_API_KEY");

    let url = `https://proxycheck.io/v3/${ips}`;
    if (key) url += `?key=${key}`;

    const resp = await fetch(url);
    if (resp?.status !== 200) {
        console.error(`Failed to request data from proxycheck | Status: ${resp?.status}`);
        return sendResponse(tabId, returnData, errorString.failedToFetch);
    }

    const data = await resp.json();
    sendResponse(tabId, returnData, data);
}
