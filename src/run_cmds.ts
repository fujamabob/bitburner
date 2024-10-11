import { NS } from "@ns";
import { init_script } from "./lib/utils";
// import { NetworkPipe } from "./lib/pipe";
import { RPCClient } from "./lib/free/rpc";
import { ServerInfo } from "./lib/free/server_info";


// FIXME: Re-wire to use the ns_server instead of file I/O.
// Also todo:
//  - Hacked server automation
//  - Purchased server automation
//  - More goals: CSEC, etc.
export async function main(ns: NS): Promise<void> {
    await init_script(ns)
    const hostname = ns.args[0] as string

    // const pipe = new NetworkPipe(ns, server_conf.port_num)
    const rpc = new RPCClient(ns)
    const server_conf = await rpc.call('get_server_info', hostname) as ServerInfo
    let cmd = 'grow'
    let targets = {
        best_money: server_conf.moneyAvailable as number,
        best_security: server_conf.hackDifficulty as number,
    }
    for (; ;) {
        [cmd, targets] = await incremental_cleanup(ns, hostname, rpc, targets)
        // const cmd = await divine_command(ns, server_conf, rpc)
        // let cmd = pipe.peek()
        // if (cmd == null) {
        //     cmd = await divine_command(server_conf, rpc)
        // }

        if (cmd == 'hack')
            await ns.hack(hostname)
        else if (cmd == 'grow')
            await ns.grow(hostname)
        else if (cmd == 'weak')
            await ns.weaken(hostname)
        else if (cmd == 'quit')
            break
    }
}

interface BestSoFar {
    best_money: number
    best_security: number
}

async function incremental_cleanup(ns: NS, hostname: string, rpc: RPCClient, targets: BestSoFar): Promise<[string, BestSoFar]> {
    const new_info = await rpc.call('get_server_info', hostname) as ServerInfo
    const min_sec = new_info.minDifficulty as number
    const sec = new_info.hackDifficulty as number
    const max_mon = new_info.moneyMax as number
    const mon = new_info.moneyAvailable as number
    const hack = new_info.requiredHackingSkill as number
    let cmd = 'hack'
    if (hack > (await rpc.call('getHackingLevel') as number)) {
        if (sec > min_sec)
            cmd = 'weak'
        cmd = 'grow'
        ns.print(`Hacking is too low; will run ${cmd} instead`)
    }
    // Note: we want to be strictly better than the n-2 measurement.
    //       Testing >= the n-1 measurement means we just grow until
    //       in the good range.
    if (sec > targets.best_security && sec > min_sec + 5) {
        // Security has increased and is outside of the "good" range
        ns.print(`Weakening: ${ns.formatNumber(sec)} > ${ns.formatNumber(targets.best_security)} of ${min_sec}`)
        cmd = 'weak'
    }
    else if (mon < targets.best_money && mon < max_mon * 0.8) {
        // Money has decreased and is outside of the "good" range
        ns.print(`Growing: ${ns.formatNumber(mon)} < ${ns.formatNumber(targets.best_money)} of ${ns.formatNumber(max_mon)}`)
        cmd = 'grow'
    }

    // NOTE: Other processes may affect these numbers. We measure without assumptions.
    if (sec < targets.best_security)
        targets.best_security = sec
    if (mon > targets.best_money)
        targets.best_money = mon
    return [cmd, targets]
}

async function _divine_command(ns: NS, server_conf: ServerInfo, rpc: RPCClient): Promise<string> {
    const max_mon = server_conf.moneyMax as number
    const mon = await rpc.call('getServerMoneyAvailable', server_conf.hostname) as number
    const min_sec = server_conf.minDifficulty as number
    const sec = await rpc.call('getServerSecurityLevel', server_conf.hostname) as number
    if (sec > (min_sec + 5)) {
        ns.print('Weakening because security is too high')
        return 'weak'
    }
    if (mon < (max_mon * 0.8)) {
        ns.print('Growing because money is too low')
        return 'grow'
    }
    if (server_conf.requiredHackingSkill === undefined)
        return 'grow'
    if (server_conf.requiredHackingSkill > (await rpc.call('getHackingLevel') as number)) {
        ns.print('Growing because hacking is too low')
        return 'grow'
    }
    return 'hack'
}