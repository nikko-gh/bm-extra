//Tightest barrier first, only one of these waits should run
export async function rateLimitLock(current) {
    if (current < 25) return await new Promise(r => { setTimeout(r, 30000) })
    if (current < 75) return await new Promise(r => { setTimeout(r, 10000) })
    if (current < 100) return await new Promise(r => { setTimeout(r, 5000) })
    if (current < 125) return await new Promise(r => { setTimeout(r, 4000) })
    if (current < 175) return await new Promise(r => { setTimeout(r, 1000) })
    return;
}