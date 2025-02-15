import { NS } from "@ns";
import { is_locked } from "./lock";

export async function manage(ns: NS, base_name: string, spend_factor = 0.1): Promise<void> {
    let ram = 2;

    const server_limit = ns.getPurchasedServerLimit()
    ns.print(`Server limit: ${server_limit}`)
    while (ns.getPurchasedServers().length < server_limit) {
        const budget = ns.getPlayer().money * spend_factor
        if (!is_locked(ns, "owned_servers")) {
            if (ns.getPurchasedServerCost(ram) <= budget) {
                const name = ns.purchaseServer(base_name, ram)
                ns.print(`Acquired a new server: ${name}`)
                ns.toast(`Acquired a new server: ${name}`);
            }
        }
        await ns.asleep(1000);
    }

    const max_ram = ns.getPurchasedServerMaxRam()
    ram = ns.getServerMaxRam(base_name)
    while (ram <= max_ram) {
        ns.print(`Ram = ${ram}...`)
        for (const server of ns.getPurchasedServers()) {
            ns.print(`Would like to upgrade ${server} to ${ram}GB`)
            for (; ;) {
                if (ns.getServerMaxRam(server) >= ram)
                    break
                const budget = ns.getPlayer().money * spend_factor
                if (!is_locked(ns, "owned_servers")) {
                    if (ns.getPurchasedServerUpgradeCost(server, ram) <= budget) {
                        if (ns.upgradePurchasedServer(server, ram)) {
                            ns.print(`Upgraded ${server} to ${ram}GB`)
                            ns.toast(`Upgraded ${server} to ${ram}GB`)
                            break
                        }
                    }
                }
                await ns.asleep(1000);
            }
        }
        ram *= 2
        if (ram >= 64) {
            ns.run('personal_server.js', { threads: 1 }, '-a', '-k')
            await ns.asleep(1000)
            ns.run('personal_server.js', { threads: 1 }, '-a', '-h')
        }
        else {
            ns.run('personal_server.js', { threads: 1 }, '-a', '-e', 'run_cmds.js', 'n00dles', '-n', Math.ceil(ram / 4))
        }
    }
}

export function print_costs(ns: NS) {
    for (let i = 0; i < 20; i++)
        ns.print("Server cost: ", 2 ** i, " = ", ns.formatNumber(ns.getPurchasedServerCost(2 ** i)));
    return
}

export function print_upgrade_costs(ns: NS) {
    for (let i = 0; i < 20; i++)
        ns.print("Upgrade cost: ", 2 ** i, " = ", ns.formatNumber(ns.getPurchasedServerUpgradeCost('mr_manager', 2 ** i)));
    return
}
