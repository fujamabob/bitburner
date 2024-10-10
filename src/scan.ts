import { NS } from "@ns";
import { get_server_list, get_server_path, return_all } from "lib/scan";
import { init_script, Schema } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['p', false], // Print path
        ['a', false], // Print everything
        ['m', false], // Monitor target
    ] as Schema
    const [flags, args] = await init_script(ns, arg_schema)

    if (flags.p) {
        let path = 'home'
        for (const name of get_server_path(ns, args[0].toString())) {
            path += `; connect ${name}`
        }
        ns.tprint(path)
        return
    }
    if (args[0] !== undefined) {
        const servers = new Array<string>(...args as string[])
        if (flags.m) {
            ns.disableLog('ALL')
            ns.tail()
            for (; ;) {
                ns.clearLog()
                for (const server of servers)
                    print_server_info(ns, server, ns.print)
                await ns.asleep(1000)
            }
        }
        for (const server of servers)
            print_server_info(ns, server)
        return
    }

    let where = (ns: NS, name: string) => ns.hasRootAccess(name)
    if (flags.a)
        where = return_all
    ns.tprint(`where = ${where}`)
    for (const name of get_server_list(ns, "home", where)) {
        print_server_info(ns, name)
    }
}

function print_server_info(ns: NS, server: string, printer = ns.tprint) {
    if (ns.getServerMaxMoney(server) == 0)
        return
    if (ns.getServerMaxRam(server) == 0)
        return
    printer(`${server} info:`)
    if (!ns.hasRootAccess(server)) {
        printer(`  Hacking level required: ${ns.getServerRequiredHackingLevel(server)}`)
    }
    printer(`  Security: ${ns.formatNumber(ns.getServerSecurityLevel(server))} of ${ns.getServerMinSecurityLevel(server)}`)
    printer(`  Money: $${ns.formatNumber(ns.getServerMoneyAvailable(server))} of $${ns.formatNumber(ns.getServerMaxMoney(server))}`)
    printer(`  RAM: ${ns.getServerUsedRam(server)}GB used of ${ns.getServerMaxRam(server)}GB`)
}