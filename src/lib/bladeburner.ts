import { NS } from "@ns"

export async function take_tracking_contracts(ns: NS) {
    await take_contract(ns, "Tracking")
}

export async function take_bounty_hunter_contracts(ns: NS) {
    await take_contract(ns, "Bounty Hunter")
}

export async function take_retirement_contracts(ns: NS) {
    await take_contract(ns, "Retirement")
}

async function take_contract(ns: NS, contract: "Tracking" | "Bounty Hunter" | "Retirement", min_success = 0.8) {
    ns.print(`Looking for contracts for ${contract}`)
    for (; ;) {
        const [low_chance,] = ns.bladeburner.getActionEstimatedSuccessChance("Contracts", contract)
        if (low_chance < min_success) {
            return
        }
        if (ns.bladeburner.getActionCountRemaining("Contracts", contract) < 5)
            return

        if (ns.bladeburner.getCurrentAction()?.name != contract) {
            ns.bladeburner.startAction("Contracts", contract)
        }
        await ns.asleep(30000)
    }
}

export async function regain_stamina(ns: NS) {
    for (; ;) {
        ns.bladeburner.startAction("General", "Field Analysis")
        await ns.asleep(30000)
        const [stam, max_stam] = ns.bladeburner.getStamina()
        if (stam == max_stam)
            break;
    }
}