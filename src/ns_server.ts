import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";
import { RPCServer } from "./lib/free/rpc";
import * as scan from "./lib/scan";
import * as server_info from "./lib/free/server_info";


let GNS: NS

function get_server_list(root?: string, where?: scan.FilterFunction) {
    return new Array<string>(...scan.get_server_list(GNS, root, where))
}

function get_server_info(name: string) {
    return server_info.get_server_info(GNS, name)
}

export async function main(ns: NS): Promise<void> {
    GNS = ns
    const arg_schema = [
        ['c', false], // Clear the queue
    ] as Schema
    const [flags,] = await init_script(ns, arg_schema)

    const fn_map = new Map(Object.entries({
        'scp': ns.scp,
        'exec': ns.exec,
        'getServerSecurityLevel': ns.getServerSecurityLevel,
        'getServerMoneyAvailable': ns.getServerMoneyAvailable,
        'read': ns.read,
        'ls': ns.ls,
        'isRunning': ns.isRunning,
        'getHackTime': ns.getHackTime,
        'getHackingLevel': ns.getHackingLevel,
        'tprint': ns.tprint,
        'get_server_list': get_server_list,
        'get_server_info': get_server_info,
    }))

    ns.print('Creating server...')
    const server = new RPCServer(ns, 2)
    if (flags.c) {
        ns.print('Clearing old messages...')
        server.clear()
    }
    ns.print('Running... 1')
    await server.run(fn_map)
}
