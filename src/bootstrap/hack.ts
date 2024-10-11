import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const hostname = (ns.args[0] ?? ns.getHostname()) as string
    while (ns.getServerMoneyAvailable(hostname) > 0) {
        await ns.hack(hostname)
    }
}
