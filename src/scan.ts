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
    const servers = new Array<string>(...get_server_list(ns, "home", where))
    for (const name of servers) {
        print_server_info(ns, name)
    }
    ns.tprint(`Number of servers: ${servers.length}`)
}

function print_server_info(ns: NS, server: string, printer = ns.tprint) {
    const info = ns.getServer(server)
    if (info.moneyMax === undefined || info.moneyMax == 0)
        return
    if (info.maxRam == 0)
        return
    printer(`${server} info:`)
    printer(`  Hacking level required: ${info.requiredHackingSkill}`)
    printer(`  Security: ${ns.formatNumber(info.hackDifficulty ?? -1)} of ${info.minDifficulty}`)
    printer(`  Money: $${ns.formatNumber(info.moneyAvailable ?? 0)} of $${ns.formatNumber(info.moneyMax ?? 0)}`)
    printer(`  RAM: ${info.ramUsed}GB used of ${info.maxRam}GB`)
    printer(`  Grow rate: ${info.serverGrowth}, max $/s = ${ns.formatNumber((info.moneyMax ?? 0) / ns.getHackTime(server))}`)
}