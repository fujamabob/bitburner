import { NS } from "@ns";
import { lock } from "lib/lock";

export async function main(ns: NS): Promise<void> {
    if (typeof ns.args[0] == "undefined") {
        ns.tprint("Please specify a lock name")
        return
    }

    lock(ns, ns.args[0].toString())
}
