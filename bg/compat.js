//Chrome only exposes the browser namespace from 148 onwards
//Own module so it runs before bg.js imports anything that uses it
globalThis.browser ??= globalThis.chrome;
