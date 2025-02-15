import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";
import { get_server_path } from "./lib/scan";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['m', false],     // Manage the game automatically
        ['tor', false],   // Buy the TOR router
        ['str', 0],      // Train strength
        ['def', 0],      // Train defense
        ['dex', 0],      // Train dexterity
        ['agi', 0],      // Train agility
        ['train', 30],    // Train everything
        ['rep', ''],      // Gain reputation
        ['work', 'hacking'],
        ['backdoor', false], // Backdoor the various special servers
        ['cave', false],     // Exit the cave
        ['install', false],  // Install augments
        ['donate', ''],   // Donate to a faction
    ] as Schema
    const [flags,] = await init_script(ns, arg_schema)

    ns.disableLog("asleep")

    if (flags.tor) {
        while (!ns.singularity.purchaseTor())
            await ns.asleep(1000)
        return
    }
    if (flags.train) {
        flags.str = flags.train
        flags.def = flags.train
        flags.dex = flags.train
        flags.agi = flags.train
    }
    if (flags.str) {
        const target = flags.str as number
        if (ns.getPlayer().skills.strength < target) {
            ns.singularity.gymWorkout('Powerhouse Gym', 'Strength')
            while (ns.getPlayer().skills.strength < target)
                await ns.asleep(1000)
        }
    }
    if (flags.def) {
        const target = flags.def as number
        if (ns.getPlayer().skills.defense < target) {
            ns.singularity.gymWorkout('Powerhouse Gym', 'Defense')
            while (ns.getPlayer().skills.defense < target)
                await ns.asleep(1000)
        }
    }
    if (flags.dex) {
        const target = flags.dex as number
        if (ns.getPlayer().skills.dexterity < target) {
            ns.singularity.gymWorkout('Powerhouse Gym', 'Dexterity')
            while (ns.getPlayer().skills.dexterity < target)
                await ns.asleep(1000)
        }
    }
    if (flags.agi) {
        const target = flags.agi as number
        if (ns.getPlayer().skills.agility < target) {
            ns.singularity.gymWorkout('Powerhouse Gym', 'Agility')
            while (ns.getPlayer().skills.agility < target)
                await ns.asleep(1000)
        }
    }
    if (flags.rep) {
        const faction = flags.rep as string
        if (flags.work != 'hacking' && flags.work != 'field' && flags.work != 'security')
            return
        const work = flags.work as 'hacking' | 'field' | 'security'

        const owned = ns.singularity.getOwnedAugmentations(true)
        let goal = 0
        ns.tprint('Augmentations')
        ns.tprint('=============')
        for (const name of ns.singularity.getAugmentationsFromFaction(faction)) {
            if (!owned.includes(name)) {
                const repgoal = ns.singularity.getAugmentationRepReq(name)
                ns.tprint(`  ${name}, ${repgoal}`)
                if (repgoal > goal)
                    goal = repgoal
            }
        }
        ns.singularity.workForFaction(faction, work)
        while (ns.singularity.getFactionRep(faction) < goal) {
            await ns.asleep(60000)
        }
    }
    if (flags.backdoor) {
        await backdoor_server(ns, 'CSEC')
        await backdoor_server(ns, 'avmnite-02h')
        await backdoor_server(ns, 'I.I.I.I')
        await backdoor_server(ns, 'run4theh111z')
        return
    }
    if (flags.cave) {
        await backdoor_server(ns, 'w0r1d_d43m0n')
        return
    }
    if (flags.install) {
        while (ns.singularity.upgradeHomeCores()) { /* intentionally empty */ }
        while (ns.singularity.upgradeHomeRam()) { /* intentionally empty */ }
        ns.singularity.installAugmentations("start.js")
    }
    if (flags.donate) {
        const faction = flags.donate as string
        for (let i = 0; i < 60; i++) {
            ns.singularity.donateToFaction(faction, ns.getPlayer().money)
            await ns.asleep(1000)
        }
        return
    }

    ns.singularity.commitCrime('Mug')
}

async function backdoor_server(ns: NS, target: string): Promise<boolean> {
    if (ns.getServer(target).backdoorInstalled)
        return true

    const hack_needed = ns.getServerRequiredHackingLevel(target)
    if (hack_needed > ns.getPlayer().skills.hacking) {
        ns.tprint(`Required level to backdoor ${target} = ${hack_needed}`)
        return false
    }

    ns.singularity.connect('home')
    for (const name of get_server_path(ns, target)) {
        ns.singularity.connect(name)
    }
    await ns.singularity.installBackdoor()
    ns.singularity.connect('home')
    return true
}