import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";
import { RPCServer } from "./lib/free/rpc";


export async function main(ns: NS): Promise<void> {
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
    }))

    ns.print('Creating server...')
    const server = new RPCServer(ns, 2)
    if (flags.c) {
        ns.print('Clearing old messages...')
        server.clear()
    }
    ns.print('Running...')
    await server.run(fn_map)
}
