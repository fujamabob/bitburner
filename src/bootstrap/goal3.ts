import { NS } from "@ns";
import * as owned_server from "../lib/owned_server";

export async function main(ns: NS): Promise<void> {
    // Goal #3: Begin personal server acquisition
    ns.tprint('Please buy some personal servers')
    await owned_server.manage(ns, 'fixer', 0.1)
}