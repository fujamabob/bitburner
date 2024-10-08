import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.run("crack.js", { preventDuplicates: true }, "-m")
}
