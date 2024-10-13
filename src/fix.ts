import { NS } from "@ns";
import { get_server_list } from "./lib/scan";

export async function main(ns: NS): Promise<void> {
    const max_threads = (ns.args[0] ?? 64) as number
    const cores = ns.getServer(ns.getHostname()).cpuCores

    const should_hack = (ns: NS, name: string) => {
        if (!ns.hasRootAccess(name))
            return false
        if (ns.getServerMaxMoney(name) <= 0)
            return false
        return true
    }
    const servers = new Array<string>(...get_server_list(ns, 'home', should_hack))
    for (const hostname of servers) {
        const min_sec = ns.getServerMinSecurityLevel(hostname)
        const sec = ns.getServerSecurityLevel(hostname)
        const max_mon = ns.getServerMaxMoney(hostname)
        const mon = Math.max(ns.getServerMoneyAvailable(hostname), 1)
        const sec_per_thread = ns.weakenAnalyze(1, cores)

        let mon_threads = Math.ceil(ns.growthAnalyze(hostname, max_mon / mon, cores))
        let sec_threads = Math.ceil((sec - min_sec) / sec_per_thread)

        ns.tprint(`ns.run("weak.js", { threads: Math.min(${sec_threads}, ${max_threads}) }, ${hostname}`)
        ns.tprint(`ns.run("grow.js", { threads: Math.min(${mon_threads}, ${max_threads}) }, ${hostname}`)

        sec_threads = Math.min(sec_threads, max_threads)
        mon_threads = Math.min(mon_threads, max_threads)
        if (sec_threads > 0)
            ns.run("weak.js", { threads: sec_threads }, hostname)
        if (mon_threads > 0)
            ns.run("grow.js", { threads: mon_threads }, hostname)
    }
}
