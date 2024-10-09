import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const hostname = ns.args[0] as string
    const max_mon = ns.getServerMaxMoney(hostname)
    while (ns.getServerMoneyAvailable(hostname) < max_mon) {
        await ns.grow(hostname)
    }
}
