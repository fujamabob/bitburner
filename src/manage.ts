import { NS } from "@ns";
import { get_server_list } from "lib/scan";
import { has_root } from "lib/root";
import { is_locked } from "lib/lock";
import { set_global_ns } from "/lib/types";
import * as hack from "/lib/hack";
import * as hacknet from "/lib/hacknet";
import * as crack from "/lib/crack";
import * as servers from "/lib/owned_server"
import { max_share, share } from "/lib/share";
import { init_script, Schema } from "./lib/utils";

export async function main(ns: NS) {
    const arg_schema = [
        ['r', false], // Restart everything
    ] as Schema
    const [flags, args] = init_script(ns, arg_schema)
    ns.clearLog();
    ns.disableLog("ALL");

    if (flags.r) {
        for (let server of get_server_list(ns, "home", has_root)) {
            ns.killall(server)
        }
    }

    crack.manage()
    hacknet.manage(0.05)
    servers.manage("fixer")

    while (true) {
        if (is_locked(ns, "manage")) {
            ns.asleep(1000);
            continue
        }

        await manage_other_servers(ns)
        await manage_home(ns)
        await manage_my_servers(ns)
        await ns.asleep(1000);
    }
}

async function manage_home(ns: NS) {
    const max_ram = ns.getServerMaxRam("home")
    const usable_ram = max_ram - 16 // Saving some for manual work
    share("home")
    for (let server of get_server_list(ns, "home", has_root)) {
        var used_ram = ns.getServerUsedRam("home")
        if (used_ram >= usable_ram)
            return

        const strategy = new hack.FixHackStrategy(server, usable_ram - used_ram)
        if (strategy.is_valid())
            strategy.execute("home")
    }
}

async function manage_my_servers(ns: NS) {
    for (let target of ns.getPurchasedServers()) {
        share(target)
        const available_ram = ns.getServerMaxRam(target) - ns.getServerUsedRam(target)
        if (available_ram < 16)
            continue
        var winner = {
            strategy: null as hack.HackStrategy,
            money: 0
        }
        for (let server of get_server_list(ns, "home", has_root)) {
            var strategy = new hack.SustainableHackStrategy(server, available_ram)
            // strategy.get_info().print()
            var money = strategy.get_info().expected_money_per_s
            if (money > winner.money && strategy.is_valid()) {
                winner.strategy = strategy
                winner.money = money
            }
        }
        if (winner.strategy != null) {
            if (winner.strategy.is_valid()) {
                ns.print(`Attempting to execute sustainably hack ${winner.strategy.target_server} from ${target}`)
                winner.strategy.execute(target)
            }
        }
        else {
            for (let server of get_server_list(ns, "home", has_root)) {
                var fix = new hack.FixHackStrategy(server, available_ram)
                if (fix.found_solution) {
                    ns.print(`Attempting to fix up ${server} from ${target}`)
                    fix.execute(target)
                    break
                }

            }
        }
    }
}

async function manage_other_servers(ns: NS) {
    var my_servers = ns.getPurchasedServers()
    for (let server of get_server_list(ns, "home", has_root)) {
        var server_ram = ns.getServerMaxRam(server)
        if (my_servers.includes(server))
            continue

        if (server_ram == 0)
            continue

        if (ns.getServerMaxMoney(server) <= 0) {
            max_share(server)
            continue
        }
        share(server)

        var available_ram = ns.getServerMaxRam(server) - ns.getServerUsedRam(server)
        if (available_ram >= 4) {
            var strategy = new hack.SustainableHackStrategy(server, server_ram)
            if (strategy.is_valid()) {
                ns.print(`Running sustainable hack on ${server}: ${strategy}`)
                strategy.execute(server)
            }
            var available_ram = server_ram - ns.getServerUsedRam(server)
            var strategy2 = new hack.SmallHackStrategy(server, available_ram, 1)
            if (strategy2.is_valid()) {
                ns.print(`Running small hack on ${server}: ${strategy2}`)
                strategy2.execute(server)
            }
            var available_ram = server_ram - ns.getServerUsedRam(server)
            var strategy3 = new hack.FixHackStrategy(server, available_ram)
            if (strategy3.is_valid()) {
                ns.print(`Running fix hack on ${server}: ${strategy3}`)
                strategy3.execute(server)
            }
        }
    }
}