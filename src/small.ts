import { NS } from "@ns";

export async function main(ns: NS) {
    var server = ns.args[0].toString();
    var hack_iter = ns.args[1].valueOf() as number;
    var grow_iter = ns.args[2].valueOf() as number;
    var weak_iter = ns.args[3].valueOf() as number;

    while (true) {
        for (let i = 0; i < hack_iter; i++)
            await ns.hack(server);
        for (let i = 0; i < grow_iter; i++)
            await ns.grow(server);
        for (let i = 0; i < weak_iter; i++)
            await ns.weaken(server);
    }
}