import { NS } from "@ns";
import { get_server_list } from "./lib/scan";
import { DARK_PLUS_THEME, GameUI } from "./lib/free/ui";
import { init_script } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    init_script(ns)
    GameUI.set_theme(DARK_PLUS_THEME)
    cache_server_info(ns)
    ns.spawn("manage.js", { preventDuplicates: true, spawnDelay: 100 })
}

function cache_server_info(ns: NS) {
    let i = 1
    for (const name of get_server_list(ns)) {
        const server = ns.getServer(name)
        const server_data = Object.assign({}, server, {
            port_num: i++,
            is_hack_target: server.moneyMax !== undefined && server.moneyMax > 0,
            is_personal: server.purchasedByPlayer,
            is_script_target: server.maxRam > 0,
        })
        // TODO: Remove the variable data (e.g. available money?)
        const filename = `/data/servers/${name}.txt`
        ns.write('server_conf.txt', JSON.stringify(server_data), "w")
        ns.scp('server_conf.txt', name)
        ns.mv("home", 'server_conf.txt', filename)
    }
}