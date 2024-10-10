import { NS } from "@ns";
import { init_script } from "./lib/utils";
import { NetworkPipe } from "./lib/pipe";
import { RPCClient } from "./lib/free/rpc";
import { ServerInfo } from "./lib/free/server_info";


// FIXME: Re-wire to use the ns_server instead of file I/O.
// Also todo:
//  - Hacked server automation
//  - Purchased server automation
//  - More goals: CSEC, etc.
export async function main(ns: NS): Promise<void> {
    await init_script(ns)
    let server_conf
    try {
        server_conf = JSON.parse(ns.read('server_conf.txt'))
    }
    catch {
        return
    }

    // const pipe = new NetworkPipe(ns, server_conf.port_num)
    const rpc = new RPCClient(ns)
    for (; ;) {
        const cmd = await divine_command(server_conf, rpc)
        // let cmd = pipe.peek()
        // if (cmd == null) {
        //     cmd = await divine_command(server_conf, rpc)
        // }

        if (cmd == 'hack')
            await ns.hack(server_conf.hostname)
        else if (cmd == 'grow')
            await ns.grow(server_conf.hostname)
        else if (cmd == 'weak')
            await ns.weaken(server_conf.hostname)
        else if (cmd == 'quit')
            break
    }
}

async function divine_command(server_conf: ServerInfo, rpc: RPCClient): string {
    const max_mon = server_conf.moneyMax as number
    const mon = await rpc.call('getServerMoneyAvailable', server_conf.hostname) as number
    const min_sec = server_conf.minDifficulty as number
    const sec = await rpc.call('getServerSecurityLevel', server_conf.hostname) as number
    if (sec > min_sec + 5)
        return 'weak'
    if (mon < max_mon * 0.8)
        return 'grow'
    if (server_conf.requiredHackingSkill > await rpc.call('getHackingLevel'))
        return 'grow'
    return 'hack'
}