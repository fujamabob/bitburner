import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";
import { recommend_weak } from "./lib/hack";

export async function main(ns: NS) {
    const arg_schema = [
        ['i', Infinity],  // iterations before exiting
        ['t', 5],     // Distance from security minimum
        ['r', false], // Generate a recommendation and exit
        ['f', false], // Force action, desipte recommendations
    ] as Schema
    const [flags, args] = init_script(ns, arg_schema)
    if (args.length == 0) {
        ns.tprint("Error: must specify a server name")
        return
    }
    const server = args[0].toString();
    if (flags.r) {
        const recommendation = recommend_weak(server, flags.t)
        ns.tprint(recommendation.describe())
        return
    }

    for (let i = 0; i < flags.i; i++) {
        if (!flags.f && !recommend_weak(server, flags.t).recommend)
            break;
        await ns.weaken(server)
    }
    const recommendation = recommend_weak(server, flags.t)
    ns.print(recommendation.describe())
}


