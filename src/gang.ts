import { NS } from "@ns";
import * as gang from "./lib/gang";
import { init_script, Schema } from "./lib/utils";

export async function main(ns: NS) {
    const arg_schema = [
        ['thack', false], // Train hacking
        ['tcom', false],  // Train combat
        ['tcha', false],  // Train charisma
        ['mug', false],   // Mug people
        ['m', false],     // Manage the gang automatically
        ['traf', false],  // Traffick arms
        ['terr', false],  // Terrorism
        ['vig', false],   // Vigilante
        ['war', false],   // Warfare
        ['a', false],     // Ascend
        ['i', false],     // Buy items
    ] as Schema
    const [flags,] = await init_script(ns, arg_schema)

    ns.disableLog("ALL")
    if (flags.m) {
        await gang.manage(ns);
    }
    else if (flags.thack) {
        set_task(ns, "Train Hacking")
    }
    else if (flags.tcom) {
        set_task(ns, "Train Combat")
    }
    else if (flags.tcha) {
        set_task(ns, "Train Charisma")
    }
    else if (flags.traf) {
        set_task(ns, "Traffick Illegal Arms")
    }
    else if (flags.terr) {
        set_task(ns, "Terrorism")
    }
    else if (flags.vig) {
        set_task(ns, "Vigilante Justice")
    }
    else if (flags.mug) {
        set_task(ns, "Mug People")
    }
    else if (flags.war) {
        ns.gang.setTerritoryWarfare(false)
        set_task(ns, "Territory Warfare")
    }
    else if (flags.a) {
        for (const name of ns.gang.getMemberNames()) {
            ns.gang.ascendMember(name)
        }
    }
    else if (flags.i) {
        for (const item of ns.gang.getEquipmentNames()) {
            for (const name of ns.gang.getMemberNames()) {
                ns.gang.purchaseEquipment(name, item)
            }
        }
    }
    const other = ns.gang.getOtherGangInformation()
    let do_war = true
    for (const name of Object.keys(other)) {
        const chance = ns.gang.getChanceToWinClash(name)
        if (chance < 0.6)
            do_war = false
    }
    if (do_war && !flags.war)
        ns.gang.setTerritoryWarfare(true)
}

function set_task(ns: NS, task_name: string) {
    for (const name of ns.gang.getMemberNames()) {
        ns.gang.setMemberTask(name, task_name)
    }
}