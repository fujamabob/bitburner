import { NS } from "@ns";
import { ServerInfo } from "./free/server_info";

export function needs_root(server: ServerInfo): boolean {
    return !has_root(server)
}

export function has_root(server: ServerInfo): boolean {
    return server.hasAdminRights
}

export function hack_server(ns: NS, server_name: string): boolean {
    if (ns.hasRootAccess(server_name))
        return true

    try {
        ns.brutessh(server_name)
        ns.ftpcrack(server_name)
        ns.relaysmtp(server_name)
        ns.httpworm(server_name)
        ns.sqlinject(server_name)
    }
    catch {
        // The things we do to avoid ram usage, eh?
    }
    try {
        ns.nuke(server_name)
    }
    catch {
        return false
    }

    return ns.hasRootAccess(server_name)
}