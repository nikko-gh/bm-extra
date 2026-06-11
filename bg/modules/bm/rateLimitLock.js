export async function rateLimitLock(current) {
    if (current < 175) await new Promise(r => { setTimeout(r, 1000) })
    if (current < 125) await new Promise(r => { setTimeout(r, 4000) })
    if (current < 100) await new Promise(r => { setTimeout(r, 5000) })
    if (current < 75) await new Promise(r => { setTimeout(r, 10000) })
    if (current < 25) await new Promise(r => { setTimeout(r, 30000) })
    return;
}