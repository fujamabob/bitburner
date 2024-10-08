import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const hostname = ns.args[0] as string
    for (; ;) {
        await ns.weaken(hostname)
        await ns.grow(hostname)
    }
}
