import { NS } from "@ns";

interface FilterFunction {
    (ns: NS, server: string): boolean
}

export function get_server_list(ns: NS, root: string = "home", where: FilterFunction = return_all): IterableIterator<string> {
    var servers = new Array<string>()
    for (let server of ns.scan(root)) {
        servers = servers.concat(scan_tree(ns, server, root, where))
    }
    return servers.values()
}

export function get_server_path(ns: NS, target: string): IterableIterator<string> {
    var servers = new Array<string>()
    for (let server of ns.scan("home")) {
        servers = servers.concat(scan_tree(ns, server, "home", return_all, target))
    }
    return servers.values()
}


function scan_tree(ns: NS, root: string, from: string, where: FilterFunction, target?: string): Array<string> {
    var servers = new Array<string>()
    if (where(ns, root)) {
        servers.push(root)
    }

    for (let server of ns.scan(root)) {
        if (server == from)
            continue
        servers = servers.concat(scan_tree(ns, server, root, where, target))
    }
    if (typeof target == "string")
        if (servers.indexOf(target?.toString()) == -1)
            return new Array<string>()
    return servers
}

export function return_all(ns: NS, server: string) {
    return true
}
