import { NS } from "@ns";
import { DARK_PLUS_THEME, GameUI } from "./lib/free/ui";

export async function main(ns: NS): Promise<void> {
    // Requirement #1: Rule of Cool
    const ui = new GameUI(ns)
    ui.set_theme(DARK_PLUS_THEME)
    ns.disableLog("asleep")

    ns.spawn("/bootstrap/goal1.js", { spawnDelay: 0 })
}
