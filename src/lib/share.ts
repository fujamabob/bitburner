import { ns } from "./types";

export function share(server: string, threads: number = 1) {
    ns.scp("share.js", server, "home");
    ns.exec("share.js", server, { threads: threads, preventDuplicates: true })
}

export function max_share(server: string) {
    var threads = Math.floor(ns.getServerMaxRam(server) / ns.getScriptRam("share.js"))
    if (threads > 0)
        share(server, threads)
}

export function stop_sharing(server: string) {
    ns.scriptKill("share.js", server)
}