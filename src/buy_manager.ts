import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    while (ns.purchaseServer('mr_manager', 16) == "")
        await ns.asleep(1000)
    ns.spawn("manage.js", { spawnDelay: 0 })
}
