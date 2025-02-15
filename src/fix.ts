import { NS } from "@ns";
import { get_server_list } from "./lib/scan";
import { init_script, Schema } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['weak', 64],   // Max weak threads
        ['grow', 64],   // Max grow threads
        ['p', false],   // Just print the needed threads
        ['u', false],   // Uncapped threads
        ['c', false],   // Continuous mode
        ['f', false],   // Fixed mode
        ['m', false],   // Managed mode
    ] as Schema
    const [flags, args] = await init_script(ns, arg_schema)
    if (flags.u) {
        flags.weak = flags.weak ? Infinity : 0
        flags.grow = flags.grow ? Infinity : 0
    }

    if (flags.m) {
        ns.disableLog('ALL')
        ns.tail()

        for (; ;) {
            ns.clearLog()
            await run_fix(ns, args, flags)
            await ns.asleep(60000)
        }
    }
    await run_fix(ns, args, flags)
}

async function run_fix(ns: NS, args, flags) {

    const cores = ns.getServer(ns.getHostname()).cpuCores

    const should_hack = (ns: NS, name: string) => {
        if (!ns.hasRootAccess(name)) {
            // ns.tprint(`Root access for ${name}: ${ns.hasRootAccess(name)}`)
            return false
        }
        if (ns.getServerMaxMoney(name) <= 0) {
            // ns.tprint(`Money for ${name}: ${ns.getServerMaxMoney(name)}`)
            return false
        }
        return true
    }
    const servers = new Array<string>(...get_server_list(ns, 'home', should_hack))
    servers.sort((a, b) => (ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b)))
    for (const hostname of servers) {
        if (args.length > 0) {
            if (!args.includes(hostname))
                continue
        }
        const min_sec = ns.getServerMinSecurityLevel(hostname)
        const sec = ns.getServerSecurityLevel(hostname)
        const max_mon = ns.getServerMaxMoney(hostname)
        const mon = Math.max(ns.getServerMoneyAvailable(hostname), 1)
        const sec_per_thread = ns.weakenAnalyze(1, cores)

        let mon_threads = Math.ceil(ns.growthAnalyze(hostname, max_mon / mon, cores))
        let sec_threads = Math.ceil((sec - min_sec) / sec_per_thread)

        ns.tprint(`ns.run("weak.js", { threads: Math.min(${sec_threads}, ${flags.weak}) }, ${hostname}`)
        ns.tprint(`ns.run("grow.js", { threads: Math.min(${mon_threads}, ${flags.grow}) }, ${hostname}`)

        if (!flags.p) {
            let weak_script = 'weak.js'
            let grow_script = 'grow.js'
            if (flags.c) {
                weak_script = 'basic_weak.js'
                grow_script = 'basic_grow.js'
            }
            if (flags.f) {
                sec_threads = flags.weak
                mon_threads = flags.grow
            }
            else {
                sec_threads = Math.min(sec_threads, flags.weak)
                mon_threads = Math.min(mon_threads, flags.grow)
            }

            if (sec_threads > 0)
                ns.run(weak_script, { threads: sec_threads }, hostname)
            if (mon_threads > 0)
                ns.run(grow_script, { threads: mon_threads }, hostname)
        }
    }
}
