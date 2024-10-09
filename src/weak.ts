import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const hostname = ns.args[0] as string
    const min_sec = ns.getServerMinSecurityLevel(hostname)
    while (ns.getServerSecurityLevel(hostname) > min_sec) {
        await ns.weaken(hostname)
    }
}
