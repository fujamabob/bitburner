import { NS } from "@ns";
import { get_server_list } from "./lib/scan";

export async function main(ns: NS): Promise<void> {
    let i = 1
    for (const name of get_server_list(ns)) {
        const server = ns.getServer(name)
        const server_data = Object.assign({}, server, {
            port_num: i++
        })
        const filename = `/data/servers/${name}.txt`
        ns.write('server_conf.txt', JSON.stringify(server_data), "w")
        ns.scp('server_conf.txt', name)
        ns.mv("home", 'server_conf.txt', filename)
    }
    ns.spawn("manage.js", { preventDuplicates: true, spawnDelay: 100 })
}
