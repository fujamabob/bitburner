import { NS } from "@ns"

export async function request_money_to(ns: NS, alert: string, value: number) {
    let player = ns.getPlayer()
    ns.alert(alert)
    while (player.money < value) {
        await ns.asleep(1000)
        player = ns.getPlayer()
    }
}

export async function request_skill_to(ns: NS, skill: string, value: number) {
    let player = ns.getPlayer()
    type SkillsKey = keyof typeof player.skills
    if (player.skills[skill as SkillsKey] < value) {
        ns.alert(`City -> Powerhouse Gym -> Train ${skill}`)
        while (player.skills[skill as SkillsKey] < value) {
            await ns.asleep(1000)
            player = ns.getPlayer()
        }
    }
}