import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";
import { RPCClient } from "./lib/free/rpc";
import { ServerInfo } from "./lib/free/server_info";
import { get_server_list } from "./lib/scan";


export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['d', 100],   // Minimum time delta, in ms
        ['g', 0.1],   // Proportion of server money to take
        ['n', false], // Dry-run
        ['v', false], // Verbose
    ] as Schema
    const [flags, args] = await init_script(ns, arg_schema)

    const min_delta = flags.d as number

    const rpc = new RPCClient(ns)

    if (args.length > 0) {
        const hostname = args[0] as string
        await run_hwgw(ns, hostname, flags, rpc, min_delta)
    }
    else {
        const should_hack = (ns: NS, name: string) => {
            if (!ns.hasRootAccess(name))
                return false
            if (ns.getServerMaxMoney(name) <= 0)
                return false
            return true
        }
        const servers = new Array<string>(...get_server_list(ns, 'home', should_hack))
        servers.sort((a, b) => (ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b)))
        for (const hostname of servers) {
            await run_hwgw(ns, hostname, flags, rpc, min_delta)
        }
    }
}

async function run_hwgw(ns: NS, hostname: string, flags, rpc, min_delta) {
    const server_conf = await rpc.call('get_server_info', ns.getHostname()) as ServerInfo

    const grow_time = Math.ceil(ns.getGrowTime(hostname))
    const hack_time = Math.ceil(ns.getHackTime(hostname))
    const weak_time = Math.ceil(ns.getWeakenTime(hostname))
    if (flags.v) {
        ns.tprint(`Grow time = ${grow_time}`)
        ns.tprint(`Hack time = ${hack_time}`)
        ns.tprint(`Weak time = ${weak_time}`)
    }

    const grow_factor = 1 / (1 - (flags.g as number))
    const hack_threads = Math.ceil(ns.hackAnalyzeThreads(hostname, ns.getServerMaxMoney(hostname) * (flags.g as number)))
    if (hack_threads == -1) {
        ns.tprint('Cannot hack that much money')
        return
    }
    const weak_amt = ns.weakenAnalyze(1, server_conf.cpuCores)
    let threads = hack_threads
    // hack-weak
    if (hack_time + min_delta < weak_time) {
        const hack_amt = ns.hackAnalyzeSecurity(hack_threads, hostname)
        const weak_threads = Math.ceil(hack_amt / weak_amt)
        threads += weak_threads
        const sleep_time = weak_time - min_delta - hack_time

        if (flags.v) {
            ns.tprint('Hack-Weak')
            ns.tprint(`  Hack threads: ${hack_threads}`)
            ns.tprint(`  Hack amt total: ${hack_amt}`)
            ns.tprint(`  Weak amt per thread: ${weak_amt}`)
            ns.tprint(`  Weak threads: ${weak_threads}`)
            ns.tprint(`  Sleep time: ${sleep_time}`)
        }
        if (!flags.n) {
            ns.run('basic_hack.js', { threads: hack_threads }, '-d', sleep_time, hostname)
            ns.run('basic_weak.js', { threads: weak_threads }, hostname)
        }
    }
    else {
        ns.tprint('Hack time is not way lower than weak time.')
        return
    }

    // grow-weak
    if (grow_time + min_delta < weak_time) {
        const grow_threads = Math.ceil(ns.growthAnalyze(hostname, grow_factor, server_conf.cpuCores)) * 2
        const grow_amt = ns.growthAnalyzeSecurity(grow_threads, undefined, server_conf.cpuCores)
        const weak_threads = Math.ceil(grow_amt / weak_amt) + 2
        threads += grow_threads + weak_threads
        const sleep_time = weak_time - min_delta - grow_time

        if (flags.v) {
            ns.tprint('Grow-Weak')
            ns.tprint(`  Grow threads: ${grow_threads}`)
            ns.tprint(`  Grow amt total: ${grow_amt}`)
            ns.tprint(`  Weak amt per thread: ${weak_amt}`)
            ns.tprint(`  Weak threads: ${weak_threads}`)
            ns.tprint(`  Sleep time: ${sleep_time}`)
        }
        if (!flags.n) {
            ns.run('basic_grow.js', { threads: grow_threads }, '-d', sleep_time + 2 * min_delta, hostname)
            ns.run('basic_weak.js', { threads: weak_threads }, '-d', 2 * min_delta, hostname)
        }
    }
    else {
        ns.tprint('Grow time is not way lower than weak time.')
        return
    }

    const mon_p_sec = ns.getServerMaxMoney(hostname) * (flags.g as number) / (weak_time / 1000)
    ns.tprint(`Total threads: ${threads}`)
    ns.tprint(`Money per sec: ${ns.formatNumber(mon_p_sec)}`)
    ns.tprint(`Money per sec per thread: ${ns.formatNumber(mon_p_sec / threads)} `)
}
