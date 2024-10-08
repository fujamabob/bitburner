import { ScriptArg } from "@ns";
import { NS } from "@ns";

export type FlagsType = { [x: string]: unknown; string: ScriptArg }
export async function init_script(ns: NS, schema: Schema = []): Promise<[FlagsType, ScriptArg[]]> {
    return parse_args(ns, schema)
}

export function delay(ms: number) {
    // Avoiding concurrency issues with NS
    return new Promise(resolve => setTimeout(resolve, ms));
}

export type SchemaValue = string | number | boolean | string[]
export type Schema = [string, SchemaValue][]
export function parse_args(ns: NS, schema: Schema = []): [{ string: ScriptArg }, ScriptArg[]] {
    const flags = ns.flags(schema)
    const args = flags["_"] as string[]
    delete flags["_"]
    return [flags as { string: ScriptArg }, args]
}