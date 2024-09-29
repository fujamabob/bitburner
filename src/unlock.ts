import { NS } from "@ns";
import { unlock } from "lib/lock";

export async function main(ns: NS): Promise<void> {
    if (typeof ns.args[0] == "undefined") {
        ns.tprint("Please specify a lock name")
        return
    }

    unlock(ns, ns.args[0].toString())
}
