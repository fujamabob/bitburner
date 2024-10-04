import { NS } from "@ns";
import { get_server_list, get_server_path, return_all } from "lib/scan";
import { has_root } from "./lib/root";
import { init_script, Schema } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['p', false], // Print path
        ['a', false], // Print everything
    ] as Schema
    const [flags, args] = await init_script(ns, arg_schema)

    const server = args[0] as string | undefined
    if (flags.p) {
        let path = 'home'
        for (const name of get_server_path(ns, args[0].toString())) {
            path += `; connect ${name}`
        }
        ns.tprint(path)
        return
    }
    if (typeof server != "undefined") {
        print_server_info(ns, server)
        return
    }

    let where = has_root
    if (flags.a)
        where = return_all
    ns.tprint(`where = ${where}`)
    for (const name of get_server_list(ns, "home", where)) {
        print_server_info(ns, name)
    }
}

function print_server_info(ns: NS, server: string) {
    if (ns.getServerMaxMoney(server) == 0)
        return
    if (ns.getServerMaxRam(server) == 0)
        return
    ns.tprint(`${server} info:`)
    if (!ns.hasRootAccess(server)) {
        ns.tprint(`  Hacking level required: ${ns.getServerRequiredHackingLevel(server)}`)
    }
    ns.tprint(`  Security: ${ns.formatNumber(ns.getServerSecurityLevel(server))} of ${ns.getServerMinSecurityLevel(server)}`)
    ns.tprint(`  Money: $${ns.formatNumber(ns.getServerMoneyAvailable(server))} of $${ns.formatNumber(ns.getServerMaxMoney(server))}`)
    ns.tprint(`  RAM: ${ns.getServerUsedRam(server)}GB used of ${ns.getServerMaxRam(server)}GB`)
}