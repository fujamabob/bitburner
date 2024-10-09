import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog('asleep')
    for (; ;) {
        if (!ns.isRunning('ns_server.js', 'mr_manager')) {
            ns.scp(ns.ls("home", "/lib"), 'mr_manager', 'home')
            ns.scp('ns_server.js', 'mr_manager', 'home')
            ns.exec('ns_server.js', 'mr_manager')
        }
        await ns.asleep(10000)
    }
}
