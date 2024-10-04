import { NS } from "@ns";
import { manage } from "./lib/crack";
import { init_script } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    await init_script(ns)
    for (; ;) {
        await manage()
    }
}
