import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";
import { manage } from "./lib/hacknet";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['m', false], // Manage in the background
        ['s', 0.1],   // Spend factor
        ['p', 0.0],   // Profit factor
    ] as Schema
    const [flags,] = await init_script(ns, arg_schema)

    if (flags.m) {
        ns.disableLog('ALL')
        ns.tail()
        await manage(ns, flags.s as number, flags.p as number)
    }
    else {
        const money = ns.getMoneySources().sinceInstall
        ns.tprint('Hacknet Information:')
        ns.tprint(`  Spent  : ${ns.formatNumber(money.hacknet_expenses)}`)
        ns.tprint(`  Earned : ${ns.formatNumber(money.hacknet)}`)
        ns.tprint(`  ROI    : ${ns.formatPercent((money.hacknet + money.hacknet_expenses) / -money.hacknet_expenses)}`)
    }
}
