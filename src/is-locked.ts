import { NS } from "@ns";
import { is_locked } from "lib/lock";

export async function main(ns: NS): Promise<void> {
    if (typeof ns.args[0] == "undefined") {
        ns.tprint("Please specify a lock name")
        return
    }

    const name = ns.args[0].toString()
    if (is_locked(ns, name)) {
        ns.tprint(`${name} is locked`)
    }
    else {
        ns.tprint(`${name} is unlocked`)
    }
}
