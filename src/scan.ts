import { NS } from "@ns";
import { get_server_list, get_server_path, return_all } from "lib/scan";
import { init_script, Schema } from "./lib/utils";
import { list_files } from "./lib/file";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['p', false], // Print path
        ['a', false], // Print everything
        ['m', false], // Monitor target
        ['f', ''],    // File scan
    ] as Schema
    const [flags, args] = await init_script(ns, arg_schema)

    let where = (ns: NS, name: string) => ns.hasRootAccess(name)

    if (flags.p) {
        let path = 'home'
        for (const name of get_server_path(ns, args[0].toString())) {
            path += `; connect ${name}`
        }
        ns.tprint(path)
        return
    }
    if (flags.f) {
        ns.tprint(`Searching for files that match ${flags.f}`)
        const servers = new Array<string>(...get_server_list(ns, "home", where))
        servers.sort((a, b) => (ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b)))
        for (const name of servers) {
            const files = list_files(ns, name, flags.f as string)
            if (files.length > 0) {
                ns.tprint(`${name}:`)
                for (const file of files) {
                    ns.tprint(`  ${file.filename}`)
                }
            }
        }
        return
    }
    if (flags.m) {
        let servers
        if (args[0] !== undefined) {
            servers = new Array<string>(...args as string[])
        }
        else {
            where = (ns: NS, name: string) => ns.hasRootAccess(name) && (ns.getServerRequiredHackingLevel(name) <= ns.getPlayer().skills.hacking)

            servers = new Array<string>(...get_server_list(ns, "home", where))
            servers.sort((a, b) => (ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b)))
        }
        ns.disableLog('ALL')
        ns.tail()
        for (; ;) {
            ns.clearLog()
            for (const server of servers) {
                print_server_info2(ns, server, ns.print)
            }
            await ns.asleep(1000)
        }

    }

    if (args[0] !== undefined) {
        const servers = new Array<string>(...args as string[])
        for (const server of servers)
            print_server_info(ns, server)
        return
    }

    if (flags.a)
        where = return_all
    const servers = new Array<string>(...get_server_list(ns, "home", where))
    servers.sort((a, b) => (ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b)))
    for (const name of servers) {
        print_server_info(ns, name)
    }
    ns.tprint(`Number of servers: ${servers.length}`)
}

function print_server_info(ns: NS, server: string, printer = ns.tprint) {
    const info = ns.getServer(server)
    if (info.moneyMax === undefined || info.moneyMax == 0)
        return
    // if (info.maxRam == 0)
    //     return
    printer(`${server} info:`)
    printer(`  Hacking level required: ${info.requiredHackingSkill}`)
    printer(`  Security: ${ns.formatNumber(info.hackDifficulty ?? -1)} of ${info.minDifficulty}`)
    printer(`  Money: $${ns.formatNumber(info.moneyAvailable ?? 0)} of $${ns.formatNumber(info.moneyMax ?? 0)}`)
    printer(`  RAM: ${info.ramUsed}GB used of ${info.maxRam}GB`)
    printer(`  Grow rate: ${info.serverGrowth}, max $/s = ${ns.formatNumber((info.moneyMax ?? 0) / ns.getHackTime(server))}`)
}

function print_server_info2(ns: NS, server: string, printer = ns.tprint) {
    const info = ns.getServer(server)
    if (info.moneyMax === undefined || info.moneyMax == 0)
        return
    let prefix = ''
    if (info.moneyMax == info.moneyAvailable) {
        prefix = "\u001b[33m"
        if (info.minDifficulty == info.hackDifficulty)
            prefix = "\u001b[32m"
    }

    printer(`${prefix}${server.padEnd(20)}\t${ns.formatNumber(info.hackDifficulty ?? -1, 0).padEnd(2)} of ${ns.formatNumber(info.minDifficulty ?? -1, 0).padEnd(2)}\t$${ns.formatNumber(info.moneyAvailable ?? 0)} of $${ns.formatNumber(info.moneyMax ?? 0)}`)
}