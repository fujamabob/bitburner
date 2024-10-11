import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    if (!ns.serverExists('mr_manager')) {
        while (ns.purchaseServer('mr_manager', 16) == "")
            await ns.asleep(1000)
    }
    ns.run("manage.js", { preventDuplicates: true })
    ns.spawn("/bootstrap/goal2.js", { spawnDelay: 0 })
}
