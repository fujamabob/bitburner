import { NS } from "@ns";
import { RPCClient } from "./lib/free/rpc";
import { ServerInfo } from "./lib/free/server_info";

export async function main(ns: NS): Promise<void> {
    const max_threads = ns.args[0] ?? 64
    const rpc = new RPCClient(ns)
    const servers = await rpc.call('get_server_list') as string[]
    for (const server of servers) {
        const info = await rpc.call('get_server_info', server) as ServerInfo
        if ((info.moneyMax ?? 0) <= 0 || info.minDifficulty === undefined || !info.hasAdminRights)
            continue
        ns.print(`Weakening ${server}`)
        const weak_amt = 0.05
        const threads = Math.ceil((ns.getServerSecurityLevel(server) - info.minDifficulty) / weak_amt)
        ns.tprint(`ns.run("weak.js", { preventDuplicates: true, threads: ${threads} / ${max_threads} }, ${server})`)
        if (threads == 0)
            continue
        ns.run("weak.js", { threads: Math.min(threads, max_threads as number) }, server)
    }
}
