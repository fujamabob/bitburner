import { is_locked } from "./lock";
import { ns } from "./types";

export async function manage(base_name: string, spend_factor = 0.1): Promise<void> {
    let ram = 4;

    print_costs()

    const servers = new Array<OwnedServer>()
    for (const server of ns.getPurchasedServers()) {
        servers.push(new OwnedServer(server, 'foodnstuff'))
    }
    for (const server of servers) {
        await server.run()
    }

    while (ns.getPurchasedServers().length < 25) {
        const budget = ns.getPlayer().money * spend_factor
        if (!is_locked(ns, "owned_servers")) {
            if (ns.getPurchasedServerCost(ram) <= budget) {
                const name = ns.purchaseServer(base_name, ram)
                ns.print(`Acquired a new server: ${name}`)
                ns.toast(`Acquired a new server: ${name}`);
                const server = new OwnedServer(name, 'foodnstuff')
                await server.run()
            }
        }
        await ns.asleep(10000);
    }

    const max_ram = ns.getPurchasedServerMaxRam()
    ram *= 2
    while (ram <= max_ram) {
        ns.print(`Ram = ${ram}...`)
        for (const server of ns.getPurchasedServers()) {
            if (ns.getServerMaxRam(server) >= ram)
                continue
            ns.print(`Would like to upgrade ${server} to ${ram}GB`)
            for (; ;) {
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
    }
}

export function print_costs() {
    for (let i = 0; i < 20; i++)
        ns.print("Server cost: ", 2 ** i, " = ", ns.formatNumber(ns.getPurchasedServerCost(2 ** i)));
    return
}

export function print_upgrade_costs() {
    for (let i = 0; i < 20; i++)
        ns.print("Upgrade cost: ", 2 ** i, " = ", ns.formatNumber(ns.getPurchasedServerUpgradeCost('mr_manager', 2 ** i)));
    return
}

class OwnedServer {
    name: string
    target: string
    conf_data
    ram: number

    constructor(name: string, target: string) {
        this.name = name
        this.target = target
        this.ram = ns.getServerMaxRam(this.name)
        const conf_file = `/data/servers/${this.target}.txt`
        const data = ns.read(conf_file)
        this.conf_data = JSON.parse(data)
    }

    async run() {
        if (!ns.isRunning("run_cmds.js", this.name)) {
            ns.scp(`/data/servers/${this.target}.txt`, this.target)
            ns.mv(this.target, `/data/servers/${this.target}.txt`, "server_conf.txt")
            ns.scp("run_cmds.js", this.name)
            ns.scp(ns.ls("home", "lib"), this.name)
            ns.exec("run_cmds.js", this.name, { threads: this.ram / 2 })
            ns.spawn("manage.js", { spawnDelay: 10 })
        }
    }
}
