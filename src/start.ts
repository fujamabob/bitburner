import { NS } from "@ns";
import { unlock } from "lib/lock";

export async function main(ns: NS): Promise<void> {
    unlock(ns, "hacknet")
    ns.run("manage.js")
}
