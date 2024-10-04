import { NS } from "@ns";

export function lock(ns: NS, name: string): boolean {
    const lock_file = `/lock/${name}.txt`;
    if (is_locked(ns, name))
        return false
    ns.write(lock_file, "locked", "w")
    return true
}

export function unlock(ns: NS, name: string): boolean {
    const lock_file = `/lock/${name}.txt`;
    if (!is_locked(ns, name))
        return false
    ns.write(lock_file, "unlocked", "w")
    return true
}

export function is_locked(ns: NS, name: string): boolean {
    const lock_file = `/lock/${name}.txt`;
    return ns.read(lock_file) == "locked";
}