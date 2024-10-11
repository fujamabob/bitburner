import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.run('hacknet.js', { preventDuplicates: true }, '-m', '-s', 1, '-p', -1)
    ns.spawn("/bootstrap/goal3.js", { spawnDelay: 0 })
}
