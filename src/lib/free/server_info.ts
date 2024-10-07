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

export function get_server_info(ns: NS, name: string): ServerInfo | null {
    const data_path = get_server_info_path(name)
    const data = ns.read(data_path)
    if (data == "")
        return null
    try {
        return JSON.parse(data)
    }
    catch {
        return null
    }
}