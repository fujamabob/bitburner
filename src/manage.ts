import { NS, ScriptArg } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog('asleep')
    for (; ;) {
        ensure_running(ns, 'ns_server.js', 'mr_manager')
        ensure_running(ns, 'crack.js', 'mr_manager', '-m')
        ensure_running(ns, 'server_manager.js', 'mr_manager')
        await ns.asleep(10000)
    }
}

function ensure_running(ns: NS, script_name: string, hostname: string, ...args: ScriptArg[]): boolean {
    if (!ns.isRunning(script_name, hostname, ...args)) {
        ns.scp(ns.ls("home", "/lib"), hostname, 'home')
        ns.scp(script_name, hostname, 'home')
        const pid = ns.exec(script_name, hostname, {}, ...args)
        if (pid == 0)
            return false
    }
    return true
}