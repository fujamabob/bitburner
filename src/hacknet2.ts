import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['m', false], // Manage in the background
    ] as Schema
    const [flags,] = await init_script(ns, arg_schema)

    if (flags.m) {
        ns.clearLog()
        ns.disableLog('asleep')
        ns.tail()
        for (; ;) {
            while (ns.hacknet.spendHashes("Sell for Money"));
            await ns.asleep(1000)
        }
    }
    else {
        ns.tprint(`Hashes available: ${ns.hacknet.numHashes} of ${ns.hacknet.hashCapacity}`)

        for (const name of ns.hacknet.getHashUpgrades()) {
            ns.tprint(name)
            ns.tprint(`  Cost  = ${ns.hacknet.hashCost(name)}`)
            ns.tprint(`  Level = ${ns.hacknet.getHashUpgradeLevel(name)}`)
        }
    }
}
