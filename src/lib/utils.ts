import { ScriptArg } from "@ns";
import { ns, set_global_ns } from "./types";
import { NS } from "@ns";

export type FlagsType = { [x: string]: any; string: ScriptArg }
export function init_script(ns: NS, schema: Schema = []): [FlagsType, ScriptArg[]] {
    set_global_ns(ns)
    return parse_args(schema)
}

export function delay(ms: number) {
    // Avoiding concurrency issues with NS
    return new Promise(resolve => setTimeout(resolve, ms));
}

export type SchemaValue = string | number | boolean | string[]
export type Schema = [string, SchemaValue][]
export function parse_args(schema: Schema = []): [{ string: ScriptArg }, ScriptArg[]] {
    var flags = ns.flags(schema)
    const args = flags["_"] as string[]
    delete flags["_"]
    return [flags as { string: ScriptArg }, args]
}