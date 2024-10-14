import { NS } from "@ns";
import * as owned_server from "../lib/owned_server";

export async function main(ns: NS): Promise<void> {
    ns.disableLog('asleep')
    // Goal #3: Begin personal server acquisition
    await owned_server.manage(ns, 'fixer', 0.1)
}