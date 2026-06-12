import { errorString, getKey, sendResponse } from "../../bg.js";

export async function sendProxyCheckData(ips, tabId, returnData) {
    const key = getKey("BME_PROXY_CHECK_API_KEY");
    if (!key) return sendResponse(errorString.noKey);

    const resp = await fetch(`https://proxycheck.io/v3/${ips}?key=${key}`);
    if (resp?.status !== 200) {
        console.error(`Failed to request data from proxycheck | ${apiKey.substring(0, 10)}... | Status: ${resp?.status}`);
        return sendResponse(tabId, returnData, errorString.failedToFetch);
    }

    const data = await resp.json();
    sendResponse(tabId, returnData, data);
}