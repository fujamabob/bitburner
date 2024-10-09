import { NS, Server } from "@ns"

export interface ServerInfo extends Server {
    port_num: number
    is_hack_target: boolean
    is_personal: boolean
    is_script_target: boolean
}


function get_server_info_path(name: string): string {
    return `/data/servers/${name}.txt`
}

export function get_server_info(ns: NS, name: string): ServerInfo {
    const data_path = get_server_info_path(name)
    const data = ns.read(data_path)
    try {
        return JSON.parse(data)
    }
    catch {
        return cache_server_info(ns, name)
    }
}

function cache_server_info(ns: NS, name: string): ServerInfo {
    let i = 1
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
    ns.mv(ns.getHostname(), 'server_conf.txt', filename)
    return server_data
}