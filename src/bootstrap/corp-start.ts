import { NS } from "@ns";
import { init_script, Schema } from "/lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['index', 0]
    ] as Schema
    const [flags,] = await init_script(ns, arg_schema)
    ns.spawn('/bootstrap/corp-1.js', { spawnDelay: 10, ramOverride: 26 }, '--index', `${flags.index}`)
}

