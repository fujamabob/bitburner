import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";
import { regain_stamina, take_tracking_contracts } from "./lib/bladeburner";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['m', false], // Manage in the background
    ] as Schema
    const [flags,] = await init_script(ns, arg_schema)

    if (flags.m) {
        ns.clearLog()
        ns.disableLog('asleep')
        ns.tail()

        for (; ;) {
            await take_tracking_contracts(ns)
            await regain_stamina(ns)
            await ns.asleep(10000)
        }
    }

    ns.tprint('Action names:')
    for (const name of ns.bladeburner.getGeneralActionNames()) {
        ns.tprint(`  ${name}`)
    }
    ns.tprint('Contract names:')
    for (const name of ns.bladeburner.getContractNames()) {
        ns.tprint(`  ${name}`)
    }
}

// ns.bladeburner.getActionAutolevel
// ns.bladeburner.getActionCountRemaining
// ns.bladeburner.getActionCurrentLevel
// ns.bladeburner.getActionCurrentTime
// ns.bladeburner.getActionEstimatedSuccessChance
// ns.bladeburner.getActionMaxLevel
// ns.bladeburner.getActionRepGain
// ns.bladeburner.getActionSuccesses
// ns.bladeburner.getActionTime

// ns.bladeburner.getBlackOpNames
// ns.bladeburner.getBlackOpRank

// ns.bladeburner.getBonusTime
// ns.bladeburner.getCity
// ns.bladeburner.getCityChaos
// ns.bladeburner.getCityCommunities
// ns.bladeburner.getCityEstimatedPopulation
// ns.bladeburner.getContractNames
// ns.bladeburner.getCurrentAction
// ns.bladeburner.getGeneralActionNames
// ns.bladeburner.getNextBlackOp
// ns.bladeburner.getOperationNames
// ns.bladeburner.getRank
// ns.bladeburner.getSkillLevel
// ns.bladeburner.getSkillNames
// ns.bladeburner.getSkillPoints
// ns.bladeburner.getSkillUpgradeCost

// ns.bladeburner.getStamina
// ns.bladeburner.getTeamSize

// ns.bladeburner.inBladeburner
// ns.bladeburner.joinBladeburnerDivision
// ns.bladeburner.joinBladeburnerFaction
// ns.bladeburner.nextUpdate
// ns.bladeburner.setActionAutolevel
// ns.bladeburner.setActionLevel
// ns.bladeburner.setTeamSize
// ns.bladeburner.startAction
// ns.bladeburner.stopBladeburnerAction
// ns.bladeburner.switchCity
// ns.bladeburner.upgradeSkill
