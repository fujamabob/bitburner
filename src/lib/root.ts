import { NS } from "@ns";

export function needs_root(ns: NS, server: string): boolean {
    return !ns.hasRootAccess(server)
}

export function has_root(ns: NS, server: string): boolean {
    return ns.hasRootAccess(server)
}

export function is_hackable(ns: NS, server: string): boolean {
    if (ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel())
        return false

    switch (ns.getServerNumPortsRequired(server)) {
        case 5:
            if (!ns.fileExists("SQLInject.exe"))
                return false
        // fall through
        case 4:
            if (!ns.fileExists("HTTPWorm.exe"))
                return false
        // fall through
        case 3:
            if (!ns.fileExists("relaySMTP.exe"))
                return false
        // fall through
        case 2:
            if (!ns.fileExists("FTPCrack.exe"))
                return false
        // fall through
        case 1:
            if (!ns.fileExists("BruteSSH.exe"))
                return false
    }
    return true
}

export function hack(ns: NS, server: string): boolean {
    switch (ns.getServerNumPortsRequired(server)) {
        case 5:
            if (!ns.fileExists("SQLInject.exe"))
                return false
            ns.sqlinject(server)
        // fall through
        case 4:
            if (!ns.fileExists("HTTPWorm.exe"))
                return false
            ns.httpworm(server)
        // fall through
        case 3:
            if (!ns.fileExists("relaySMTP.exe"))
                return false
            ns.relaysmtp(server)
        // fall through
        case 2:
            if (!ns.fileExists("FTPCrack.exe"))
                return false
            ns.ftpcrack(server)
        // fall through
        case 1:
            if (!ns.fileExists("BruteSSH.exe"))
                return false
            ns.brutessh(server)
    }
    ns.nuke(server)
    return ns.hasRootAccess(server)
}