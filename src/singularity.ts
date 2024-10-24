import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['m', false],     // Manage the game automatically
        ['tor', false],   // Buy the TOR router
        ['str', 30],      // Train strength
        ['def', 30],      // Train defense
        ['dex', 30],      // Train dexterity
        ['agi', 30],      // Train agility
        ['train', 30],    // Train everything
    ] as Schema
    const [flags,] = await init_script(ns, arg_schema)

    ns.disableLog("asleep")

    if (flags.tor) {
        while (!ns.singularity.purchaseTor())
            await ns.asleep(1000)
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

    ns.singularity.commitCrime('Mug')
}
