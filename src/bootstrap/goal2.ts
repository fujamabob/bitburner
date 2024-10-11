import { NS } from "@ns";
import { request_money_to, request_skill_to } from "./utils";

export async function main(ns: NS): Promise<void> {
    // Goal #2: Begin Hacknet rollout
    const money_goal = 1020000
    const player = ns.getPlayer()
    if (ns.getServerMaxRam('home') < 16) {
        if (player.money < money_goal) {
            ns.alert(`Current goal: raise $${money_goal}`)
            await request_skill_to(ns, 'dexterity', 30)
            await request_skill_to(ns, 'agility', 30)
            await request_money_to(ns, `City -> The Slums -> Shoplift`, money_goal)
        }
        ns.alert(`City -> Alpha Enterprises -> Upgrade 'home' RAM`)
        while (ns.getServerMaxRam('home') < 16) {
            await ns.asleep(1000)
        }
    }
    ns.spawn('/bootstrap/buy_hacknet.js')
}
