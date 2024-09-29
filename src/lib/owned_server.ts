import { is_locked } from "./lock";
import { ns } from "./types";

export async function manage(base_name: string, spend_factor: number = 0.1): Promise<void> {
    var ram = 4;

    print_costs()
    while (ns.getPurchasedServers().length < 25) {
        var budget = ns.getPlayer().money * spend_factor
        if (!is_locked(ns, "owned_servers")) {
            if (ns.getPurchasedServerCost(ram) <= budget) {
                var name = ns.purchaseServer(base_name, ram)
                ns.print(`Acquired a new server: ${name}`)
                ns.toast(`Acquired a new server: ${name}`);
            }
        }
        await ns.asleep(10000);
    }

    const max_ram = ns.getPurchasedServerMaxRam()
    ram *= 2
    while (ram <= max_ram) {
        ns.print(`Ram = ${ram}...`)
        for (let server of ns.getPurchasedServers()) {
            if (ns.getServerMaxRam(server) >= ram)
                continue
            var upgraded = false
            ns.print(`Would like to upgrade ${server} to ${ram}GB`)
            while (!upgraded) {
                var budget = ns.getPlayer().money * spend_factor
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
    }
}

export function print_costs() {
    for (let i = 0; i < 20; i++)
        ns.print("Server cost: ", 2 ** i, " = ", ns.formatNumber(ns.getPurchasedServerCost(2 ** i)));
    return
}