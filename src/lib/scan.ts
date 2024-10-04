import { NS } from "@ns";

interface FilterFunction {
    (ns: NS, server: string): boolean
}

export function get_server_list(ns: NS, root = "home", where: FilterFunction = return_all): IterableIterator<string> {
    let servers = new Array<string>()
    for (const server of ns.scan(root)) {
        servers = servers.concat(scan_tree(ns, server, root, where))
    }
    return servers.values()
}

export function get_server_path(ns: NS, target: string): IterableIterator<string> {
    let servers = new Array<string>()
    for (const server of ns.scan("home")) {
        servers = servers.concat(scan_tree(ns, server, "home", return_all, target))
    }
    return servers.values()
}


function scan_tree(ns: NS, root: string, from: string, where: FilterFunction, target?: string): Array<string> {
    let servers = new Array<string>()
    if (where(ns, root)) {
        servers.push(root)
    }

    for (const server of ns.scan(root)) {
        if (server == from)
            continue
        servers = servers.concat(scan_tree(ns, server, root, where, target))
    }
    if (typeof target == "string")
        if (servers.indexOf(target?.toString()) == -1)
            return new Array<string>()
    return servers
}

export function return_all(_ns: NS, _server: string) {
    return true
}
