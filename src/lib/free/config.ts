/** Configuration file management. */

import { NS } from "@ns"

export function get_config_path(name: string): string {
    return `/config/${name}.txt`
}

export function write_config(ns: NS, name: string, obj: unknown) {
    const config_path = get_config_path(name)
    ns.write(config_path, JSON.stringify(obj), 'w')
}

export function read_config(ns: NS, name: string): unknown | null {
    const config_path = get_config_path(name)
    const data = ns.read(config_path)
    if (data == "")
        return null

    try {
        return JSON.parse(data)
    }
    catch {
        return null
    }
}
