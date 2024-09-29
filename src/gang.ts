import { NS } from "@ns";
import * as gang from "./lib/gang";
import * as ui from "./lib/ui";
import { delay, init_script } from "./lib/utils";

export async function main(ns: NS) {
    init_script(ns)
    ns.disableLog("ALL")
    // gang.manage();

    ns.tprint(ns.getPlayer())
    return

    while (true)
        await delay(5000)
}