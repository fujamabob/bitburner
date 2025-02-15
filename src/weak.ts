import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['d', 0],    // Minimum time delta, in ms
    ] as Schema
    const [flags, args] = await init_script(ns, arg_schema)

    const hostname = args[0] as string
    const min_sec = ns.getServerMinSecurityLevel(hostname)
    while (ns.getServerSecurityLevel(hostname) > min_sec) {
        await ns.weaken(hostname, { additionalMsec: flags.d as number })
    }
}
