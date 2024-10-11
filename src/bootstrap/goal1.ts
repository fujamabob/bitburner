import { NS } from "@ns";
import { get_server_list } from "../lib/scan";
import * as root from "../lib/root";
import { request_money_to, request_skill_to } from "./utils";

export async function main(ns: NS): Promise<void> {
    // Goal #1: Spin up Mr. Manager
    const money_goal = ns.getPurchasedServerCost(16)
    const player = ns.getPlayer()
    if (!ns.serverExists('mr_manager')) {
        if (player.money < money_goal) {
            for (const name of get_server_list(ns)) {
                if (root.hack_server(ns, name)) {
                    ns.toast(`Successfully hacked ${name}`)
                    ns.scp("/bootstrap/hack.js", name, "home")
                    ns.exec("/bootstrap/hack.js", name, { threads: ns.getServerMaxRam(name) / 2 })
                }
            }
            ns.exec('/bootstrap/hack.js', 'home', { threads: Math.floor((ns.getServerMaxRam('home') - ns.getServerUsedRam('home')) / 2) }, 'n00dles')
            ns.alert(`Current goal: raise $${money_goal} to spin up Mr. Manager.`)
            await request_skill_to(ns, 'dexterity', 20)
            await request_skill_to(ns, 'agility', 20)
            await request_money_to(ns, 'City -> The Slums -> Shoplift', money_goal)
            ns.killall('home', true)
        }
    }
    ns.spawn("/bootstrap/buy_manager.js", { spawnDelay: 0 })
}
