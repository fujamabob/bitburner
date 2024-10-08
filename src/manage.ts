import { NS } from "@ns";
import { init_script } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    await init_script(ns)
}
