import { NS } from "@ns";
import { FixHackStrategy } from "lib/hack";

export async function main(ns: NS) {
    if (typeof ns.args[0] == "undefined" || typeof ns.args[1] == "undefined") {
        ns.tprint("Usage: run fix.js <hostname> <RAM>")
        return
    }
    const server = ns.args[0].toString();
    const ram = ns.args[1].valueOf() as number;

    const strategy = new FixHackStrategy(server, ram)
    if (strategy.is_valid())
        strategy.execute(ns.getHostname())
}