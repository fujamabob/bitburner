import { NS } from "@ns";
import { get_server_list } from "./lib/scan";
import { init_script, Schema } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
    ] as Schema
    const [, args] = await init_script(ns, arg_schema)
    ns.disableLog('ALL')
    ns.enableLog('weaken')

    const should_weak = (ns: NS, name: string) => {
        if (ns.getServerMinSecurityLevel(name) == ns.getServerSecurityLevel(name))
            return false
        if (!ns.hasRootAccess(name))
            return false
        return true
    }

    const index = (args[0] ?? 0) as number
    for (; ;) {
        const servers = new Array<string>(...get_server_list(ns, 'home'))
        servers.sort((a, b) => (ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b)))

        let count = 0
        for (const hostname of servers) {
            if (count < index) {
                count++
                continue
            }
            if (should_weak(ns, hostname))
                await ns.weaken(hostname)
        }
        await ns.asleep(1000)
    }
}
