import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['m', false],    // Manage in the background
        ['aug', false],  // Purchase augmentations
        ['train', 0],    // Train everything
        ['str', 0],      // Train strength
        ['def', 0],      // Train defense
        ['dex', 0],      // Train dexterity
        ['agi', 0],      // Train agility
        ['crime', ''],   // Commit Crimes
        ['idle', false], // Idle sleeves
        ['shock', false],// Shock recovery
        ['sync', false], // Synchronization
    ] as Schema
    const [flags,] = await init_script(ns, arg_schema)

    if (flags.m) {
        ns.clearLog()
        ns.disableLog('asleep')
        ns.tail()

        for (; ;) {
            await ns.asleep(30000)
        }
    }
    if (flags.aug) {
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            for (const pair of ns.sleeve.getSleevePurchasableAugs(i)) {
                // ns.sleeve.getSleeveAugmentationPrice
                // ns.sleeve.getSleeveAugmentationRepReq
                ns.sleeve.purchaseSleeveAug(i, pair.name)
            }
        }
    }
    if (flags.train) {
        flags.str = flags.train
        flags.def = flags.train
        flags.dex = flags.train
        flags.agi = flags.train
    }
    if (flags.str) {
        const target = flags.str as number
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            if (ns.sleeve.getSleeve(i).skills.strength < target) {
                ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", "str")
                while (ns.sleeve.getSleeve(i).skills.strength < target) {
                    await ns.asleep(1000)
                }
            }
        }
    }
    if (flags.def) {
        const target = flags.def as number
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            if (ns.sleeve.getSleeve(i).skills.defense < target) {
                ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", "def")
                while (ns.sleeve.getSleeve(i).skills.defense < target) {
                    await ns.asleep(1000)
                }
            }
        }
    }
    if (flags.dex) {
        const target = flags.dex as number
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            if (ns.sleeve.getSleeve(i).skills.dexterity < target) {
                ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", "dex")
                while (ns.sleeve.getSleeve(i).skills.dexterity < target) {
                    await ns.asleep(1000)
                }
            }
        }
    }
    if (flags.agi) {
        const target = flags.agi as number
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            if (ns.sleeve.getSleeve(i).skills.agility < target) {
                ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", "agi")
                while (ns.sleeve.getSleeve(i).skills.agility < target) {
                    await ns.asleep(1000)
                }
            }
        }
    }
    if (flags.crime) {
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            ns.sleeve.setToCommitCrime(i, flags.crime)
        }
    }
    if (flags.idle) {
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            ns.sleeve.setToIdle(i)
        }
    }
    else if (flags.shock) {
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            ns.sleeve.setToShockRecovery(i)
        }
    }
    else if (flags.sync) {
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            ns.sleeve.setToSynchronize(i)
        }
    }

    ns.tprint("Sleeve Information")
    ns.tprint("==================")
    for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
        const person = ns.sleeve.getSleeve(i)
        ns.tprint(`Sleeve ${i} info:`)
        ns.tprint(`  city: ${person.city}`)
        ns.tprint(`  memory: ${person.memory}`)
        ns.tprint(`  shock: ${person.shock}`)
        // ns.tprint(`  storedCycles: ${person.storedCycles}`)
        ns.tprint(`  sync: ${person.sync}`)
        // person.mults
        // ns.tprint(`  exp: ${JSON.stringify(person.exp)}`)
        ns.tprint(`  hp: ${JSON.stringify(person.hp)}`)
        ns.tprint(`  skills: ${JSON.stringify(person.skills)}`)
        ns.tprint(`  Augmentations:`)
        for (const name of ns.sleeve.getSleeveAugmentations(i)) {
            ns.tprint(`    ${name}`)
        }
        ns.tprint(`  task: ${JSON.stringify(ns.sleeve.getTask(i))}`)


        // ns.sleeve.setToBladeburnerAction
        // ns.sleeve.setToCompanyWork
        // ns.sleeve.setToFactionWork
        // ns.sleeve.setToUniversityCourse
        // ns.sleeve.travel
    }
}
