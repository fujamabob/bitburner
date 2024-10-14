import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.run('hacknet.js', { preventDuplicates: true }, '-m')
    ns.spawn("/bootstrap/goal3.js", { spawnDelay: 0 })
}
