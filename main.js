console.log("EXTENSION: bm-extra loaded!")

//"load" takes too long, fires on the start to request cache fields properly
main(window.location.href)

//Actual first page load
window.addEventListener("__REACT_HYDRATED__", () => {main(window.location.href)});

//Extension should fire/refresh on page change
window.addEventListener("load", () => main(window.location.href))
navigation.addEventListener("navigate", async (event) => {
    main(event.destination.url);
});
//Extension should fire/refresh on page change

async function main(urlString) {
    const { router } = await import(chrome.runtime.getURL('./modules/page/router.js'));

    const url = new URL(urlString);
    router(url);
}