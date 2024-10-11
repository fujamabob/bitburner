import { NS } from "@ns";
import { get_server_list } from "../lib/scan";
import * as root from "../lib/root";

export async function main(ns: NS): Promise<void> {
    // Goal #1: Spin up Mr. Manager
    const money_goal = ns.getPurchasedServerCost(16)
    let player = ns.getPlayer()
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
            ns.alert(`Current goal: raise $${money_goal}`)
            ns.alert(`City -> Powerhouse Gym -> Train Dexterity`)
            while (player.skills.dexterity < 20) {
                await ns.asleep(1000)
                player = ns.getPlayer()
            }
            ns.alert(`City -> Powerhouse Gym -> Train Agility`)
            while (player.skills.agility < 20) {
                await ns.asleep(1000)
                player = ns.getPlayer()
            }
            ns.alert(`City -> The Slums -> Shoplift`)
            while (player.money < money_goal) {
                await ns.asleep(1000)
                player = ns.getPlayer()
            }
            ns.killall('home', true)
        }
    }
    ns.spawn("/bootstrap/buy_manager.js", { spawnDelay: 0 })
}
