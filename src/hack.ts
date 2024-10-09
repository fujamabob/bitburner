import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const hostname = ns.getHostname()
    for (; ;) {
        try {
            await ns.hack(hostname)
        }
        catch {
            await ns.asleep(10000)
        }
    }
}
